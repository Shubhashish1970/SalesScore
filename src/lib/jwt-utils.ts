/**
 * JWT utilities for WhatsApp Bot integration.
 * Decodes JWT payload (client-side, no verification).
 * Use ?token=... in URL; payload should contain mobile and role.
 */

export type Role = "TM" | "RM" | "ZM" | "BU";

export interface JwtPayload {
  mobile?: string;
  phone?: string;
  sub?: string;
  role?: string;
  email?: string;
  admin?: boolean;
  [key: string]: unknown;
}

const ADMIN_EMAIL = "shubhashish@nacl.murugappa.com";

export function isAdminToken(payload: JwtPayload | null): boolean {
  if (!payload) return false;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  return email === ADMIN_EMAIL.toLowerCase();
}

/**
 * Decode JWT payload without verification (client-side).
 * Supports: mobile, phone, sub for mobile; role for role.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1];
    if (!payloadB64) return null;
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract mobile and role from JWT payload.
 * mobile: payload.mobile ?? payload.phone ?? payload.sub
 * role: payload.role (TM|RM|ZM|BU)
 */
export function extractMobileAndRole(payload: JwtPayload | null): {
  mobile: string | null;
  role: Role;
} {
  if (!payload) return { mobile: null, role: "TM" };
  const mobile =
    (typeof payload.mobile === "string" && payload.mobile.trim()) ||
    (typeof payload.phone === "string" && payload.phone.trim()) ||
    (typeof payload.sub === "string" && payload.sub.trim()) ||
    null;
  const roleRaw = typeof payload.role === "string" ? payload.role.toUpperCase() : "";
  const role: Role =
    roleRaw === "TM" || roleRaw === "RM" || roleRaw === "ZM" || roleRaw === "BU" ? roleRaw : "TM";
  return { mobile, role };
}
