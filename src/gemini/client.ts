/**
 * Gemini API client for Sales Scorecard commentary.
 * Uses @google/generative-ai; call from API routes or server-only code.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPromptsForRole } from "@/lib/gemini-prompts";
import type { GeminiCommentaryOutput } from "@/lib/gemini-prompts";
import { getAppConfig } from "@/lib/app-config";
import type { ScorecardData } from "@/types/scorecard";

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Strips optional markdown code fence around JSON so we can parse.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const jsonBlock = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

/**
 * Calls Gemini to generate commentary and recommended actions for the given scorecard.
 * Uses GEMINI_API_KEY or GOOGLE_API_KEY from env. Throws if key is missing or API fails.
 */
export async function generateCommentary(
  scorecard: ScorecardData,
  options?: { apiKey?: string; model?: string }
): Promise<GeminiCommentaryOutput> {
  const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }

  const config = getAppConfig();
  const { systemPrompt, userPrompt } = getPromptsForRole(scorecard.role, scorecard, config);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: options?.model ?? DEFAULT_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const raw = result.response.text();
  const jsonStr = extractJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Gemini returned invalid JSON for commentary.");
  }

  if (!parsed || typeof parsed !== "object" || !("achievementMessage" in parsed)) {
    throw new Error("Gemini response does not match commentary schema.");
  }

  const out = parsed as Record<string, unknown>;
  return {
    achievementMessage: String(out.achievementMessage ?? ""),
    growthComment: String(out.growthComment ?? ""),
    dsoComment: String(out.dsoComment ?? ""),
    overdueComment: String(out.overdueComment ?? ""),
    productMixComment: String(out.productMixComment ?? ""),
    recommendedActions: Array.isArray(out.recommendedActions)
      ? (out.recommendedActions as GeminiCommentaryOutput["recommendedActions"])
      : [],
  };
}
