from __future__ import annotations

import importlib.util
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


HOST = "127.0.0.1"
PORT = 8787

CTAS_ENGINE_PATH = Path(r"C:\Users\kennl\OneDrive\Desktop\Kenn Li\formal\Education\ML course not antigrav\ctas proj\ctas_engine.py")
GEMMA_CLIENT_PATH = Path(r"C:\Users\kennl\OneDrive\Desktop\Kenn Li\formal\Education\ML course not antigrav\ctas proj\gemma4_client.py")


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
      raise RuntimeError(f"Unable to load module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ctas_engine = load_module("ctas_engine_external", CTAS_ENGINE_PATH)
gemma_client = load_module("gemma4_client_external", GEMMA_CLIENT_PATH)


def join_values(values: list[str]) -> str:
    return ", ".join(item.strip() for item in values if item and item.strip())


def make_transcript(payload: dict[str, Any]) -> str:
    locations = payload.get("painLocation") or []
    history = payload.get("historyDisplay") or payload.get("history") or []
    allergies = payload.get("allergyDisplay") or payload.get("allergies") or []

    parts = [
        f"Patient name: {payload.get('name') or 'Unknown'}",
        f"Preferred language: {payload.get('preferredLanguage') or 'English'}",
        f"Date of birth: {payload.get('birthDate') or 'Unknown'}",
        f"Pain locations: {join_values(locations) or 'Not specified'}",
        f"Pain score: {payload.get('severity') if payload.get('severity') is not None else 'Unknown'} out of 10",
        f"Onset: {payload.get('onsetDisplay') or payload.get('onset') or 'Unknown'}",
        f"Sensation: {payload.get('painTypeDisplay') or payload.get('painType') or 'Unknown'}",
        f"Focused answer: {payload.get('followUpDisplay') or payload.get('followUpAnswer') or 'Unknown'}",
        f"History: {join_values(history) or 'None reported'}",
        f"Allergies: {join_values(allergies) or 'None reported'}",
        f"Loss of consciousness: {payload.get('lostConsciousness') or 'Unknown'}",
        f"Difficulty breathing: {payload.get('breathingDifficulty') or 'Unknown'}",
        f"Other update: {payload.get('updateOtherDisplay') or payload.get('updateOther') or 'None'}",
    ]
    return ". ".join(parts)


def merge_frontend_facts(extracted: dict[str, Any], payload: dict[str, Any], transcript: str) -> dict[str, Any]:
    pain_score = payload.get("severity")
    symptoms = [item for item in payload.get("painLocation") or [] if item]
    sensation = payload.get("painTypeDisplay") or payload.get("painType")
    onset = payload.get("onsetDisplay") or payload.get("onset")
    follow_up = payload.get("followUpDisplay") or payload.get("followUpAnswer")

    merged = dict(extracted)
    merged["preferredLanguage"] = payload.get("preferredLanguage") or extracted.get("preferredLanguage") or "English"
    merged["sourceText"] = transcript
    merged["chiefComplaint"] = join_values(payload.get("painLocation") or []) or extracted.get("chiefComplaint")
    merged["patientSummary"] = extracted.get("patientSummary") or transcript
    merged["onset"] = onset or extracted.get("onset")
    merged["allergies"] = join_values(payload.get("allergyDisplay") or payload.get("allergies") or []) or extracted.get("allergies")
    merged["notes"] = "\n".join(
        item
        for item in [
            extracted.get("notes"),
            f"Sensation: {sensation}" if sensation else "",
            f"Focused detail: {follow_up}" if follow_up else "",
            f"Loss of consciousness: {payload.get('lostConsciousness')}" if payload.get("lostConsciousness") else "",
            f"Difficulty breathing: {payload.get('breathingDifficulty')}" if payload.get("breathingDifficulty") else "",
            f"Other update: {payload.get('updateOtherDisplay') or payload.get('updateOther')}" if (payload.get("updateOtherDisplay") or payload.get("updateOther")) else "",
        ]
        if item
    )

    merged_symptoms = list(extracted.get("symptoms") or [])
    merged_symptoms.extend(symptoms)
    if sensation:
        merged_symptoms.append(str(sensation))
    if follow_up:
        merged_symptoms.append(str(follow_up))
    merged["symptoms"] = list(dict.fromkeys(item for item in merged_symptoms if item))

    red_flags = list(extracted.get("redFlags") or [])
    if str(payload.get("lostConsciousness")).lower() == "yes":
        red_flags.append("loss of consciousness")
    if str(payload.get("breathingDifficulty")).lower() == "yes":
        red_flags.append("difficulty breathing")
    merged["redFlags"] = list(dict.fromkeys(red_flags))

    vitals = dict(extracted.get("vitals") or {})
    vitals["painScore"] = pain_score
    merged["vitals"] = vitals
    return merged


class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self) -> None:
        self._set_headers(204)

    def do_GET(self) -> None:
        if self.path == "/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({"ok": True}).encode("utf-8"))
            return
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))

    def do_POST(self) -> None:
        if self.path != "/triage":
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        payload = json.loads(raw.decode("utf-8") or "{}")
        transcript = make_transcript(payload)
        preferred_language = payload.get("preferredLanguage") or "English"

        try:
            extracted, raw_model = gemma_client.extract_with_gemma4(
                transcript,
                preferred_language=preferred_language,
                timeout=15,
                retries=1,
            )
            extraction_source = "gemma4"
        except Exception as exc:
            extracted = ctas_engine.fallback_extraction(transcript, preferred_language=preferred_language)
            raw_model = f"fallback_extraction_used: {exc}"
            extraction_source = "fallback"

        structured = merge_frontend_facts(extracted, payload, transcript)
        ctas_result = ctas_engine.evaluate_ctas(structured)

        response = {
            "transcript": transcript,
            "extractionSource": extraction_source,
            "rawModelOutput": raw_model,
            "structured": structured,
            "ctas": ctas_result,
        }
        self._set_headers(200)
        self.wfile.write(json.dumps(response).encode("utf-8"))


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Backend listening on http://{HOST}:{PORT}")
    server.serve_forever()
