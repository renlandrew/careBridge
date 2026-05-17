import {
  getHistoricalMatchesForStructured,
  hasHistoricalSupportForStructured,
  RAG_SOURCE_NOTE,
} from "../src/ragEvidence.js";

const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";

const LEVEL_TITLES = {
  1: "Resuscitation",
  2: "Emergent",
  3: "Urgent",
  4: "Less urgent",
  5: "Non-urgent"
};

const REASSESSMENT_MINUTES = {
  1: null,
  2: 15,
  3: 30,
  4: 60,
  5: 120
};

const BASE_LEVELS = {
  cardiac_chest_pain: 3,
  stroke_like_neuro: 2,
  seizure: 3,
  syncope: 3,
  shortness_of_breath: 3,
  allergic_reaction: 3,
  abdominal_pain: 5,
  headache: 3,
  fever: 4,
  mental_health_crisis: 3,
  pregnancy_related: 3,
  throat_airway: 5,
  major_trauma: 3,
  limb_injury: 5,
  laceration: 4,
  back_pain: 5,
  eye_problem: 4,
  urinary_problem: 4,
  minor_issue: 5,
  other: 4
};

const COMPLAINT_LABELS = {
  cardiac_chest_pain: "Cardiac features / chest pain",
  stroke_like_neuro: "Stroke-like neurologic complaint",
  seizure: "Seizure-related complaint",
  syncope: "Syncope / near syncope",
  shortness_of_breath: "Shortness of breath",
  allergic_reaction: "Allergic reaction / anaphylaxis",
  abdominal_pain: "Abdominal or pelvic pain",
  headache: "Headache",
  fever: "Fever / infectious symptoms",
  mental_health_crisis: "Mental health / behavioral crisis",
  pregnancy_related: "Pregnancy-related complaint",
  throat_airway: "Throat or upper-airway warning complaint",
  major_trauma: "Major trauma",
  limb_injury: "Limb pain / minor limb injury",
  laceration: "Laceration / wound",
  back_pain: "Back pain",
  eye_problem: "Eye pain or vision concern",
  urinary_problem: "Urinary or flank complaint",
  minor_issue: "Minor issue",
  other: "General complaint"
};

const SYSTEM_PROMPT = `You are the local extraction brain for a multilingual emergency intake kiosk.

Your job:
- Extract structured triage facts from the patient's words and kiosk answers.
- Return one valid JSON object only.
- Do not use markdown.
- Do not provide medical advice.
- Do not diagnose.
- Do not assign CTAS, KTAS, ESI, or any final triage level.

Use this exact schema:
{
  "languageDetected": null,
  "preferredLanguage": null,
  "ageYears": null,
  "ageMonths": null,
  "pregnancyWeeks": null,
  "chiefComplaint": null,
  "complaintCategory": null,
  "patientSummary": null,
  "symptoms": [],
  "redFlags": [],
  "duration": null,
  "onset": null,
  "vitals": {
    "heartRate": null,
    "bloodPressure": null,
    "respiratoryRate": null,
    "oxygenSaturation": null,
    "temperatureC": null,
    "painScore": null
  },
  "mentalStatus": null,
  "distressLevel": null,
  "hemodynamicStatus": null,
  "painContext": null,
  "mechanismOfInjury": null,
  "mobilityStatus": null,
  "suicidalIdeation": null,
  "violenceRisk": null,
  "anticoagulated": null,
  "immunocompromised": null,
  "allergies": null,
  "medications": null,
  "notes": null,
  "confidence": 0.0,
  "sourceText": null
}

Allowed values:
- mentalStatus: normal, anxious, agitated, confused, lethargic, unresponsive, null
- distressLevel: none, mild, moderate, severe, null
- hemodynamicStatus: stable, borderline, unstable, null
- painContext: none, acute-central, acute-peripheral, chronic, recurrent, null

Rules:
- Unknown values must be null or empty arrays.
- Keep patientSummary in English.
- Use painContext=acute-central for chest, abdominal, ischemic-style, or testicular pain.
- Use painContext=acute-peripheral for new limb, wound, burn, eye, or localized somatic pain.
- Be conservative. Only infer mental status, distress, and red flags from explicit facts.`;

