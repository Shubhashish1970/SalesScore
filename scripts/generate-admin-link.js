#!/usr/bin/env node
/**
 * Generate an admin access link for shubhashish@nacl.murugappa.com.
 * Usage: node scripts/generate-admin-link.js [hours]
 * Default expiry: 24 hours.
 */

const ADMIN_EMAIL = "shubhashish@nacl.murugappa.com";
const BASE_URL = "https://salesscore-c34f3.web.app";
const HOURS = parseInt(process.argv[2] || "24", 10);

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
