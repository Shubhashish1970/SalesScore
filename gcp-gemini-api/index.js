/**
 * GCP Cloud Function (Gen2): POST body = scorecard JSON → returns Gemini commentary JSON.
 * Set GEMINI_API_KEY (or GOOGLE_API_KEY) in the function's environment.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Full commentary: reasoning + accuracy
const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-pro"];
// Achievement-only: fastest model for first-screen update
const ACHIEVEMENT_MODEL = "gemini-1.5-flash";
const ACHIEVEMENT_FALLBACK = "gemini-1.5-flash-8b";

const GEMINI_OUTPUT_SCHEMA = `
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

const SCORECARD_CONTEXT = `
You are a coach for a Sales Scorecard. The scorecard has already computed all scores and KPIs.
Your job is ONLY to generate short, human-readable commentary and 3–5 recommended actions.

## Overall score
- finalScore out of maxScore (e.g. 120).
- Bands: Red (score < redEnd, e.g. 80), Amber (redEnd to amberEnd, e.g. 90), Green (above amberEnd).
- achievementMessage: One short sentence under the gauge. MUST use the user's name to personalize (e.g. "Pushpanathan, strong run — your numbers are in the top band."). Vary wording; do NOT repeat the same phrase.
  - Green: Celebrate and encourage. E.g. "[Name], strong run — your numbers are in the top band.", "Well done, [Name] — Green zone. Keep building on this momentum."
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
- Focus on the levers that will improve this person's score most.
`.trim();

const REST_FIELDS = ["growthComment", "dsoComment", "overdueComment", "productMixComment", "recommendedActions"];
const REST_SCHEMA = `
Return ONLY valid JSON with these keys. No achievementMessage. No extra keys. No markdown.

{
  "growthComment": "string",
  "dsoComment": "string",
  "overdueComment": "string",
  "productMixComment": "string",
  "recommendedActions": [
    { "whatToDo": "string", "whyItHelps": "string", "expectedImpact": "High" | "Medium" | "Low" }
  ]
}
`.trim();

function getRestSystemPrompt() {
  return [SCORECARD_CONTEXT, "\n\n## Output format (screens 2–6 only, no achievementMessage)\n", REST_SCHEMA].join("");
}

const ROLE_INSTRUCTIONS = {
  TM: "The user is a Territory Manager. Commentary should be direct and action-oriented for their territory.",
  RM: "The user is a Regional Manager. Commentary can reference aggregate performance and regional levers.",
  ZM: "The user is a Zonal Manager. Commentary can reference zone-level priorities and delegation.",
  BU: "The user is a BU Head. Commentary can reference business-unit goals and policy.",
};

/** Achievement-only: minimal prompt, use name for personalization. Fast first-screen update. */
const ACHIEVEMENT_SCHEMA = `
Return ONLY valid JSON: { "achievementMessage": "string" }
- One short sentence under the gauge.
- MUST use the user's name to personalize (e.g. "Pushpanathan, strong run — your numbers are in the top band." or "Well done, Pushpanathan — you're in the Green zone.").
- Vary wording; do NOT repeat the same phrase every time.
- By band: Green — celebrate; Amber — encourage to reach Green; Red — encourage, point to DSO/overdue.
`.trim();

function getAchievementSystemPrompt() {
  return ACHIEVEMENT_SCHEMA;
}

function getAchievementUserPrompt(payload) {
  const { name, finalScore, maxScore, redEnd = 80, amberEnd = 90, role } = payload;
  return [
    `User: ${name || "there"}. Role: ${role || "TM"}. Score: ${finalScore}/${maxScore}. Bands: Red <${redEnd}, Amber ${redEnd}–${amberEnd}, Green >${amberEnd}.`,
    "",
    "Generate achievementMessage. Return ONLY JSON: { \"achievementMessage\": \"...\" }",
  ].join("\n");
}

function getSystemPrompt() {
  return [SCORECARD_CONTEXT, "\n\n## Output format\n", GEMINI_OUTPUT_SCHEMA].join("");
}

function getUserPrompt(scorecardJson, role, restOnly = false) {
  const roleNote = ROLE_INSTRUCTIONS[role] || ROLE_INSTRUCTIONS.TM;
  const base = [
    roleNote,
    "",
    "Based on the following scorecard data, generate the commentary and actions. Return ONLY the JSON object as specified.",
    "",
    "Scorecard data (JSON):",
    JSON.stringify(scorecardJson, null, 0),
  ];
  if (!restOnly) {
    base.splice(2, 0, "", "IMPORTANT: Use the user's name (from the scorecard) in achievementMessage to personalize (e.g. 'Pushpanathan, strong run — ...').");
  }
  return base.join("\n");
}

