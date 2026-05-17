# CareBridge Triage

CareBridge Triage is an AI-assisted emergency intake app designed to reduce avoidable delays in Canadian emergency departments.

Across Canada, patients often wait hours before being assessed. These delays are caused by many factors, including staffing shortages, language barriers, repeated intake questions, and fragmented queue workflows. One early bottleneck is triage intake: nurses need clear, clinically relevant information before assigning priority.

CareBridge uses Gemma 4 as a multilingual clinical intake engine. Patients can enter symptoms in their preferred language, and Gemma 4 helps translate, normalize, and extract key triage signals such as symptom location, onset, severity, breathing difficulty, loss of consciousness, medical history, allergies, and additional free-text concerns.

The app then turns this information into a structured nurse-facing summary and a CTAS-informed priority suggestion. Cases are sorted by CTAS priority and wait time, while patient updates and missing information requests are highlighted for nurse review.

Gemma 4 does not replace nurses. It supports a human-in-the-loop workflow by reducing repetitive intake work, improving language accessibility, and giving nurses a faster, clearer starting point for clinical judgment.

Technically, CareBridge combines multilingual intake, Gemma 4 text reasoning, CTAS rule logic, and historical case evidence. We also validated Gemma 4 E2B audio locally through Ollama, showing that the model can process speech input. In the online demo, audio transcription is disabled because hosted Gemma 4 audio runtimes are not yet stable enough for a public triage workflow.

Live demo:

- <https://carebridge-vancouver-demo.vercel.app>
- Write-up: <https://carebridge-vancouver-demo.vercel.app/write-up>

## What It Does

1. Patients complete guided multilingual intake prompts.
2. Gemma extracts structured clinical facts as JSON.
3. A deterministic CTAS-aligned rule engine assigns a draft urgency level.
4. A RAG-inspired evidence layer searches similar labeled historical cases.
5. The nurse reviews the CTAS level, modifiers, RAG evidence, and can override with a reason.
6. The nurse can send a focused follow-up question back to the patient kiosk; the patient update re-runs the CTAS modifiers and refreshes the queue.

## Safety Architecture

CareBridge uses a dual-brain design:

| Layer | Role | Does Not Do |
|---|---|---|
| Gemma extraction brain | Converts messy multilingual intake into structured JSON | Diagnose, give medical advice, assign CTAS |
| CTAS-aligned rules brain | Applies transparent acuity modifiers and assigns the draft level | Invent facts or override nurse judgment |
| RAG evidence layer | Shows similar historical cases for nurse review | Decide the level |
| Nurse review | Confirms, downgrades, upgrades, or asks follow-up questions | Blindly accept AI output |

The core safety boundary is:

> Gemma extracts facts. Rules assign the draft triage level. RAG provides context. The nurse remains responsible for review.

## Why Gemma

Gemma is used as the language and structure extraction layer. The server prompt constrains it to:

- accept multilingual or messy patient language,
- extract structured triage facts,
- return JSON only,
- avoid diagnosis,
- avoid medical advice,
- avoid assigning CTAS, KTAS, or ESI.

Implementation:

- [`api/triage.js`](api/triage.js)
- [`api/translate.js`](api/translate.js)

Useful entry points:

- `DEFAULT_GEMMA_MODEL`
- `SYSTEM_PROMPT`
- `callGemmaApi`
- `extractJsonCandidate`
- `evaluateCtas`

## CTAS* and RAG Evidence

The nurse portal displays `CTAS*` when the rule-based level is supported by similar labeled historical cases.

`CTAS 2` means:

- the deterministic CTAS-aligned rule engine assigned level 2.

`CTAS 2*` means:

- the deterministic CTAS-aligned rule engine assigned level 2, and
- the RAG evidence layer found similar historical cases with a matching five-level acuity label.

RAG does not assign the triage level. It gives the nurse historical context and makes the evidence visible.

Detailed documentation:

- [`docs/RAG_CTAS_STAR.md`](docs/RAG_CTAS_STAR.md)

Implementation:

- [`src/ragEvidence.js`](src/ragEvidence.js)
- [`data/rag_reference_cases.json`](data/rag_reference_cases.json)

## Dataset Positioning

Official Canadian CTAS case-level datasets are not publicly available for a student prototype. For open validation and historical-case retrieval, CareBridge uses a public KTAS-labeled dataset as a five-level triage proxy.

