# CTAS* RAG Evidence Layer

CareBridge uses a **RAG-inspired historical confirmation layer** in the nurse portal.

The important safety boundary is:

1. **Gemma 4 extracts facts** from multilingual patient intake.
2. **The CTAS-aligned rules engine assigns the triage level** using deterministic modifiers.
3. **The RAG evidence layer searches similar labeled historical cases** and shows them to the nurse.
4. **The nurse reviews, confirms, or overrides.**

RAG is not allowed to assign the final level. It only explains why the level is historically plausible.

## What `CTAS*` Means

`CTAS 2` means the deterministic rules engine assigned level 2.

`CTAS 2*` means:

- the deterministic rules engine assigned level 2, and
- the RAG evidence layer found similar historical cases with the same five-level acuity label.

The star is a transparency marker for the nurse dashboard.

## Data Source

The public repository uses a small auditable reference index in:

- [`data/rag_reference_cases.json`](../data/rag_reference_cases.json)

The index is based on the public Kaggle dataset:

- **Emergency Service - Triage Application**
- URL: <https://www.kaggle.com/datasets/ilkeryildiz/emergency-service-triage-application>
- Label: expert / true KTAS
- Public dataset descriptions report 1,267 adult ED records, 24 variables, and expert KTAS labels determined by three triage specialists.

KTAS is the Korean Triage and Acuity Scale. It is a five-level emergency triage scale developed from the same family of thinking as CTAS. For this project, KTAS is used only as a **public historical proxy dataset** because official Canadian CTAS case-level datasets are not openly available for student demos.

We do not claim the Kaggle KTAS dataset is official Canadian CTAS data.

## Implementation Files

- [`src/ragEvidence.js`](../src/ragEvidence.js): searchable historical-case index and matching functions.
- [`api/triage.js`](../api/triage.js): serverless API that returns `ragEvidence` alongside Gemma extraction and CTAS rules.
- [`src/App.jsx`](../src/App.jsx): nurse portal display for `RAG evidence` and `CTAS*`.
- [`scripts/build_rag_reference_cases.py`](../scripts/build_rag_reference_cases.py): reproducible helper for generating a JSON index from a downloaded KTAS CSV.

## Matching Method

The current demo uses transparent keyword/signal matching:

- complaint category
- pain location
- pain quality
- onset
- focused answer
- red flags
- history and allergies
- extracted structured facts from Gemma 4

Each historical case receives:

- one point per matching clinical signal
- a bonus when the historical acuity level equals the CTAS-aligned rule output

The top matches are shown to the nurse.

This simple method is intentional for the hackathon:

- It is auditable.
- It is easy for students to explain.
- It avoids hidden embeddings or opaque similarity scores.
- It keeps the final triage decision rule-based.

## API Shape

`POST /api/triage` returns:

```json
{
  "structured": {
    "chiefComplaint": "Chest",
    "symptoms": ["Chest", "Pressure spreading to arm or jaw"],
    "redFlags": ["difficulty breathing"]
  },
  "ctas": {
    "level": 2,
    "title": "Emergent",
    "modifiersApplied": ["Chest pain with high-risk features."]
  },
  "ragEvidence": {
    "label": "CTAS 2*",
    "historicalSupport": true,
    "matches": [
      {
        "id": "KTAS-1187",
        "sourceScale": "KTAS",
        "ctas": 2,
        "complaint": "Chest pain",
        "summary": "Adult chest pressure with arm radiation and breathing concern was treated as emergent."
      }
    ]
  }
}
```

## Safety Boundary

The RAG layer must never output:

- medical advice to the patient
- a final diagnosis
- a replacement for nurse review
- an override of CTAS rules

It only provides historical evidence for humans.
