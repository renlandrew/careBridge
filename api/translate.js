const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";

function parseJsonResponse(text) {
  const raw = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(raw);
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
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const sourceLanguage = payload.sourceLanguage || "auto";
  const mode = payload.mode || "clinical-json";

  if (!text) {
    res.status(400).json({ error: "Missing text" });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ originalText: text, englishText: text, source: "fallback_no_api_key" });
    return;
  }

  try {
    const model = process.env.GEMMA_MODEL || DEFAULT_GEMMA_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt =
      mode === "clinical-json"
        ? `Convert the following emergency intake text into JSON for the frontend.

Rules:
- Preserve the user's original wording in originalText.
- Convert the meaning into concise clinical English in englishText.
- Do not add medical facts.
- Do not diagnose.
- Return one JSON object only, no markdown.

Schema:
{
  "originalText": "user's original text",
  "englishText": "concise clinical English for nurse review"
}

Source language: ${sourceLanguage}
Text:
${text}`
        : `Convert the following emergency intake text to concise clinical English.

Rules:
- Preserve the patient's meaning.
- Do not add medical facts.
- Do not diagnose.
- Return plain English text only, no markdown.

Source language: ${sourceLanguage}
Text:
${text}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 220,
          ...(mode === "clinical-json" ? { responseMimeType: "application/json" } : {})
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || response.statusText);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (mode === "clinical-json") {
      const parsed = parseJsonResponse(rawText);
      res.status(200).json({
        originalText: typeof parsed.originalText === "string" ? parsed.originalText.trim() : text,
        englishText: typeof parsed.englishText === "string" && parsed.englishText.trim() ? parsed.englishText.trim() : text,
        source: "gemma4_api",
        model
      });
      return;
    }

    res.status(200).json({ originalText: text, englishText: rawText || text, source: "gemma4_api", model });
  } catch (error) {
    res.status(200).json({ originalText: text, englishText: text, source: "fallback_error", error: error.message });
  }
}
