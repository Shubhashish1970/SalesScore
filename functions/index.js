/**
 * Firebase Cloud Function (2nd gen): Proxies GET /api/scorecard and GET /api/leaderboard
 * to the upstream KPI API. Avoids CORS by serving same-origin.
 * Scorecard: mobile + role. Leaderboard: role only.
 * requestAdminLink: POST /api/admin/request-link with { email } - if email matches admin,
 *   sends admin link to that email.
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { Resend } = require("resend");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const HO_MAPPINGS_DOC = "config/ho-mappings";
const ACCESS_CONFIG_DOC = "config/access-config";

const UPSTREAM = process.env.KPI_API_UPSTREAM_URL || process.env.KPI_DATA_API_URL || "";
const ADMIN_EMAIL = "shubhashish@nacl.murugappa.com";
const BASE_URL = process.env.APP_BASE_URL || "https://salesscore-c34f3.web.app";

function getLeaderboardBaseUrl() {
  if (!UPSTREAM) return "";
  try {
    const u = new URL(UPSTREAM);
    return `${u.origin}/leaderboard`;
  } catch {
    return "";
  }
}

exports.kpiProxy = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const mobile = req.query.mobile || "";
    const role = req.query.role || "TM";
    const areaCode = req.query.areaCode || "";
    if (!mobile || !role) {
      res.status(400).json({ error: "mobile and role query params required" });
      return;
    }
    if (!UPSTREAM) {
      res.status(503).json({ error: "KPI proxy not configured: KPI_API_UPSTREAM_URL missing" });
      return;
    }
    try {
      const url = new URL(UPSTREAM);
      url.searchParams.set("mobile", mobile);
      url.searchParams.set("role", role);
      if (areaCode) {
        url.searchParams.set("areaCode", areaCode);
      }
      const proxyRes = await fetch(url.toString(), { method: "GET" });
      const data = await proxyRes.json();
      res.status(proxyRes.status).json(data);
    } catch (err) {
      console.error("[kpiProxy] fetch error:", err?.message);
      res.status(502).json({ error: "Upstream proxy failed" });
    }
  }
);

exports.leaderboardProxy = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const role = String(req.query.role || "TM");
    const validRoles = ["TM", "RM", "ZM"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: "role must be TM, RM, or ZM" });
      return;
    }
    const baseUrl = getLeaderboardBaseUrl();
    if (!baseUrl) {
      res.status(503).json({ error: "Leaderboard proxy not configured" });
      return;
    }
    try {
      const url = `${baseUrl}?role=${encodeURIComponent(role)}`;
      const proxyRes = await fetch(url, { method: "GET" });
      const data = await proxyRes.json();
      res.status(proxyRes.status).json(data);
    } catch (err) {
      console.error("[leaderboardProxy] fetch error:", err?.message);
      res.status(502).json({ error: "Leaderboard upstream failed" });
    }
  }
);

function b64(o) {
  return Buffer.from(JSON.stringify(o))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateAdminToken(hours = 24) {
  const header = b64({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email: ADMIN_EMAIL,
    iat: now,
    exp: now + hours * 3600,
  };
  const payloadB64 = b64(payload);
  const sig = b64("admin-signature");
  return `${header}.${payloadB64}.${sig}`;
}

exports.requestAdminLink = onRequest(
  { cors: true },
  async (req, res) => {
    const log = (step, msg, extra) => {
      const entry = { step, msg, ...(extra && { extra }) };
      console.log("[requestAdminLink]", JSON.stringify(entry));
    };
    log("start", "Request received", { method: req.method, hasBody: !!req.body, hasRawBody: !!req.rawBody });

    if (req.method !== "POST") {
      log("reject", "Method not allowed");
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    let email = "";
    try {
      let body = req.body;
      if (!body && req.rawBody) {
        log("parse", "Using rawBody (req.body was empty)");
        body = JSON.parse(req.rawBody.toString());
      }
      body = typeof body === "string" ? JSON.parse(body) : body || {};
      email = String(body.email || "").trim().toLowerCase();
      log("parse", "Body parsed", { email: email ? `${email.slice(0, 3)}***` : "(empty)" });
    } catch (e) {
      log("parse", "Body parse failed", { error: e?.message });
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    if (!email) {
      log("reject", "Email empty");
      res.status(400).json({ error: "email is required" });
      return;
    }
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      log("reject", "Email not authorized", { expected: ADMIN_EMAIL });
      res.status(200).json({ ok: true, message: "If your email is authorized, you will receive the admin link shortly." });
      return;
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      log("reject", "RESEND_API_KEY not set");
      res.status(503).json({ error: "Email service not configured" });
      return;
    }
    log("send", "Attempting Resend send", { from: process.env.RESEND_FROM_EMAIL || "admin@kweka.ai", to: ADMIN_EMAIL });
    try {
      const token = generateAdminToken(24);
      const adminUrl = `${BASE_URL}/?token=${token}`;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Sales Scorecard <admin@kweka.ai>";
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [ADMIN_EMAIL],
        subject: "Sales Scorecard – Admin Configuration Link",
        html: `
          <p>Your admin configuration link is ready. It expires in 24 hours.</p>
          <p><a href="${adminUrl}">Open Admin Settings</a></p>
          <p>Or copy this URL:</p>
          <p style="word-break:break-all;color:#64748b;">${adminUrl}</p>
        `,
      });
      if (error) {
        log("resend_error", "Resend API returned error", { error: JSON.stringify(error) });
        res.status(500).json({ error: "Failed to send email. Check RESEND_API_KEY and Resend dashboard." });
        return;
      }
      log("success", "Email sent", { id: data?.id });
      res.status(200).json({ ok: true, message: "Admin link sent to your email." });
    } catch (err) {
      log("exception", "Unexpected error", { message: err?.message, stack: err?.stack });
      res.status(500).json({ error: "Failed to send email. Check RESEND_API_KEY and Resend dashboard." });
    }
  }
);

exports.getHoMappings = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    try {
      const snap = await db.doc(HO_MAPPINGS_DOC).get();
      const data = snap.exists ? snap.data() : null;
      const mappings = Array.isArray(data?.mappings) ? data.mappings : [];
      res.status(200).json({ mappings });
    } catch (err) {
      console.error("[getHoMappings] error:", err?.message, err?.stack);
      res.status(500).json({ error: "Failed to load HO mappings", detail: err?.message });
    }
  }
);

exports.saveHoMappings = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    let mappings = [];
    try {
      let body = req.body;
      if (!body && req.rawBody) {
        body = JSON.parse(req.rawBody.toString());
      }
      body = typeof body === "string" ? JSON.parse(body) : body || {};
      mappings = Array.isArray(body.mappings) ? body.mappings : [];
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    try {
      await db.doc(HO_MAPPINGS_DOC).set({ mappings }, { merge: true });
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[saveHoMappings] error:", err?.message, err?.stack);
      res.status(500).json({ error: "Failed to save HO mappings", detail: err?.message });
    }
  }
);

exports.getAccessConfig = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    try {
      const snap = await db.doc(ACCESS_CONFIG_DOC).get();
      const data = snap.exists ? snap.data() : null;
      res.status(200).json({
        allowUrlAccess: data?.allowUrlAccess !== false,
        allowTokenAccess: data?.allowTokenAccess !== false,
      });
    } catch (err) {
      console.error("[getAccessConfig] error:", err?.message);
      res.status(500).json({ error: "Failed to load access config", allowUrlAccess: true, allowTokenAccess: true });
    }
  }
);

exports.saveAccessConfig = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    let allowUrlAccess = true;
    let allowTokenAccess = true;
    try {
      let body = req.body;
      if (!body && req.rawBody) {
        body = JSON.parse(req.rawBody.toString());
      }
      body = typeof body === "string" ? JSON.parse(body) : body || {};
      allowUrlAccess = body.allowUrlAccess !== false;
      allowTokenAccess = body.allowTokenAccess !== false;
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    try {
      await db.doc(ACCESS_CONFIG_DOC).set({ allowUrlAccess, allowTokenAccess }, { merge: true });
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[saveAccessConfig] error:", err?.message);
      res.status(500).json({ error: "Failed to save access config" });
    }
  }
);
