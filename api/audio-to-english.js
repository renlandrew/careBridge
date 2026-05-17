function parseJsonResponse(text) {
  const raw = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(raw);
}

function extractGeneratedText(data) {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data.map(extractGeneratedText).filter(Boolean).join("\n").trim();
  }
  if (!data || typeof data !== "object") return "";

  if (typeof data.generated_text === "string") return data.generated_text;
  if (typeof data.text === "string") return data.text;
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.content === "string") return data.content;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.outputs?.[0]) return extractGeneratedText(data.outputs[0]);
  return "";
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
  const audioBase64 = typeof payload.audioBase64 === "string" ? payload.audioBase64 : "";
  const mimeType = typeof payload.mimeType === "string" ? payload.mimeType : "audio/webm";
  const sourceLanguage = payload.sourceLanguage || "auto";
  const endpoint = process.env.HF_GEMMA4_AUDIO_ENDPOINT;
  const token = process.env.HF_TOKEN;

  if (!audioBase64) {
    res.status(400).json({ error: "Missing audio" });
    return;
  }

  if (!endpoint || !token) {
    res.status(503).json({ error: "Gemma 4 audio endpoint is not configured.", source: "hf_config_missing" });
    return;
  }

  const prompt = `Transcribe this patient speech, then translate it to concise clinical English for nurse review.

Return one JSON object only, no markdown:
{
  "originalText": "the user's exact spoken words in the original language",
  "englishText": "concise clinical English translation"
}

Source language: ${sourceLanguage}
Do not add medical facts. Do not diagnose.`;

  const requestBody = {
    inputs: [
      {
        role: "user",
        content: [
          { type: "audio", audio: `data:${mimeType};base64,${audioBase64}` },
          { type: "text", text: prompt }
        ]
      }
    ],
    parameters: {
      temperature: 0,
      max_new_tokens: 240,
      return_full_text: false
    }
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    const data = await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }));
    if (!response.ok) {
      const message = data?.error || data?.detail || data?.message || data?.raw || response.statusText;
      throw new Error(message);
    }

    const generatedText = extractGeneratedText(data);
    const parsed = parseJsonResponse(generatedText);
    res.status(200).json({
      originalText: typeof parsed.originalText === "string" ? parsed.originalText.trim() : "",
      englishText: typeof parsed.englishText === "string" ? parsed.englishText.trim() : "",
      source: "gemma4_hf_audio",
      model: "google/gemma-4-E2B-it"
    });
  } catch (error) {
    const message = error.name === "AbortError" ? "Gemma 4 audio endpoint timed out." : error.message;
    res.status(503).json({ error: message, source: "gemma4_hf_audio_error" });
  } finally {
    clearTimeout(timeout);
  }
}
