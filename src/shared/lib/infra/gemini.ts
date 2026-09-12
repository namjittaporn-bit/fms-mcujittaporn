/**
 * Gemini API client infrastructure
 * Uses native fetch to connect to Google Generative AI REST API without heavy external dependencies.
 */

interface GeminiRequestOptions {
  apiKey: string;
  model?: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}

export interface NewsTranslationResult {
  titleEn: string;
  contentEn: string;
}

const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

export async function callGemini(options: GeminiRequestOptions): Promise<string> {
  const {
    apiKey,
    model = DEFAULT_GEMINI_MODEL,
    prompt,
    systemInstruction,
    temperature = 0.2,
    responseMimeType,
  } = options;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Gemini API Key is missing or empty");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const payload: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      ...(responseMimeType ? { responseMimeType } : {}),
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const msg =
      errorBody?.error?.message ||
      `Gemini API request failed with HTTP ${res.status} (${res.statusText})`;
    throw new Error(msg);
  }

  const data = await res.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText || typeof candidateText !== "string") {
    throw new Error("Gemini returned an empty or invalid response structure");
  }

  return candidateText.trim();
}

/**
 * Test Gemini API connection with a lightweight prompt.
 */
export async function testGeminiConnection(
  apiKey: string,
  model = DEFAULT_GEMINI_MODEL
): Promise<{ success: boolean; model: string }> {
  await callGemini({
    apiKey,
    model,
    prompt: "Respond with the word PONG to verify API connectivity.",
    temperature: 0,
  });

  return { success: true, model };
}

/**
 * Translate Thai News article title and content to English.
 */
export async function translateThaiNewsToEnglish(params: {
  apiKey: string;
  model?: string;
  titleTh: string;
  contentTh: string;
}): Promise<NewsTranslationResult> {
  const { apiKey, model = DEFAULT_GEMINI_MODEL, titleTh, contentTh } = params;

  const systemInstruction =
    "You are an expert bilingual university communications translator. " +
    "Translate Thai university announcements, academic news, and notices into natural, professional, grammatically accurate English. " +
    "Preserve paragraphs, dates, links, and structure. Output strictly valid JSON matching the requested schema without markdown wrapping.";

  const prompt = `Translate the following university news article from Thai to professional English:

Title (TH):
${titleTh}

Content (TH):
${contentTh}

Required JSON format:
{
  "titleEn": "Translated Title in English",
  "contentEn": "Translated Content in English"
}`;

  const rawJson = await callGemini({
    apiKey,
    model,
    prompt,
    systemInstruction,
    temperature: 0.2,
    responseMimeType: "application/json",
  });

  // Clean code fences if any were returned despite mimeType
  const cleanJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleanJson);
    return {
      titleEn: typeof parsed.titleEn === "string" ? parsed.titleEn.trim() : "",
      contentEn: typeof parsed.contentEn === "string" ? parsed.contentEn.trim() : "",
    };
  } catch {
    throw new Error("Failed to parse Gemini translation response as JSON");
  }
}