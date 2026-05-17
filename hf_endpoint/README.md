---
license: gemma
tags:
  - gemma-4
  - audio
  - automatic-speech-recognition
  - translation
---

# CareBridge Gemma 4 Audio Handler

Custom Hugging Face Inference Endpoint handler for CareBridge voice intake.

It loads `google/gemma-4-E2B-it`, accepts a short audio clip plus prompt, and returns JSON with:

- `originalText`
- `englishText`

