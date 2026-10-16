import "server-only";
import { supabase } from "@/lib/supabase";

// Dashboard settings (sql/app_settings.sql), edited in the admin Settings tab. Read on
// many hot paths (every install decision), so cached for 30 seconds per server instance;
// a save clears the cache on the instance that made it, and the others catch up within
// the 30 seconds. A database error keeps the last values read (the defaults only if none
// were ever read) and tries again after 5 seconds, so a blip never flips a setting.
const TTL_MS = 30_000;
const RETRY_MS = 5_000;
let cache = null;

export const SETTING_KEYS = ["install_limit_enforced", "internal_emails", "internal_domains"];

export async function getAppSettings() {
  if (cache && Date.now() - cache.at < cache.ttl) return cache.values;
  try {
    const { data, error } = await supabase.from("app_settings").select("key, value");
    if (error) throw error;
    const values = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
    cache = { at: Date.now(), ttl: TTL_MS, values };
  } catch (error) {
    console.error("APP_SETTINGS_READ_ERROR:", error?.message || error);
    cache = { at: Date.now(), ttl: RETRY_MS, values: cache?.values || {} };
  }
  return cache.values;
}

export async function setAppSetting(key, value, updatedBy = null) {
  if (!SETTING_KEYS.includes(key)) throw new Error(`Unknown setting: ${key}`);
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: updatedBy }, { onConflict: "key" });
  if (error) throw error;
  // Read again on next use; the saved value stands in if that read fails
  cache = { at: 0, ttl: 0, values: { ...cache?.values, [key]: value } };
}

export function clearAppSettingsCache() {
  cache = null;
}

// Whether the daily install limit is applied: the dashboard setting, or with none saved,
// the INSTALL_LIMIT_ENFORCE environment variable (read each time, so tests can flip it)
export async function isInstallLimitEnforced() {
  const setting = (await getAppSettings()).install_limit_enforced;
  return typeof setting === "boolean" ? setting : process.env.INSTALL_LIMIT_ENFORCE === "true";
}

// The extra internal emails / domains saved in the dashboard, lower-cased
export async function getInternalLists() {
  const settings = await getAppSettings();
  const clean = (list) => (Array.isArray(list) ? list.map((item) => String(item).trim().toLowerCase()).filter(Boolean) : []);
  return { emails: clean(settings.internal_emails), domains: clean(settings.internal_domains) };
}
