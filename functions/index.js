/**
 * Firebase Cloud Function (2nd gen): Proxies GET /api/scorecard?mobile=...&role=...
 * to the upstream KPI API. Avoids CORS by serving same-origin.
 * Set KPI_API_UPSTREAM_URL in .env (created during CI from KPI_DATA_API_URL secret).
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const { onRequest } = require("firebase-functions/v2/https");

const UPSTREAM = process.env.KPI_API_UPSTREAM_URL || process.env.KPI_DATA_API_URL || "";

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
