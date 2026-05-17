export const HISTORICAL_CTAS_CASES = [
  {
    id: "KTAS-1187",
    sourceScale: "KTAS",
    ctas: 2,
    complaint: "Chest pain",
    symptoms: ["Chest", "Pressure", "Pressure spreading to arm or jaw", "Difficulty breathing", "High Blood Pressure"],
    summary: "Adult chest pressure with arm radiation and breathing concern was treated as emergent."
  },
  {
    id: "KTAS-2044",
    sourceScale: "KTAS",
    ctas: 2,
    complaint: "Neurologic change",
    symptoms: ["Head", "Dizziness or faint feeling", "Loss of consciousness", "Suddenly"],
    summary: "Loss of consciousness or acute neurologic change was escalated for rapid nurse review."
  },
  {
    id: "KTAS-0772",
    sourceScale: "KTAS",
    ctas: 3,
    complaint: "Shortness of breath",
    symptoms: ["Chest", "Burning", "Pain with deep breathing", "Difficulty breathing", "Asthma"],
    summary: "Breathing difficulty with asthma history aligned with urgent reassessment."
  },
  {
    id: "KTAS-3019",
    sourceScale: "KTAS",
    ctas: 3,
    complaint: "Abdominal pain",
    symptoms: ["Abdomen", "Back", "Cramping", "Sharp pain in one spot", "Heart Disease"],
    summary: "Moderate abdominal pain with higher-risk history was historically triaged as urgent."
  },
  {
    id: "KTAS-4128",
    sourceScale: "KTAS",
    ctas: 4,
    complaint: "Limb injury",
    symptoms: ["Limbs", "Sharp", "Cannot put weight on it", "After an injury"],
    summary: "Stable isolated limb injury without red flags matched a less-urgent pathway."
  },
  {
    id: "KTAS-5180",
    sourceScale: "KTAS",
    ctas: 5,
    complaint: "Minor skin irritation",
    symptoms: ["Skin", "Itching or irritation", "Gradually", "No difficulty breathing"],
    summary: "Minor skin symptoms without systemic red flags matched non-urgent historical cases."
  }
];

export const RAG_SOURCE_NOTE =
  "Demo reference cases are derived as presentation-safe prototypes from a public KTAS-labeled emergency triage dataset. KTAS is used as a five-level acuity proxy for CTAS-style historical confirmation; CTAS rules remain deterministic.";

function normalizeSignal(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, " ")
    .replace(/\s+/g, " ");
}

function compactSignals(values) {
  return [...new Set(values.filter(Boolean).map(normalizeSignal).filter(Boolean))];
}

export function buildSignalsFromPatient(patient = {}) {
  return compactSignals([
    ...(patient.painLocation || []),
    patient.painTypeDisplay,
    patient.painType,
    patient.onsetDisplay,
    patient.onset,
    patient.followUpDisplay,
    patient.followUpAnswer,
    patient.breathingDifficulty ? `difficulty breathing ${patient.breathingDifficulty}` : "",
    patient.lostConsciousness ? `loss of consciousness ${patient.lostConsciousness}` : "",
    ...(patient.historyDisplay || []),
    ...(patient.history || []),
    ...(patient.allergyDisplay || []),
    ...(patient.allergies || []),
    patient.updateOtherDisplay,
    patient.updateOther
  ]);
}

export function buildSignalsFromStructured(structured = {}) {
  const vitals = structured.vitals && typeof structured.vitals === "object" ? structured.vitals : {};
  return compactSignals([
    structured.chiefComplaint,
    structured.complaintCategory,
    structured.patientSummary,
    structured.onset,
    structured.duration,
    structured.mentalStatus,
    structured.distressLevel,
    structured.hemodynamicStatus,
    structured.painContext,
    structured.mechanismOfInjury,
    structured.mobilityStatus,
    structured.allergies,
    structured.medications,
    structured.notes,
    structured.sourceText,
    vitals.painScore !== null && vitals.painScore !== undefined ? `pain ${vitals.painScore}` : "",
    ...(structured.symptoms || []),
    ...(structured.redFlags || [])
  ]);
}

export function matchHistoricalCases(signals, triageLevel, limit = 3) {
  const normalizedSignals = compactSignals(signals);

  return HISTORICAL_CTAS_CASES.map((historical) => {
    const matchedSignals = historical.symptoms.filter((signal) => {
      const normalizedHistoricalSignal = normalizeSignal(signal);
      return normalizedSignals.some(
        (caseSignal) =>
          caseSignal.includes(normalizedHistoricalSignal) ||
          normalizedHistoricalSignal.includes(caseSignal) ||
          caseSignal.split(" ").some((token) => token.length > 4 && normalizedHistoricalSignal.includes(token))
      );
    });

    const levelBonus = historical.ctas === triageLevel ? 2 : 0;
    return {
      ...historical,
      matchedSignals,
      score: matchedSignals.length + levelBonus
    };
  })
    .filter((historical) => historical.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getHistoricalMatchesForPatient(patient, triageLevel, limit = 3) {
  return matchHistoricalCases(buildSignalsFromPatient(patient), triageLevel, limit);
}

export function getHistoricalMatchesForStructured(structured, triageLevel, limit = 3) {
  return matchHistoricalCases(buildSignalsFromStructured(structured), triageLevel, limit);
}

export function hasHistoricalSupportForPatient(patient, triageLevel) {
  return getHistoricalMatchesForPatient(patient, triageLevel).some((historical) => historical.ctas === triageLevel);
}

export function hasHistoricalSupportForStructured(structured, triageLevel) {
  return getHistoricalMatchesForStructured(structured, triageLevel).some((historical) => historical.ctas === triageLevel);
}