function extractJson(text) {
  const trimmed = text.trim();
  const jsonBlock = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

async function generateWithModel(genAI, modelId, systemPrompt, userPrompt) {
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

async function generateAchievementOnly(scorecard, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }
  const payload = {
    name: scorecard.name || "there",
    finalScore: scorecard.finalScore ?? 0,
    maxScore: scorecard.maxScore ?? 120,
    redEnd: scorecard.scoreBandThresholds?.redEnd ?? 80,
    amberEnd: scorecard.scoreBandThresholds?.amberEnd ?? 90,
    role: scorecard.role || "TM",
  };
  const systemPrompt = getAchievementSystemPrompt();
  const userPrompt = getAchievementUserPrompt(payload);
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [ACHIEVEMENT_MODEL, ACHIEVEMENT_FALLBACK, DEFAULT_MODEL, ...FALLBACK_MODELS];
  let raw;
  let lastErr;
  for (const modelId of modelsToTry) {
    try {
      raw = await generateWithModel(genAI, modelId, systemPrompt, userPrompt);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const msg = err?.message || String(err);
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn("Achievement: model", modelId, "not available, trying next. ", msg.slice(0, 60));
      } else {
        throw err;
      }
    }
  }
  if (lastErr || raw === undefined) {
    throw lastErr || new Error("No model available.");
  }
  const jsonStr = extractJson(raw);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Gemini returned invalid JSON for achievementMessage.");
  }
  const msg = String(parsed?.achievementMessage ?? "");
  if (!msg.trim()) {
    throw new Error("Gemini returned empty achievementMessage.");
  }
  return { achievementMessage: msg };
}

async function generateCommentaryRest(scorecard, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }
  const role = scorecard.role || "TM";
  const systemPrompt = getRestSystemPrompt();
  const userPrompt = getUserPrompt(scorecard, role, true);
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS];
  let raw;
  let lastErr;
  for (const modelId of modelsToTry) {
    try {
      raw = await generateWithModel(genAI, modelId, systemPrompt, userPrompt);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const msg = err?.message || String(err);
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn("Commentary rest: model", modelId, "not available, trying next. ", msg.slice(0, 60));
      } else {
        throw err;
      }
    }
  }
  if (lastErr || raw === undefined) {
    throw lastErr || new Error("No model available.");
  }
  const jsonStr = extractJson(raw);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Gemini returned invalid JSON for commentary rest.");
  }
  return {
    growthComment: String(parsed.growthComment ?? ""),
    dsoComment: String(parsed.dsoComment ?? ""),
    overdueComment: String(parsed.overdueComment ?? ""),
    productMixComment: String(parsed.productMixComment ?? ""),
    recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
  };
}

async function generateCommentary(scorecard, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }
  const role = scorecard.role || "TM";
  const systemPrompt = getSystemPrompt();
  const userPrompt = getUserPrompt(scorecard, role, false);
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS];
  let raw;
  let lastErr;
  for (const modelId of modelsToTry) {
    try {
      raw = await generateWithModel(genAI, modelId, systemPrompt, userPrompt);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const msg = err?.message || String(err);
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn("Commentary: model", modelId, "not available, trying next. ", msg.slice(0, 60));
      } else {
        throw err;
      }
    }
  }
  if (lastErr || raw === undefined) {
    throw lastErr || new Error("No model available.");
  }
  const jsonStr = extractJson(raw);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Gemini returned invalid JSON for commentary.");
  }
  return {
    achievementMessage: String(parsed.achievementMessage ?? ""),
    growthComment: String(parsed.growthComment ?? ""),
    dsoComment: String(parsed.dsoComment ?? ""),
    overdueComment: String(parsed.overdueComment ?? ""),
    productMixComment: String(parsed.productMixComment ?? ""),
    recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
  };
}

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

/** Read raw body from request stream (Cloud Run/Gen2 may not populate req.body). */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/**
 * Cloud Function entry point (Gen2 HTTP).
 */
exports.geminiCommentary = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }
  let scorecard;
  try {
    let raw = req.body;
    if (raw === undefined || raw === null) {
      raw = await readBody(req);
    }
    if (typeof raw === "string") {
      scorecard = raw.trim() ? JSON.parse(raw) : {};
    } else if (Buffer.isBuffer(raw)) {
      scorecard = raw.length ? JSON.parse(raw.toString()) : {};
    } else if (typeof raw === "object" && raw !== null) {
      scorecard = raw;
    } else {
      scorecard = {};
    }
  } catch (e) {
    console.error("Commentary body parse error:", e?.message || e);
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  const body = typeof scorecard === "object" && scorecard !== null ? scorecard : {};
  const payload = body.scorecard ?? body;
  const fields = Array.isArray(body.fields) ? body.fields : null;
  const reqScorecard = payload && typeof payload === "object" ? payload : scorecard;

  if (!reqScorecard.role || !reqScorecard.mobile) {
    res.status(400).json({ error: "Invalid scorecard: role and mobile required." });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    res.status(503).json({ error: "Gemini API key not configured." });
    return;
  }
  const isAchievementOnly = fields && fields.length === 1 && fields[0] === "achievementMessage";
  const isRestOnly = fields && fields.length >= 5 && fields.every((f) => REST_FIELDS.includes(f));

  try {
    let commentary;
    if (isAchievementOnly) {
      commentary = await generateAchievementOnly(reqScorecard, apiKey);
      console.log("Achievement:", commentary.achievementMessage?.slice(0, 80) + (commentary.achievementMessage?.length > 80 ? "…" : ""));
    } else if (isRestOnly) {
      commentary = await generateCommentaryRest(reqScorecard, apiKey);
    } else {
      commentary = await generateCommentary(reqScorecard, apiKey);
      const msg = commentary.achievementMessage || "";
      console.log("Commentary achievementMessage:", msg.slice(0, 120) + (msg.length > 120 ? "…" : ""));
    }
    res.status(200).json(commentary);
  } catch (err) {
    const message = err.message || "Commentary generation failed.";
    console.error("Commentary generation error:", message, err?.stack || "");
    res.status(500).json({ error: message });
  }
};
