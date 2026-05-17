# Gemma 4 Audio Runtime Notes

## Summary

Gemma 4 E2B audio works locally through Ollama, but it is awkward to run as a simple hosted API today.

The production demo keeps the voice UI as a visible affordance, but online voice transcription is disabled. Patient name and ID fields do not expose voice controls.

For a reliable public demo, the safer architecture is:

1. Use a mature hosted speech-to-text service for browser audio.
2. Send the transcript to Gemma 4 text for bilingual clinical cleanup.
3. Store only the English clinical text for the nurse dashboard while showing original + English to the patient.

## Local Ollama Result

Local model:

```text
gemma4:e2b
```

`ollama show gemma4:e2b` reports these capabilities:

```text
completion
vision
audio
tools
thinking
```

Important API detail: Ollama currently accepts Gemma 4 audio through the `images` field, not an `audios` field.

Working local request shape:

```json
{
  "model": "gemma4:e2b",
  "messages": [
    {
      "role": "user",
      "content": "Transcribe this audio. Return only the transcription.",
      "images": ["<base64 WAV audio>"]
    }
  ],
  "stream": false,
  "options": {
    "temperature": 0
  }
}
```

Test result with a known speech sample:

```text
he hoped there would be stewed dinner turnips and carrots and bruised potatoes and fat mutton pieces to be laid out in thick peppered flour fat and sauce
```

Notes:

- WAV worked.
- FLAC sent directly to Ollama returned `image: unknown format`.
- A silent tone WAV correctly returned `NO_SPEECH`.

## Online Demo Behavior

The Vercel demo intentionally disables voice transcription while keeping the voice button visible on clinical free-text fields. This avoids showing a feature that can return unstable hosted results.

Identity fields are typed/scanned only:

- Full name: no voice button.
- ID number: no voice button.

Clinical free-text fields may show a disabled voice button to indicate the intended workflow without calling the hosted transcription path.

## Hosted Hugging Face Result

The default Hugging Face Inference Endpoint image is not yet a clean fit for Gemma 4 E2B audio:

- Default Transformers did not recognize `model_type: gemma4`.
- Gemma 4 audio required newer runtime pieces including source Transformers and newer PyTorch.
- Runtime-upgrading PyTorch inside the default endpoint toolkit caused import conflicts.

A Docker Space can run the right stack, and public URL audio can transcribe correctly. Browser-uploaded audio still needs careful format normalization before Gemma 4 reliably consumes it. This makes the hosted route slower and more fragile than a normal speech-to-text API.

## Recommendation

For the hackathon/demo:

- Document Gemma 4 audio as locally validated through Ollama.
- Keep online voice transcription disabled unless the hosted runtime is stabilized.
- Use hosted speech-to-text for the public Vercel demo if reliability matters.
- Keep Gemma 4 in the clinical text translation/normalization step, where the hosted API is much simpler and more stable.
