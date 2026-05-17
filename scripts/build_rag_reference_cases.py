#!/usr/bin/env python3
"""Build a small CTAS* RAG reference index from a public KTAS CSV.

This script is intentionally simple and auditable for the Kaggle Gemma 4 Good
Hackathon repository. It does not train a model. It converts labeled historical
triage rows into a compact JSON index that CareBridge can search for nurse-facing
confirmation evidence.

Expected source:
  Kaggle dataset: Emergency Service - Triage Application
  https://www.kaggle.com/datasets/ilkeryildiz/emergency-service-triage-application

Usage:
  python scripts/build_rag_reference_cases.py \
    --input /path/to/ktas.csv \
    --output data/rag_reference_cases.generated.json \
    --limit 250

The script accepts several common column names because public CSV exports often
use slightly different headers.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


COLUMN_ALIASES = {
    "expert_ktas": ["KTAS_expert", "KTAS expert", "true_ktas", "expert_ktas", "ktas_expert", "ktas"],
    "chief_complaint": ["Chief_complain", "chief_complaint", "complaint", "cc", "presenting_complaint"],
    "age": ["Age", "age"],
    "sex": ["Sex", "sex", "gender"],
    "pain_score": ["NRS_pain", "Pain", "pain_score", "nrs_pain"],
    "mental": ["Mental", "mental", "mental_status"],
    "arrival_mode": ["Arrival mode", "arrival_mode", "arrivalmode"],
    "sbp": ["SBP", "sbp", "triage_vital_sbp"],
    "dbp": ["DBP", "dbp", "triage_vital_dbp"],
    "hr": ["HR", "hr", "triage_vital_hr"],
    "rr": ["RR", "rr", "triage_vital_rr"],
    "spo2": ["Saturation", "spo2", "triage_vital_o2"],
    "temp_c": ["BT", "temp_c", "triage_vital_temp"],
}


def pick_column(df: pd.DataFrame, logical_name: str) -> str | None:
    for candidate in COLUMN_ALIASES[logical_name]:
        if candidate in df.columns:
            return candidate
    return None


def clean_value(value) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip()


def row_to_case(row: pd.Series, cols: dict[str, str | None], idx: int) -> dict:
    complaint = clean_value(row.get(cols["chief_complaint"], "")) if cols["chief_complaint"] else "Unknown complaint"
    ktas = int(float(row.get(cols["expert_ktas"]))) if cols["expert_ktas"] else 0
    age = clean_value(row.get(cols["age"], "")) if cols["age"] else ""
    sex = clean_value(row.get(cols["sex"], "")) if cols["sex"] else ""
    pain = clean_value(row.get(cols["pain_score"], "")) if cols["pain_score"] else ""
    mental = clean_value(row.get(cols["mental"], "")) if cols["mental"] else ""
    arrival = clean_value(row.get(cols["arrival_mode"], "")) if cols["arrival_mode"] else ""

    symptoms = [complaint, f"pain {pain}" if pain else "", mental, arrival]
    vitals = {
        "sbp": clean_value(row.get(cols["sbp"], "")) if cols["sbp"] else "",
        "dbp": clean_value(row.get(cols["dbp"], "")) if cols["dbp"] else "",
        "hr": clean_value(row.get(cols["hr"], "")) if cols["hr"] else "",
        "rr": clean_value(row.get(cols["rr"], "")) if cols["rr"] else "",
        "spo2": clean_value(row.get(cols["spo2"], "")) if cols["spo2"] else "",
        "temp_c": clean_value(row.get(cols["temp_c"], "")) if cols["temp_c"] else "",
    }

    summary_parts = [
        f"{age}-year-old" if age else "Adult",
        sex,
        f"presenting with {complaint}",
        f"pain score {pain}" if pain else "",
        f"mental status {mental}" if mental else "",
        f"arrival by {arrival}" if arrival else "",
    ]
    summary = " ".join(part for part in summary_parts if part).strip() + "."

    return {
        "id": f"KTAS-SRC-{idx:04d}",
        "sourceScale": "KTAS",
        "ctas": ktas,
        "complaint": complaint,
        "symptoms": [item for item in symptoms if item],
        "vitals": vitals,
        "summary": summary,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to the downloaded Kaggle KTAS CSV.")
    parser.add_argument("--output", required=True, help="Where to write the generated JSON index.")
    parser.add_argument("--limit", type=int, default=250, help="Maximum rows to include in the compact demo index.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    df = pd.read_csv(input_path)
    cols = {name: pick_column(df, name) for name in COLUMN_ALIASES}

    if cols["expert_ktas"] is None:
        raise SystemExit("Could not find an expert KTAS column. Check COLUMN_ALIASES in this script.")

    cases = []
    for idx, (_, row) in enumerate(df.head(args.limit).iterrows(), start=1):
        case = row_to_case(row, cols, idx)
        if 1 <= case["ctas"] <= 5:
            cases.append(case)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(
            {
                "name": "Generated CareBridge CTAS* RAG Reference Cases",
                "source": "Kaggle Emergency Service - Triage Application",
                "sourceUrl": "https://www.kaggle.com/datasets/ilkeryildiz/emergency-service-triage-application",
                "boundary": "KTAS is used as a public five-level triage proxy for historical retrieval evidence, not as final Canadian CTAS authority.",
                "cases": cases,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print(f"Wrote {len(cases)} cases to {output_path}")


if __name__ == "__main__":
    main()
