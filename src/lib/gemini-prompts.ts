/**
 * Central Gemini prompts and output contract for Sales Scorecard commentary.
 * Use this module from API routes, serverless functions, or any program that calls Gemini.
 * Prompts use config (methodology of prompting) — no hardcoded bands/thresholds.
 */

import type { Role } from "@/types/scorecard";
import type { AppConfig } from "@/lib/app-config";

/** Exact JSON shape Gemini must return. No extra keys. No markdown. */
export interface GeminiCommentaryOutput {
  achievementMessage: string;
  growthComment: string;
  dsoComment: string;
  overdueComment: string;
  productMixComment: string;
  recommendedActions: Array<{
    whatToDo: string;
    whyItHelps: string;
    expectedImpact: "High" | "Medium" | "Low";
  }>;
}

/** Keys in GeminiCommentaryOutput (for validation / merge). */
export const GEMINI_OUTPUT_KEYS: (keyof GeminiCommentaryOutput)[] = [
  "achievementMessage",
  "growthComment",
  "dsoComment",
  "overdueComment",
  "productMixComment",
  "recommendedActions",
];

/** Build output schema with config-driven min/max for recommendedActions. */
export function getGeminiOutputSchema(config: AppConfig): string {
  const { recommendedActionsMin, recommendedActionsMax } = config;
  return `
You MUST return ONLY valid JSON in this exact structure. No extra keys. No commentary. No markdown.

{
  "achievementMessage": "string",
  "growthComment": "string",
  "dsoComment": "string",
  "overdueComment": "string",
  "productMixComment": "string",
  "recommendedActions": [
    {
      "whatToDo": "string",
      "whyItHelps": "string",
      "expectedImpact": "High" | "Medium" | "Low"
    }
  ]
}

Rules:
- All strings must be concise and UI-safe.
- Do not invent numbers; refer only to concepts and bands provided in the input.
- Tone: clear, practical, encouraging. For achievementMessage especially: warm and motivating; vary wording — never repeat the same phrase for every scorecard.
- recommendedActions: minimum ${recommendedActionsMin}, maximum ${recommendedActionsMax} items.
`.trim();
}

/** Build scorecard context with config-driven bands and thresholds (methodology of prompting). */
export function buildScorecardContext(config: AppConfig): string {
  const { scoreBandThresholds, maxScore, growthBandThresholds, dsoBands, overdueBuckets, overdueBucketPenalties, productMixHelpThreshold } = config;
  const penaltyStr = overdueBuckets.map((b) => `${b.label}: ${overdueBucketPenalties[b.key] ?? b.penaltyPct}%`).join(", ");
  const dsoStr = dsoBands.map((b) => `${b.shortLabel} (factor ${b.factor})`).join(", ");
  return `
You are a coach for a Sales Scorecard. The scorecard has already computed all scores and KPIs.
Your job is ONLY to generate short, human-readable commentary and recommended actions.

## Overall score
- finalScore out of maxScore (e.g. ${maxScore}).
- Bands: Red (score < ${scoreBandThresholds.redEnd}), Amber (${scoreBandThresholds.redEnd} to ${scoreBandThresholds.amberEnd}), Green (above ${scoreBandThresholds.amberEnd}).
- achievementMessage: One short sentence under the gauge. MUST use the user's name to personalize (e.g. "Pushpanathan, strong run — your numbers are in the top band."). Vary wording; do NOT repeat the same phrase.
  - Green: Celebrate and encourage. E.g. "[Name], strong run — your numbers are in the top band.", "Well done, [Name] — Green zone. Keep building on this momentum."
  - Amber: Encourage with direction: e.g. "You're close to Green — one or two levers can get you there.", "Amber zone. Small improvements in the areas below will push you into Green."
  - Red: Encourage without demotivating; point to specific levers: e.g. "Focus on DSO and overdue to unlock more score.", "Red zone — the next screens show exactly where to improve."
- Tone: warm, motivating, and specific to the band. Make the person feel recognised and clear on what to do next.

## Growth (Screen 2)
- growthPercent: YoY growth %. growthFactor: 1 = achieved, 0 = not achieved (score blocked).
- Green: >${growthBandThresholds.greenAbove}%, Amber: ${growthBandThresholds.amberAbove}–${growthBandThresholds.greenAbove}%, Red: <${growthBandThresholds.amberAbove}%.
- growthComment: One short sentence. State whether growth is achieved and what it means for the score.

## Collection Speed – DSO (Screen 3)
- dsoDays: days to collect. Bands: ${dsoStr}.
- dsoComment: One short sentence. Say if DSO is helping, limiting, or blocking; suggest moving toward <50 if relevant. When stating DSO days, use whole numbers only (e.g. 66 days, not 66.24).

## Overdue (Screen 4)
- Buckets: ${penaltyStr}.
- overdueComment: One short sentence. Where is overdue concentrated? Prioritise clearing 180+ days first.

## Product Mix (Screen 5)
- categoryA–E: share of sales. A/B help score most; E hurts. nrvFactor: product mix score. Helped when nrvFactor >= ${productMixHelpThreshold}.
- productMixComment: One short sentence. Is mix helping or diluting? Suggest pushing A/B.

## What to do next (Screen 6)
- recommendedActions: Items per schema. Each: whatToDo (short title), whyItHelps (1–2 sentences), expectedImpact: High | Medium | Low.
- Focus on the levers that will improve this person’s score most.
`.trim();
}

/** Role-specific instructions. Use when building the user prompt so Gemini can tailor tone/emphasis. */
export const ROLE_INSTRUCTIONS: Record<Role, string> = {
  TM: "The user is a Territory Manager. Commentary should be direct and action-oriented for their territory.",
  RM: "The user is a Regional Manager. Commentary can reference aggregate performance and regional levers.",
  ZM: "The user is a Zonal Manager. Commentary can reference zone-level priorities and delegation.",
  BU: "The user is a BU Head. Commentary can reference business-unit goals and policy.",
};

/**
 * Build the system prompt for Gemini. Use once per request.
 * Programs that call Gemini should pass this as the system instruction.
 */
export function getSystemPrompt(config: AppConfig): string {
  return [buildScorecardContext(config), "\n\n## Output format\n", getGeminiOutputSchema(config)].join("");
}

/**
 * Build the user prompt for Gemini. Pass the scorecard JSON (or a minimal subset) and role.
 * Programs that call Gemini should pass this as the user message.
 */
export function getUserPrompt(scorecardJson: unknown, role: Role): string {
  const roleNote = ROLE_INSTRUCTIONS[role];
  return [
    roleNote,
    "",
    "Based on the following scorecard data, generate the commentary and actions. Return ONLY the JSON object as specified.",
    "",
    "Scorecard data (JSON):",
    JSON.stringify(scorecardJson, null, 0),
  ].join("\n");
}

/**
 * Full prompt set for a given role and scorecard. Use from API routes or serverless.
 * Returns { systemPrompt, userPrompt } so you can call Gemini with the same inputs everywhere.
 */
export function getPromptsForRole(role: Role, scorecardJson: unknown, config: AppConfig): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: getSystemPrompt(config),
    userPrompt: getUserPrompt(scorecardJson, role),
  };
}
