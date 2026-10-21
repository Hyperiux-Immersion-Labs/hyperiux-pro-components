import "server-only";
import { supabase } from "@/lib/supabase";
import { PRESET_ROLES, isPermission } from "@/lib/admin-permissions";

// The admin roles (sql/admin_roles.sql), edited in the admin Roles tab. Read on every
// admin request, so cached for 30 seconds per server instance; a change clears the cache
// on the instance that made it, and the others catch up within the 30 seconds. Until the
// table exists (or if it can't be read and nothing was read before), the presets in
// lib/admin-permissions.js stand in, so access never depends on the migration having run.
const TTL_MS = 30_000;
const RETRY_MS = 5_000;
let cache = null;

const shape = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || "",
  permissions: (row.permissions || []).filter(isPermission),
  preset: Boolean(row.preset),
  updatedAt: row.updated_at || null,
});

const presets = () => PRESET_ROLES.map((role) => ({ ...role, preset: true, updatedAt: null }));

// { roles: [role], stored: whether they came from the table (false: presets standing in) }
export async function getAdminRoles() {
  if (cache && Date.now() - cache.at < cache.ttl) return cache.value;
  try {
    const { data, error } = await supabase.from("admin_roles").select("id, name, description, permissions, preset, updated_at").order("name");
    if (error) throw error;
    cache = { at: Date.now(), ttl: TTL_MS, value: { roles: (data || []).map(shape), stored: true } };
  } catch (error) {
    console.error("ADMIN_ROLES_READ_ERROR:", error?.message || error);
    cache = { at: Date.now(), ttl: RETRY_MS, value: cache?.value || { roles: presets(), stored: false } };
  }
  return cache.value;
}

export async function getRolesById() {
  const { roles } = await getAdminRoles();
  return new Map(roles.map((role) => [role.id, role.permissions]));
}

export function clearAdminRolesCache() {
  cache = null;
}

const slug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/** Checks a role's fields from the Roles tab: { name, description, permissions } or { error }. */
export function cleanRoleInput({ name, description = "", permissions = [] } = {}) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName || cleanName.length > 40) return { error: "Give the role a name (up to 40 characters)." };
  if (!slug(cleanName)) return { error: "Use letters or numbers in the name." };
  if (!Array.isArray(permissions)) return { error: "permissions must be a list." };
  const unknown = permissions.filter((key) => !isPermission(key));
  if (unknown.length) return { error: `Unknown permissions: ${unknown.join(", ")}` };
  return {
    name: cleanName,
    description: typeof description === "string" ? description.trim().slice(0, 200) : "",
    permissions: [...new Set(permissions)],
  };
}

export async function createAdminRole({ name, description, permissions }, createdBy) {
  const { data: taken } = await supabase.from("admin_roles").select("id").eq("id", slug(name)).maybeSingle();
  const id = taken ? `${slug(name)}-${Date.now().toString(36)}` : slug(name);
  const { data, error } = await supabase
    .from("admin_roles")
    .insert({ id, name, description, permissions, created_by: createdBy })
    .select("id, name, description, permissions, preset, updated_at")
    .single();
  if (error) throw error;
  clearAdminRolesCache();
  return shape(data);
}

export async function updateAdminRole(id, { name, description, permissions }) {
  const { data, error } = await supabase
    .from("admin_roles")
    .update({ name, description, permissions, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, permissions, preset, updated_at")
    .maybeSingle();
  if (error) throw error;
  clearAdminRolesCache();
  return data ? shape(data) : null;
}

export async function deleteAdminRole(id) {
  const { error, count } = await supabase.from("admin_roles").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  clearAdminRolesCache();
  return count > 0;
}
