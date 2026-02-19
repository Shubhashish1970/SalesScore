#!/usr/bin/env node
/**
 * Generate an admin access link for shubhashish@nacl.murugappa.com.
 * Usage: node scripts/generate-admin-link.js [hours]
 *        BASE_URL=https://<project>.web.app node scripts/generate-admin-link.js
 * Default expiry: 24 hours. BASE_URL or APP_BASE_URL must be set (no hardcoded default).
 */

const ADMIN_EMAIL = "shubhashish@nacl.murugappa.com";
const BASE_URL =
  process.env.APP_BASE_URL ||
  process.env.BASE_URL ||
  (() => {
    const arg = process.argv.find((a) => a.startsWith("--base-url="));
    return arg ? arg.split("=")[1] : "";
  })();
const args = process.argv.filter((a) => !a.startsWith("--base-url="));
const HOURS = parseInt(args[2] || "24", 10);

if (!BASE_URL) {
  console.error("Set BASE_URL or APP_BASE_URL env, or use --base-url=https://....web.app");
  process.exit(1);
}

function b64(o) {
  return Buffer.from(JSON.stringify(o))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const header = b64({ alg: "HS256", typ: "JWT" });
const now = Math.floor(Date.now() / 1000);
const payload = {
  email: ADMIN_EMAIL,
  iat: now,
  exp: now + HOURS * 3600,
};
const payloadB64 = b64(payload);
const sig = b64("admin-signature"); // Placeholder; use JWT_SECRET for production signing
const token = `${header}.${payloadB64}.${sig}`;
const url = `${BASE_URL}/?token=${token}`;

console.log("Admin link (valid for", HOURS, "hours):");
console.log(url);
