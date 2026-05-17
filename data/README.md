# Data Directory

This directory contains the small public-facing reference index used by the demo.

## Included

- `rag_reference_cases.json`

This file is a compact, auditable demo index for the nurse portal's `CTAS*` historical evidence feature.

## Source

The reference cases are based on patterns from the public Kaggle dataset:

- **Emergency Service - Triage Application**
- <https://www.kaggle.com/datasets/ilkeryildiz/emergency-service-triage-application>

The source label is expert / true KTAS. KTAS is used only as a public five-level triage proxy for historical retrieval evidence.

## Not Included

Large raw datasets are not committed to this repository. To rebuild a larger local index, download the Kaggle CSV and run:

```bash
python scripts/build_rag_reference_cases.py \
  --input /path/to/ktas.csv \
  --output data/rag_reference_cases.generated.json \
  --limit 250
```