Public dataset:

- Kaggle dataset: **Emergency Service - Triage Application**
- URL: <https://www.kaggle.com/datasets/ilkeryildiz/emergency-service-triage-application>
- Label type: expert / true KTAS

KTAS is the Korean Triage and Acuity Scale. CareBridge does **not** claim this is official Canadian CTAS data. It is used as a public, auditable proxy because it has expert-labeled five-level emergency acuity records that judges can independently inspect.

Public descriptions of the dataset report:

- 1,267 adult emergency department records,
- 24 variables,
- records from two Korean emergency departments,
- expert KTAS labels determined by three triage specialists.

Reference-index helper:

- [`scripts/build_rag_reference_cases.py`](scripts/build_rag_reference_cases.py)

## Project Structure

```text
api/triage.js                  Vercel serverless Gemma extraction + CTAS rules
api/translate.js               Gemma text translation/normalization helper
api/audio-to-english.js        Experimental hosted audio endpoint wrapper, disabled in UI
src/App.jsx                    Patient kiosk, nurse dashboard, write-up page
src/ragEvidence.js             CTAS* historical evidence retrieval
data/rag_reference_cases.json  Small public historical-case reference index
docs/RAG_CTAS_STAR.md          RAG/CTAS* explanation and safety boundary
docs/GEMMA4_AUDIO_RUNTIME_NOTES.md
                               Local Ollama audio validation and hosted-runtime notes
scripts/build_rag_reference_cases.py
                               Helper for rebuilding the reference index
vercel.json                    Vercel rewrite for /write-up
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the Vite app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Vercel Deployment

The Vercel demo uses the serverless `/api/triage` endpoint and keeps online voice transcription disabled in the UI.

Required Vercel environment variables:

```text
GOOGLE_API_KEY=your_google_ai_studio_key
GEMMA_MODEL=gemma-4-26b-a4b-it
```

Do **not** use `VITE_GOOGLE_API_KEY`. Environment variables beginning with `VITE_` are exposed to browser code.

For local Vercel-style API testing:

```bash
npm i -g vercel
vercel dev
```

Then open:

```text
http://localhost:3000
```

More deployment notes:

- [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)

## Gemma 4 Audio Note

Gemma 4 E2B audio was validated locally through Ollama with the installed `gemma4:e2b` model. Ollama reports audio capability, and a WAV speech sample successfully transcribed through the local API.

The online demo intentionally disables voice transcription while keeping a disabled voice-control affordance in clinical free-text fields. Patient name and medical-number fields are typed only. Hosted Gemma 4 audio through Hugging Face required custom runtime work and was not stable enough for a public triage workflow.

Details:

- [`docs/GEMMA4_AUDIO_RUNTIME_NOTES.md`](docs/GEMMA4_AUDIO_RUNTIME_NOTES.md)

## What Judges Can Inspect

- Gemma system prompt and API call: [`api/triage.js`](api/triage.js)
- Deterministic CTAS-aligned logic: `evaluateCtas` in [`api/triage.js`](api/triage.js)
- RAG/CTAS* retrieval: [`src/ragEvidence.js`](src/ragEvidence.js)
- Nurse follow-up and override loop: [`src/App.jsx`](src/App.jsx)
- RAG documentation: [`docs/RAG_CTAS_STAR.md`](docs/RAG_CTAS_STAR.md)
- Gemma 4 audio runtime notes: [`docs/GEMMA4_AUDIO_RUNTIME_NOTES.md`](docs/GEMMA4_AUDIO_RUNTIME_NOTES.md)
- Public reference index: [`data/rag_reference_cases.json`](data/rag_reference_cases.json)

## Important Limitations

- CareBridge is a student prototype and hackathon demo.
- It is not a medical device.
- It does not provide diagnosis.
- It does not replace nurse or clinician judgment.
- The CTAS logic is CTAS-aligned, not an official licensed CTAS implementation.
- The RAG reference cases use KTAS as a public proxy, not official Canadian CTAS ground truth.
- The public Vercel demo should use synthetic or demo cases only.

## Medical Disclaimer

CareBridge is for triage workflow research, education, and hackathon demonstration only. It must not be used for real patient care without clinical validation, privacy review, safety testing, clinician governance, and regulatory approval.
