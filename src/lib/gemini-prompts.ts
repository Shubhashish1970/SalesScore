/**
 * Central Gemini prompts and output contract for Sales Scorecard commentary.
 * Use this module from API routes, serverless functions, or any program that calls Gemini.
 * Prompts are organized by role so the same calls can be reused across the app.
 */

import type { Role } from "@/types/scorecard";

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

/** Output contract: exact JSON schema description for Gemini. */
export const GEMINI_OUTPUT_SCHEMA = `
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
- recommendedActions: minimum 3, maximum 5 items.
`.trim();

/** Scorecard context: methodology and bands. Shown to Gemini so it understands scoring. */
export const SCORECARD_CONTEXT = `
You are a coach for a Sales Scorecard. The scorecard has already computed all scores and KPIs.
Your job is ONLY to generate short, human-readable commentary and 3–5 recommended actions.

## Overall score
- finalScore out of maxScore (e.g. 120).
- Bands: Red (score < redEnd, e.g. 80), Amber (redEnd to amberEnd, e.g. 90), Green (above amberEnd).
- achievementMessage: One short sentence under the gauge. Vary your wording every time — do NOT use the same phrase (e.g. avoid always saying "Your score is in the X zone — keep it up.").
  - Green: Celebrate and encourage. Use varied phrasing: e.g. "Strong run — your numbers are in the top band.", "Green zone. Keep building on this momentum.", "You're in the top band — the actions below will help you stay here."
  - Amber: Encourage with direction: e.g. "You're close to Green — one or two levers can get you there.", "Amber zone. Small improvements in the areas below will push you into Green."
  - Red: Encourage without demotivating; point to specific levers: e.g. "Focus on DSO and overdue to unlock more score.", "Red zone — the next screens show exactly where to improve."
- Tone: warm, motivating, and specific to the band. Make the person feel recognised and clear on what to do next.

## Growth (Screen 2)
- growthPercent: YoY growth %. growthFactor: 1 = achieved, 0 = not achieved (score blocked).
- Green: >5%, Amber: 0–5%, Red: <0%.
- growthComment: One short sentence. State whether growth is achieved and what it means for the score.

## Collection Speed – DSO (Screen 3)
- dsoDays: days to collect. Bands: <50 (best), 50–110, 110–170, >170 (worst). Each band has a factor (e.g. 1.2, 1.1, 1, 0).
- dsoComment: One short sentence. Say if DSO is helping, limiting, or blocking; suggest moving toward <50 if relevant.

## Overdue (Screen 4)
- Buckets: on time, 1–110, 111–180, 181–270, 271–365, >365 days. Penalties increase with age (e.g. 0, 0, 20%, 50%, 100%, 200%).
- overdueComment: One short sentence. Where is overdue concentrated? Prioritise clearing 180+ days first.

## Product Mix (Screen 5)
- categoryA–E: share of sales. A/B help score most; E hurts. nrvFactor: product mix score.
- productMixComment: One short sentence. Is mix helping or diluting? Suggest pushing A/B.

## What to do next (Screen 6)
- recommendedActions: 3–5 items. Each: whatToDo (short title), whyItHelps (1–2 sentences), expectedImpact: High | Medium | Low.
- Focus on the levers that will improve this person’s score most.
`.trim();

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
export function getSystemPrompt(): string {
  return [SCORECARD_CONTEXT, "\n\n## Output format\n", GEMINI_OUTPUT_SCHEMA].join("");
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
export function getPromptsForRole(role: Role, scorecardJson: unknown): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: getSystemPrompt(),
    userPrompt: getUserPrompt(scorecardJson, role),
  };
}
