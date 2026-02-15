/**
 * Access configuration: URL access (?mobile=...&role=...) vs Token access (?token=...).
 * Fetched from API (Firestore) so all users see the same config.
 */

export interface AccessConfig {
  allowUrlAccess: boolean;
  allowTokenAccess: boolean;
}

const DEFAULTS: AccessConfig = {
  allowUrlAccess: true,
  allowTokenAccess: true,
};

/**
 * Fetch access config from API. Returns defaults on failure.
 */
export async function fetchAccessConfigFromApi(): Promise<AccessConfig> {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const res = await fetch(`${window.location.origin}/api/access-config`, { method: "GET" });
    if (!res.ok) return DEFAULTS;
    const data = (await res.json()) as { allowUrlAccess?: boolean; allowTokenAccess?: boolean };
    return {
      allowUrlAccess: data?.allowUrlAccess !== false,
      allowTokenAccess: data?.allowTokenAccess !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Save access config to API.
 */
export async function saveAccessConfigToApi(config: AccessConfig): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(`${window.location.origin}/api/admin/access-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch {
    return false;
  }
}