function joinValues(values) {
  if (!Array.isArray(values)) return "";
  return values.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
}

function makeTranscript(payload) {
  const parts = [
    `Patient name: ${payload.name || "Unknown"}`,
    `Preferred language: ${payload.preferredLanguage || "English"}`,
    `Date of birth: ${payload.birthDate || "Unknown"}`,
    `Pain locations: ${joinValues(payload.painLocation) || "Not specified"}`,
    `Pain score: ${payload.severity ?? "Unknown"} out of 10`,
    `Onset: ${payload.onsetDisplay || payload.onset || "Unknown"}`,
    `Sensation: ${payload.painTypeDisplay || payload.painType || "Unknown"}`,
    `Focused answer: ${payload.followUpDisplay || payload.followUpAnswer || "Unknown"}`,
    `History: ${joinValues(payload.historyDisplay || payload.history) || "None reported"}`,
    `Allergies: ${joinValues(payload.allergyDisplay || payload.allergies) || "None reported"}`,
    `Loss of consciousness: ${payload.lostConsciousness || "Unknown"}`,
    `Difficulty breathing: ${payload.breathingDifficulty || "Unknown"}`,
    `Other update: ${payload.updateOtherDisplay || payload.updateOther || "None"}`,
    `Additional information: ${payload.additionalInfoDisplay || payload.additionalInfo || "None"}`
  ];
  return parts.join(". ");
}

