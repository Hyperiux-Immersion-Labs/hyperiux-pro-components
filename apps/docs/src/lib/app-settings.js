import "server-only";
import { supabase } from "@/lib/supabase";

// Dashboard settings (sql/app_settings.sql), edited in the admin Settings tab. Read on
// many hot paths (every install decision), so cached for 30 seconds per server instance;
// a save clears the cache on the instance that made it, and the others catch up within
// the 30 seconds. A database error falls back to the defaults rather than failing.
const TTL_MS = 30_000;
let cache = null;

export const SETTING_KEYS = ["install_limit_enforced", "internal_emails", "internal_domains"];

export async function getAppSettings() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.values;
  let values = {};
  try {
    const { data, error } = await supabase.from("app_settings").select("key, value");
    if (error) throw error;
    values = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
  } catch (error) {
    console.error("APP_SETTINGS_READ_ERROR:", error?.message || error);
  }
  cache = { at: Date.now(), values };
  return values;
}

export async function setAppSetting(key, value, updatedBy = null) {
  if (!SETTING_KEYS.includes(key)) throw new Error(`Unknown setting: ${key}`);
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: updatedBy }, { onConflict: "key" });
  if (error) throw error;
  cache = null;
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
