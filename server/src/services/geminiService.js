import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_ORDER = (items) => [...items].sort((a, b) => b.pricePerNight - a.pricePerNight).slice(0, 5);

/**
 * Ranks property ids using Gemini. Falls back to price heuristic if no key or error.
 */
export async function rankPropertyIdsForUser({ userSummary, propertySummaries, apiKey }) {
  if (!apiKey) {
    return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

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
    console.error("[geminiService]", e.message);
    return { ids: FALLBACK_ORDER(propertySummaries).map((p) => p._id), source: "fallback" };
  }
}
