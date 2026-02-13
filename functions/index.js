/**
 * Firebase Cloud Function (2nd gen): Proxies GET /api/scorecard and GET /api/leaderboard
 * to the upstream KPI API. Avoids CORS by serving same-origin.
 * Scorecard: mobile + role. Leaderboard: role only.
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const { onRequest } = require("firebase-functions/v2/https");

const UPSTREAM = process.env.KPI_API_UPSTREAM_URL || process.env.KPI_DATA_API_URL || "";

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
