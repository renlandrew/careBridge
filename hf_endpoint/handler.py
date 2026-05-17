import base64
import json
import os
import re
import subprocess
import sys
import tempfile


MODEL_ID = os.environ.get("MODEL_ID", "google/gemma-4-E2B-it")
TRANSFORMERS_SOURCE_URL = os.environ.get(
    "TRANSFORMERS_SOURCE_URL",
    "https://github.com/huggingface/transformers/archive/refs/heads/main.zip",
)


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


def _extract_prompt_and_audio(data):
    messages = data.get("inputs") or data.get("messages") or []
    prompt = ""
    audio_data_url = ""

    for message in messages:
        for part in message.get("content", []):
            if part.get("type") == "text":
                prompt = part.get("text", prompt)
            if part.get("type") == "audio":
                audio_data_url = part.get("audio") or part.get("url") or audio_data_url

    if not audio_data_url and data.get("audioBase64"):
        mime_type = data.get("mimeType") or "audio/webm"
        audio_data_url = f"data:{mime_type};base64,{data['audioBase64']}"

    if not prompt:
        prompt = (
            "Transcribe this patient speech, then translate it to concise clinical English. "
            "Return JSON only with originalText and englishText."
        )

    return prompt, audio_data_url


def _data_url_to_file(data_url):
    if not data_url:
        raise ValueError("Missing audio content.")

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


def _purge_transformers_modules():
    for name in list(sys.modules):
        if (
            name == "transformers"
            or name.startswith("transformers.")
            or name == "huggingface_hub"
            or name.startswith("huggingface_hub.")
            or name == "torch"
            or name.startswith("torch.")
        ):
            del sys.modules[name]


def _load_gemma4_transformers():
    def import_classes():
        from transformers import AutoConfig, AutoProcessor

        AutoConfig.from_pretrained(MODEL_ID)
        try:
            from transformers import AutoModelForMultimodalLM

            return AutoProcessor, AutoModelForMultimodalLM
        except ImportError:
            from transformers import AutoModelForImageTextToText

            return AutoProcessor, AutoModelForImageTextToText

    try:
        return import_classes()
    except Exception:
        subprocess.check_call(
            [
                sys.executable,
                "-m",
                "pip",
                "install",
                "--upgrade",
                "--no-cache-dir",
                "huggingface_hub>=1.1.0",
                TRANSFORMERS_SOURCE_URL,
            ]
        )
        _purge_transformers_modules()
        return import_classes()


class EndpointHandler:
    def __init__(self, path=""):
        AutoProcessor, AutoModel = _load_gemma4_transformers()
        import torch

        dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
        self.processor = AutoProcessor.from_pretrained(MODEL_ID, padding_side="left")
        self.model = AutoModel.from_pretrained(
            MODEL_ID,
            device_map="auto",
            torch_dtype=dtype,
            attn_implementation="sdpa",
        )

    def __call__(self, data):
        prompt, audio_data_url = _extract_prompt_and_audio(data or {})

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "audio", "url": audio_data_url},
                ],
            }
        ]

        try:
            inputs = self.processor.apply_chat_template(
                messages,
                tokenize=True,
                add_generation_prompt=True,
                return_dict=True,
                return_tensors="pt",
            ).to(self.model.device, dtype=self.model.dtype)
        except Exception:
            audio_path = _data_url_to_file(audio_data_url)
            try:
                messages[0]["content"][1] = {"type": "audio", "url": audio_path}
                inputs = self.processor.apply_chat_template(
                    messages,
                    tokenize=True,
                    add_generation_prompt=True,
                    return_dict=True,
                    return_tensors="pt",
                ).to(self.model.device, dtype=self.model.dtype)
            finally:
                try:
                    os.unlink(audio_path)
                except OSError:
                    pass

        input_len = inputs["input_ids"].shape[-1]
        with torch.inference_mode():
            output = self.model.generate(
                **inputs,
                max_new_tokens=int((data or {}).get("max_new_tokens", 240)),
                do_sample=False,
            )

        text = self.processor.decode(output[0][input_len:], skip_special_tokens=True)
        parsed = _parse_json(text)
        return {
            "originalText": str(parsed.get("originalText") or "").strip(),
            "englishText": str(parsed.get("englishText") or parsed.get("originalText") or "").strip(),
            "generated_text": text.strip(),
            "model": MODEL_ID,
        }