function toFloat(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBp(value) {
  if (!value) return [null, null];
  const match = String(value).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!match) return [null, null];
  return [toFloat(match[1]), toFloat(match[2])];
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function buildSearchText(data) {
  const fields = [];
  [
    "chiefComplaint",
    "complaintCategory",
    "patientSummary",
    "duration",
    "onset",
    "mechanismOfInjury",
    "mobilityStatus",
    "allergies",
    "medications",
    "notes",
    "sourceText"
  ].forEach((key) => {
    if (data[key]) fields.push(String(data[key]));
  });

  ["symptoms", "redFlags"].forEach((key) => {
    if (Array.isArray(data[key])) fields.push(...data[key].filter(Boolean).map(String));
  });

  return fields.join(" ").toLowerCase();
}

function detectPresentingComplaint(data) {
  const text = buildSearchText(data);

  if (
    hasAny(text, ["chest pain", "chest discomfort", "left chest pain", "heart pain", "胸痛", "胸口痛"]) ||
    (hasAny(text, ["pain locations: chest", "chest", "pain locations: 胸部", "胸部"]) &&
      hasAny(text, ["pressure", "spreading to arm", "jaw", "压迫", "手臂", "下巴", "出汗"]))
  ) {
    return "cardiac_chest_pain";
  }
  if (hasAny(text, ["stroke", "slurred speech", "face droop", "one-sided weakness", "hemiparesis", "vision loss"])) return "stroke_like_neuro";
  if (hasAny(text, ["seizure", "convulsion", "status epilepticus"])) return "seizure";
  if (hasAny(text, ["syncope", "near syncope", "fainted", "passed out"])) return "syncope";
  if (hasAny(text, ["shortness of breath", "dyspnea", "wheezing", "can't breathe", "respiratory distress", "呼吸困难", "喘"])) return "shortness_of_breath";
  if (hasAny(text, ["anaphylaxis", "throat closing", "lip swelling", "tongue swelling", "hives"])) return "allergic_reaction";
  if (hasAny(text, ["pregnant", "pregnancy", "vaginal bleeding", "labor"])) return "pregnancy_related";
  if (hasAny(text, ["epiglottitis", "trouble swallowing", "drooling", "stridor", "throat swelling"])) return "throat_airway";
  if (hasAny(text, ["abdominal pain", "abd pain", "vomiting", "diarrhea", "gastritis", "腹痛", "腹部", "胃痛", "呕吐"])) return "abdominal_pain";
  if (hasAny(text, ["eye pain", "vision change", "vision loss", "keratitis"])) return "eye_problem";
  if (hasAny(text, ["back pain", "lumbar"])) return "back_pain";
  if (hasAny(text, ["hematuria", "pyelonephritis", "urinary", "renal colic"])) return "urinary_problem";
  if (hasAny(text, ["headache", "migraine", "worst headache", "头痛", "头部"])) return "headache";
  if (hasAny(text, ["fever", "febrile", "temperature"])) return "fever";
  if (hasAny(text, ["suicidal", "kill myself", "self harm", "psychosis", "violent"])) return "mental_health_crisis";
  if (hasAny(text, ["arm pain", "leg pain", "wrist pain", "finger injury", "knee pain", "ankle pain", "limbs"])) return "limb_injury";
  if (hasAny(text, ["high speed", "rollover", "ejected", "collision", "car crash", "open fracture", "head injury"])) return "major_trauma";
  if (hasAny(text, ["open wound", "cut", "laceration", "wound", "stitches", "skin"])) return "laceration";
  if (hasAny(text, ["refill", "prescription", "paperwork", "sore throat", "pharyngitis"])) return "minor_issue";
  return "other";
}

function inferPainContext(data, complaint, text) {
  if (["none", "acute-central", "acute-peripheral", "chronic", "recurrent"].includes(data.painContext)) {
    return data.painContext;
  }
  if (hasAny(text, ["chronic", "longstanding"])) return "chronic";
  if (["cardiac_chest_pain", "abdominal_pain", "headache"].includes(complaint)) return "acute-central";
  if (["major_trauma", "limb_injury", "laceration", "back_pain", "eye_problem"].includes(complaint)) return "acute-peripheral";
  return null;
}

function evaluateCtas(data) {
  const text = buildSearchText(data);
  const complaint = detectPresentingComplaint(data);
  let level = BASE_LEVELS[complaint] || 4;
  const modifiers = [`Presenting complaint mapped to ${COMPLAINT_LABELS[complaint] || COMPLAINT_LABELS.other}.`];

  const escalate = (target, reason) => {
    if (target < level) level = target;
    if (!modifiers.includes(reason)) modifiers.push(reason);
  };

  const vitals = data.vitals && typeof data.vitals === "object" ? data.vitals : {};
  const hr = toFloat(vitals.heartRate);
  const rr = toFloat(vitals.respiratoryRate);
  const spo2 = toFloat(vitals.oxygenSaturation);
  const temp = toFloat(vitals.temperatureC);
  const pain = toFloat(vitals.painScore);
  const [sbp] = parseBp(vitals.bloodPressure);
  const mental = String(data.mentalStatus || "").toLowerCase();
  const distress = String(data.distressLevel || "").toLowerCase();
  const hemo = String(data.hemodynamicStatus || "").toLowerCase();
  const painContext = inferPainContext(data, complaint, text);

  if (mental === "unresponsive" || hasAny(text, ["unresponsive", "cardiac arrest", "no pulse", "not breathing"])) {
    escalate(1, "Unresponsive or arrest-like presentation.");
  }

  if (hemo === "unstable" || (sbp !== null && sbp < 90)) {
    escalate(1, "Hemodynamic instability or systolic BP below 90.");
  } else if (hemo === "borderline" || (sbp !== null && sbp < 100)) {
    escalate(2, "Borderline circulation modifier.");
  }

  if (spo2 !== null && spo2 < 90) {
    escalate(1, "SpO2 below 90%.");
  } else if ((spo2 !== null && spo2 <= 92) || (rr !== null && rr >= 24) || distress === "moderate") {
    escalate(2, "Respiratory compromise modifier.");
  }

  if (distress === "severe" || (rr !== null && rr >= 30)) {
    escalate(1, "Severe visible respiratory distress.");
  }

  if (hr !== null && (hr >= 160 || hr <= 40)) {
    escalate(1, "Extreme heart rate.");
  } else if (hr !== null && hr >= 140) {
    escalate(2, "Marked tachycardia modifier.");
  } else if (hr !== null && hr >= 120) {
    escalate(3, "Tachycardia modifier.");
  }

  if (["confused", "lethargic"].includes(mental)) escalate(2, "Altered mental status.");
  if (data.suicidalIdeation || data.violenceRisk || hasAny(text, ["suicidal", "kill myself", "violent", "psychosis"])) {
    escalate(2, "Behavioral safety risk.");
  }

  if (complaint === "stroke_like_neuro") escalate(2, "Stroke-like symptoms are time-sensitive.");
  if (complaint === "cardiac_chest_pain") {
    if (hasAny(text, ["left arm", "arm numb", "jaw", "shortness of breath", "sweating", "手臂", "下巴", "呼吸困难", "出汗"])) {
      escalate(2, "Chest pain with high-risk features.");
    }
    if (painContext === "acute-central" && pain !== null && pain >= 8) {
      escalate(2, "Severe acute central pain.");
    }
  }

  if (complaint === "syncope") escalate(2, "Syncope requires focused reassessment.");
  if (complaint === "abdominal_pain" && pain !== null && pain >= 4) escalate(3, "Abdominal complaint with moderate pain.");
  if (complaint === "throat_airway" && hasAny(text, ["stridor", "can't swallow", "drooling", "respiratory distress"])) {
    escalate(2, "Upper-airway compromise feature.");
  }
  if (complaint === "back_pain" && (pain !== null && pain >= 4)) escalate(3, "Back pain with moderate pain.");
  if (complaint === "eye_problem" && (pain !== null && pain >= 4)) escalate(3, "Eye pain with moderate pain.");
  if (complaint === "urinary_problem" && (pain !== null && pain >= 4)) escalate(3, "Urinary complaint with pain or kidney infection concern.");
  if (complaint === "allergic_reaction" && hasAny(text, ["throat closing", "tongue swelling", "lip swelling", "wheeze"])) {
    escalate(1, "Airway-threatening allergic reaction.");
  }
  if (complaint === "major_trauma") escalate(2, "High-risk trauma mechanism.");
  if (complaint === "pregnancy_related" && hasAny(text, ["vaginal bleeding"])) escalate(2, "Pregnancy-related bleeding.");
  if (complaint === "fever" && temp !== null && temp >= 38) escalate(temp >= 40 ? 2 : 3, "Fever temperature modifier.");

  if (pain !== null && pain >= 8) {
    if (painContext === "acute-central") escalate(2, "Severe acute central pain.");
    else if (painContext === "acute-peripheral") escalate(3, "Severe acute peripheral pain.");
  }

  return {
    level,
    title: LEVEL_TITLES[level],
    presentingComplaint: complaint,
    presentingComplaintLabel: COMPLAINT_LABELS[complaint] || COMPLAINT_LABELS.other,
    modifiersApplied: modifiers,
    reassessmentMinutes: REASSESSMENT_MINUTES[level],
    reassessmentLabel:
      level === 1
        ? "Continuous nursing observation"
        : `Repeat focused reassessment every ${REASSESSMENT_MINUTES[level]} minutes`,
    nurseWorkflow: buildNurseWorkflow(level, complaint),
    reason: "Base presenting complaint pathway adjusted by deterministic CTAS-aligned modifiers."
  };
}

function buildNurseWorkflow(level, complaint) {
  const actions = [
    level === 1 ? "Direct room placement; no waiting room time." : `Reassess every ${REASSESSMENT_MINUTES[level]} minutes while waiting.`,
    level <= 2 ? "Notify charge nurse immediately." : "Update queue priority and visible status board."
  ];

  const focused =
    {
      cardiac_chest_pain: "Obtain ECG quickly and repeat vitals after initial nursing contact.",
      stroke_like_neuro: "Document last-known-well time and repeat neurologic observations.",
      syncope: "Repeat vitals and screen for chest pain, palpitations, and exertional syncope.",
      throat_airway: "Screen voice change, drooling, swallowing difficulty, stridor, and oxygenation.",
      mental_health_crisis: "Use protected area and maintain safety observation."
    }[complaint] || "Repeat focused assessment using the complaint-specific modifier set.";

  actions.push(focused);
  return actions;
}

function fallbackExtraction(transcript, preferredLanguage) {
  const text = transcript.toLowerCase();
  const symptoms = [];
  const redFlags = [];

  if (hasAny(text, ["chest pain", "chest discomfort", "胸痛", "胸部", "胸口"])) symptoms.push("chest pain");
  if (hasAny(text, ["pressure", "压迫"])) symptoms.push("pressure");
  if (hasAny(text, ["arm", "jaw", "手臂", "下巴"])) redFlags.push("radiating pain");
  if (hasAny(text, ["shortness of breath", "can't breathe", "wheezing", "difficulty breathing: yes", "呼吸困难", "喘"])) redFlags.push("breathing difficulty");
  if (hasAny(text, ["numb", "weakness", "slurred speech", "face droop"])) redFlags.push("neurologic symptom");
  if (hasAny(text, ["loss of consciousness: yes", "unresponsive", "cardiac arrest", "not breathing"])) redFlags.push("loss of consciousness");
  if (hasAny(text, ["fever", "temperature", "发烧", "发热"])) symptoms.push("fever");

  return {
    languageDetected: null,
    preferredLanguage,
    ageYears: null,
    ageMonths: null,
    pregnancyWeeks: null,
    chiefComplaint: transcript,
    complaintCategory: null,
    patientSummary: transcript.slice(0, 300),
    symptoms,
    redFlags,
    duration: null,
    onset: null,
    vitals: { painScore: null },
    mentalStatus: hasAny(text, ["unresponsive", "loss of consciousness: yes"]) ? "confused" : "normal",
    distressLevel: hasAny(text, ["difficulty breathing: yes", "can't breathe"]) ? "moderate" : "none",
    hemodynamicStatus: null,
    painContext: hasAny(text, ["chest", "胸部", "胸痛", "腹部", "腹痛"]) ? "acute-central" : null,
    mechanismOfInjury: null,
    mobilityStatus: null,
    suicidalIdeation: null,
    violenceRisk: null,
    anticoagulated: null,
    immunocompromised: null,
    allergies: null,
    medications: null,
    notes: "Fallback extraction used because Gemma API was unavailable.",
    confidence: 0.25,
    sourceText: transcript
  };
}

function mergeFrontendFacts(extracted, payload, transcript) {
  const merged = { ...extracted };
  const painScore = payload.severity ?? null;
  const locations = Array.isArray(payload.painLocation) ? payload.painLocation.filter(Boolean) : [];
  const sensation = payload.painTypeDisplay || payload.painType;
  const onset = payload.onsetDisplay || payload.onset;
  const followUp = payload.followUpDisplay || payload.followUpAnswer;

  merged.preferredLanguage = payload.preferredLanguage || extracted.preferredLanguage || "English";
  merged.sourceText = transcript;
  merged.chiefComplaint = joinValues(locations) || extracted.chiefComplaint;
  merged.patientSummary = extracted.patientSummary || transcript;
  merged.onset = onset || extracted.onset;
  merged.allergies = joinValues(payload.allergyDisplay || payload.allergies) || extracted.allergies;

  const symptoms = [...(Array.isArray(extracted.symptoms) ? extracted.symptoms : []), ...locations];
  if (sensation) symptoms.push(String(sensation));
  if (followUp) symptoms.push(String(followUp));
  merged.symptoms = [...new Set(symptoms.filter(Boolean))];

  const redFlags = Array.isArray(extracted.redFlags) ? [...extracted.redFlags] : [];
  if (String(payload.lostConsciousness).toLowerCase() === "yes") redFlags.push("loss of consciousness");
  if (String(payload.breathingDifficulty).toLowerCase() === "yes") redFlags.push("difficulty breathing");
  merged.redFlags = [...new Set(redFlags.filter(Boolean))];

  merged.notes = [
    extracted.notes,
    sensation ? `Sensation: ${sensation}` : "",
    followUp ? `Focused detail: ${followUp}` : "",
    payload.lostConsciousness ? `Loss of consciousness: ${payload.lostConsciousness}` : "",
    payload.breathingDifficulty ? `Difficulty breathing: ${payload.breathingDifficulty}` : "",
    payload.updateOtherDisplay || payload.updateOther ? `Other update: ${payload.updateOtherDisplay || payload.updateOther}` : "",
    payload.additionalInfoDisplay || payload.additionalInfo
      ? `Additional information: ${payload.additionalInfoDisplay || payload.additionalInfo}`
      : ""
  ]
    .filter(Boolean)
    .join("\n");

  merged.vitals = { ...(extracted.vitals && typeof extracted.vitals === "object" ? extracted.vitals : {}), painScore };
  return merged;
}

function extractJsonCandidate(text) {
  const raw = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!raw) throw new Error("Empty Gemma response");

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through to brace extraction.
  }

  const candidate = bestJsonObjectCandidate(raw);
  if (candidate) {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  }

  throw new Error(`No JSON object found in Gemma response preview: ${raw.slice(0, 300)}`);
}

