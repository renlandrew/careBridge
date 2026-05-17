import base64
import json
import os
import re
import tempfile
import uuid
from contextlib import asynccontextmanager

import torch
import librosa
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from transformers import AutoProcessor

try:
    from transformers import AutoModelForMultimodalLM as AutoGemmaModel
except ImportError:
    from transformers import AutoModelForImageTextToText as AutoGemmaModel


MODEL_ID = os.environ.get("MODEL_ID", "google/gemma-4-E2B-it")
SPACE_HOST = os.environ.get("SPACE_HOST", "https://renlandrew-carebridge-gemma4-audio-api.hf.space")
AUDIO_DIR = "/tmp/carebridge-audio"
processor = None
model = None


class AudioPayload(BaseModel):
    audioBase64: str | None = None
    mimeType: str | None = "audio/webm"
    sourceLanguage: str | None = "auto"
    inputs: list | None = None
    max_new_tokens: int | None = 240


def _strip_code_fence(text):
    text = str(text or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _parse_json(text):
    raw = _strip_code_fence(text)
    try:
        return json.loads(raw)
    except Exception:
        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return {"originalText": raw, "englishText": raw}


def _extract_prompt_and_audio(payload):
    prompt = ""
    audio_data_url = ""

    for message in payload.inputs or []:
        for part in message.get("content", []):
            if part.get("type") == "text":
                prompt = part.get("text", prompt)
            if part.get("type") == "audio":
                audio_data_url = part.get("audio") or part.get("url") or audio_data_url

    if not audio_data_url and payload.audioBase64:
        mime_type = payload.mimeType or "audio/webm"
        audio_data_url = f"data:{mime_type};base64,{payload.audioBase64}"

    if not audio_data_url:
        raise ValueError("Missing audio content.")

    if not prompt:
        prompt = f"""Transcribe this patient speech, then translate it to concise clinical English for nurse review.

Return one JSON object only, no markdown:
{{
  "originalText": "the user's exact spoken words in the original language",
  "englishText": "concise clinical English translation"
}}

Source language: {payload.sourceLanguage or "auto"}
Do not add medical facts. Do not diagnose."""

    return prompt, audio_data_url


def _data_url_to_file(data_url):
    if data_url.startswith("data:"):
        header, encoded = data_url.split(",", 1)
        mime = header.split(";")[0].replace("data:", "")
    else:
        encoded = data_url
        mime = "audio/webm"

    if "wav" in mime:
        suffix = ".wav"
    elif "aiff" in mime or "aif" in mime:
        suffix = ".aiff"
    elif "mp4" in mime or "m4a" in mime:
        suffix = ".m4a"
    elif "mpeg" in mime or "mp3" in mime:
        suffix = ".mp3"
    elif "ogg" in mime:
        suffix = ".ogg"
    elif "flac" in mime:
        suffix = ".flac"
    else:
        suffix = ".webm"
    audio_bytes = base64.b64decode(encoded)
    handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    handle.write(audio_bytes)
    handle.close()
    return handle.name


def _normalize_audio_file(source_path):
    audio, _ = librosa.load(source_path, sr=16000, mono=True)
    if audio.size < 1600:
        raise ValueError("Audio is too short. Please record at least 2 seconds.")
    stereo_audio = torch.tensor(audio).repeat(2, 1).transpose(0, 1).numpy()
    target_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4().hex}.wav")
    sf.write(target_path, stereo_audio, 16000, subtype="PCM_16")
    return target_path


def _data_url_to_audio_array(data_url):
    source_path = _data_url_to_file(data_url)
    try:
        audio, _ = librosa.load(source_path, sr=16000, mono=True)
    finally:
        try:
            os.unlink(source_path)
        except Exception:
            pass
    if audio.size < 1600:
        raise ValueError("Audio is too short. Please record at least 2 seconds.")
    return audio.reshape(1, -1)


def _build_messages(prompt, audio_data_url):
    return [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "audio", "url": audio_data_url},
            ],
        }
    ]


@asynccontextmanager
async def lifespan(app):
    global processor, model
    dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
    processor = AutoProcessor.from_pretrained(MODEL_ID, padding_side="left")
    model = AutoGemmaModel.from_pretrained(
        MODEL_ID,
        device_map="auto",
        torch_dtype=dtype,
        attn_implementation="sdpa",
    )
    yield


app = FastAPI(lifespan=lifespan)
os.makedirs(AUDIO_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")


@app.get("/")
def root():
    return {"ok": True, "model": MODEL_ID}


@app.get("/health")
def health():
    return {"ok": model is not None, "model": MODEL_ID}


@app.post("/")
def transcribe(payload: AudioPayload):
    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model is still loading.")

    try:
        prompt, audio_data_url = _extract_prompt_and_audio(payload)
        if audio_data_url.startswith("data:"):
            audio_array = _data_url_to_audio_array(audio_data_url)
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "audio"},
                    ],
                }
            ]
            text_prompt = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = processor(
                text=text_prompt,
                audio=audio_array,
                return_tensors="pt",
            ).to(model.device, dtype=model.dtype)
            audio_path = None
        else:
            audio_path = None
            messages = _build_messages(prompt, audio_data_url)
            inputs = processor.apply_chat_template(
                messages,
                tokenize=True,
                add_generation_prompt=True,
                return_dict=True,
                return_tensors="pt",
            ).to(model.device, dtype=model.dtype)

        input_len = inputs["input_ids"].shape[-1]
        with torch.inference_mode():
            output = model.generate(
                **inputs,
                max_new_tokens=payload.max_new_tokens or 240,
                do_sample=False,
            )

        text = processor.decode(output[0][input_len:], skip_special_tokens=True)
        parsed = _parse_json(text)
        return {
            "originalText": str(parsed.get("originalText") or "").strip(),
            "englishText": str(parsed.get("englishText") or parsed.get("originalText") or "").strip(),
            "generated_text": text.strip(),
            "model": MODEL_ID,
            "source": "gemma4_hf_space_audio",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if audio_path:
            try:
                os.unlink(audio_path)
            except Exception:
                pass
