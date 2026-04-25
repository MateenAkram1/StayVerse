import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_ORDER = (items) => [...items].sort((a, b) => b.pricePerNight - a.pricePerNight).slice(0, 5);

function parseGeminiError(error) {
  const raw = String(error?.message || "");
  const status = Number(error?.status || error?.code || 0);
  const quotaHit =
    status === 429 ||
    /quota|rate.?limit|too many requests|resource has been exhausted/i.test(raw);
  const authIssue = status === 401 || status === 403 || /api.?key|permission|unauthorized|forbidden/i.test(raw);

  let retryAfterSec = null;
  const retryMatch = raw.match(/retry(?:\s+in)?\s+(\d+(?:\.\d+)?)s/i) || raw.match(/"retryDelay":"(\d+)s"/i);
  if (retryMatch) retryAfterSec = Math.max(1, Math.ceil(Number(retryMatch[1])));

  if (quotaHit) {
    return {
      code: "quota_exceeded",
      status: 429,
      retryAfterSec,
      userMessage: retryAfterSec
        ? `Gemini quota is currently exhausted. Please retry in about ${retryAfterSec}s, or switch to fallback mode.`
        : "Gemini quota is currently exhausted. Please retry shortly or use fallback mode.",
    };
  }
  if (authIssue) {
    return {
      code: "auth_error",
      status: status || 401,
      retryAfterSec: null,
      userMessage: "Gemini API key is invalid or missing required access. Check GEMINI_API_KEY and model permissions.",
    };
  }
  return {
    code: "unknown_gemini_error",
    status: status || 500,
    retryAfterSec: null,
    userMessage: "Gemini is temporarily unavailable. Please try again shortly.",
  };
}

/**
 * Ranks property ids using Gemini. Falls back to price heuristic if no key or error.
 */
export async function rankPropertyIdsForUser({ userSummary, propertySummaries, apiKey }) {
  if (!apiKey) {
    return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });

  const list = propertySummaries
    .map(
      (p, i) =>
        `ID${i + 1}: _id=${p._id} city=${p.city} type=${p.type} $${p.pricePerNight}/night guests=${p.maxGuests}`
    )
    .join("\n");

  const prompt = `You are a travel accommodation assistant. Given a traveler profile and listings, return ONLY a JSON array of the listing _id values in best-match order (most relevant first), max 8 items. No prose.

Traveler: ${userSummary}

Listings (use exact _id strings from the list only):
${list}

Response format only: ["id1","id2"]`;

  try {
    const out = await model.generateContent(prompt);
    const text = out.response.text().trim();
    const match = text.match(/\[.*\]/s);
    if (!match) {
      return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
    }
    let arr;
    try {
      arr = JSON.parse(match[0]);
    } catch {
      return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
    }
    const idSet = new Set(propertySummaries.map((p) => String(p._id)));
    const ordered = arr.filter((id) => idSet.has(String(id)));
    if (!ordered.length) {
      return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
    }
    return { ids: ordered, source: "gemini" };
  } catch (e) {
    const parsed = parseGeminiError(e);
    console.error("[geminiService rank]", parsed.code, e?.message);
    return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
  }
}

const STAYVERSE_SYSTEM = `You are StayVerse Assistant, a helpful guide for the StayVerse accommodation booking demo (MERN app).
Explain: guests search stays, hosts list properties, bookings use a simulated wallet + multi-step test card (last4 4242), not real money.
Be concise, friendly, and practical. If asked for medical/legal advice, decline.`;

/**
 * Chat replies using Gemini. Model: GEMINI_CHAT_MODEL, else GEMINI_MODEL, else gemini-2.0-flash.
 */
export async function chatStayVerse({ messages }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { reply: null, error: "GEMINI_API_KEY is not set on the server." };
  }
  const name = process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: name,
    systemInstruction: STAYVERSE_SYSTEM,
  });

  const list = (Array.isArray(messages) ? messages : [])
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
      content: String(m.content || "").trim(),
    }))
    .filter((m) => m.content);
  if (!list.length) {
    return { reply: null, error: "Message required" };
  }

  let lastUserIdx = -1;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }
  if (lastUserIdx < 0) {
    return { reply: null, error: "A user message is required" };
  }
  const before = list.slice(0, lastUserIdx);
  const lastUser = list[lastUserIdx];
  const history = [];
  for (const m of before) {
    const role = m.role === "assistant" ? "model" : "user";
    history.push({ role, parts: [{ text: m.content.slice(0, 6000) }] });
  }
  while (history.length && history[0].role === "model") {
    history.shift();
  }

  try {
    const chat = model.startChat({ history });
    const out = await chat.sendMessage(lastUser.content.slice(0, 8000));
    const reply = out.response.text();
    return { reply, model: name, error: null };
  } catch (e) {
    const parsed = parseGeminiError(e);
    console.error("[geminiService chat]", parsed.code, e?.message);
    return { reply: null, error: parsed.userMessage };
  }
}