function bestJsonObjectCandidate(raw) {
  const candidates = balancedJsonObjects(raw);
  let best = "";
  let bestScore = -1;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;

      const keys = new Set(Object.keys(parsed));
      const schemaScore = [
        "languageDetected",
        "preferredLanguage",
        "chiefComplaint",
        "complaintCategory",
        "patientSummary",
        "symptoms",
        "redFlags",
        "vitals",
        "mentalStatus",
        "distressLevel",
        "painContext",
        "sourceText"
      ].filter((key) => keys.has(key)).length;

      const score = schemaScore * 1000 + candidate.length;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    } catch {
      // Keep scanning; model text often contains example objects before the final answer.
    }
  }

  return best;
}

function balancedJsonObjects(raw) {
  const candidates = [];

  for (let start = raw.indexOf("{"); start >= 0; start = raw.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < raw.length; i += 1) {
      const char = raw[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;

      if (depth === 0) {
        candidates.push(raw.slice(start, i + 1));
        break;
      }
    }
  }

  return candidates;
}

async function callGemmaApi(transcript, preferredLanguage) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY or GEMINI_API_KEY");

  const model = process.env.GEMMA_MODEL || DEFAULT_GEMMA_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const prompt = `${SYSTEM_PROMPT}

Preferred display language: ${preferredLanguage}

Patient kiosk transcript:
${transcript}`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 700,
          responseMimeType: "application/json"
        }
      })
    });
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || response.statusText;
    throw new Error(`Gemma API request failed: ${response.status} ${message}`);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  return { extracted: extractJsonCandidate(rawText), rawText: rawText.slice(0, 2000), model };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const preferredLanguage = payload.preferredLanguage || "English";
  const transcript = makeTranscript(payload);

  let extractionSource = "gemma4_api";
  let rawModelOutput = "";
  let modelUsed = process.env.GEMMA_MODEL || DEFAULT_GEMMA_MODEL;
  let extracted;

  try {
    const result = await callGemmaApi(transcript, preferredLanguage);
    extracted = result.extracted;
    rawModelOutput = result.rawText;
    modelUsed = result.model;
  } catch (error) {
    extractionSource = "rule_fallback";
    rawModelOutput = `fallback_extraction_used: ${error.message}`;
    extracted = fallbackExtraction(transcript, preferredLanguage);
  }

  const structured = mergeFrontendFacts(extracted, payload, transcript);
  const ctas = evaluateCtas(structured);
  const historicalMatches = getHistoricalMatchesForStructured(structured, ctas.level);
  const historicalSupport = hasHistoricalSupportForStructured(structured, ctas.level);

  res.status(200).json({
    transcript,
    extractionSource,
    modelUsed,
    rawModelOutput,
    structured,
    ctas,
    ragEvidence: {
      label: `CTAS ${ctas.level}${historicalSupport ? "*" : ""}`,
      historicalSupport,
      sourceNote: RAG_SOURCE_NOTE,
      matches: historicalMatches
    }
  });
}
