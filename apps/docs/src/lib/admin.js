import "server-only";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { effectivePermissions, readAccess } from "@/lib/admin-permissions";
import { getAdminRoles, getRolesById } from "@/lib/admin-roles";

// Who can use the admin dashboard, and what they may do there (ADMIN_ROLES_PLAN.md).
//
// The owner - the one super admin - can do everything, including managing roles and
// access. Every other admin has the basic views (Activity, Users,
// without money) plus the permissions their roles give and any granted to them one by
// one (lib/admin-permissions). Access lives on the Clerk account:
//   publicMetadata.role  - "super_admin" for the owner; "none" once access is set here
//                          (an old "admin" with no roles gives nothing: Legacy admin is gone)
//   publicMetadata.admin - { roles: [role id], grant: [permission], revoke: [permission] }

export const ROLES = { SUPER_ADMIN: "super_admin", ADMIN: "admin" };

// Stored as publicMetadata.role when access is taken away. Clerk deletes a metadata key
// set to null, which would let the ADMIN_EMAIL fallback below hand the role straight back.
export const REVOKED_ROLE = "none";

// No hardcoded fallback: if ADMIN_EMAIL is unset, email-based owner access is simply
// unavailable - only an explicit publicMetadata.role still works. The ADMIN_EMAIL
// fallback only applies when metadata hasn't set a role of its own.
export function isOwnerUser(user) {
  if (!user) return false;
  const metaRole = user.publicMetadata?.role;
  if (metaRole === ROLES.SUPER_ADMIN) return true;
  if (metaRole) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  return Boolean(adminEmail && user.emailAddresses?.[0]?.emailAddress === adminEmail);
}

// An account's roles, grants and removals
export function accessOf(user) {
  return readAccess(user?.publicMetadata);
}

/** "super_admin" (the owner), "admin" (any other admin) or null. Synchronous - no roles needed. */
export function getRole(user) {
  if (!user) return null;
  if (isOwnerUser(user)) return ROLES.SUPER_ADMIN;
  const { roles, grant } = accessOf(user);
  return roles.length || grant.length ? ROLES.ADMIN : null;
}

export function isAdminUser(user) {
  return getRole(user) !== null;
}

export function isSuperAdminUser(user) {
  return getRole(user) === ROLES.SUPER_ADMIN;
}

/**
 * What an account may do in the admin dashboard:
 * { userId, owner, admin, permissions: Set, roles, grant, revoke }.
 */
export async function getAdminAccess(user) {
  const owner = isOwnerUser(user);
  const access = accessOf(user);
  const admin = owner || access.roles.length > 0 || access.grant.length > 0;
  const permissions = admin ? effectivePermissions({ owner, ...access, rolesById: await getRolesById() }) : new Set();
  return { userId: user?.id || null, owner, admin, permissions, ...access };
}

export const can = (access, key) => Boolean(access?.permissions?.has(key));

/**
 * An account's admin access for the screens that describe it (the sidebar card, the admin
 * view's "Your access"): { owner, admin, roleNames, permissions: [key] } - names, not ids.
 */
export async function getAdminAccessSummary(user) {
  const access = await getAdminAccess(user);
  if (!access.admin) return { owner: false, admin: false, roleNames: [], permissions: [] };
  const { roles } = await getAdminRoles();
  const names = new Map(roles.map((role) => [role.id, role.name]));
  return {
    owner: access.owner,
    admin: true,
    roleNames: access.owner ? [] : access.roles.map((id) => names.get(id)).filter(Boolean),
    permissions: [...access.permissions],
  };
}

// The signed-in account's access, read fresh from Clerk: a change to someone's access
// takes effect on their next request
async function requestAccess() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerk = await clerkClient();
  return getAdminAccess(await clerk.users.getUser(userId));
}

/** API routes open to every admin (the basic views): the access, or null for a 403. */
export async function requireAdminAccess() {
  const access = await requestAccess();
  return access?.admin ? access : null;
}

/** API routes that need one permission: the access, or null for a 403. */
export async function requirePermission(key) {
  const access = await requestAccess();
  return access?.admin && can(access, key) ? access : null;
}

/** Roles and access management: the owner only. The access, or null for a 403. */
export async function requireOwner() {
  const access = await requestAccess();
  return access?.owner ? access : null;
}

// For server components that already have a Clerk `user` via currentUser().
export async function requireAdmin() {
  return isAdminUser(await currentUser());
}

export async function requireSuperAdmin() {
  return isSuperAdminUser(await currentUser());
}

// Older checks, kept for routes outside the admin dashboard
export async function assertAdmin() {
  return Boolean(await requireAdminAccess());
}

export async function assertSuperAdmin() {
  return Boolean(await requireOwner());
}

export async function getRequestRole() {
  const access = await requestAccess();
  return access?.owner ? ROLES.SUPER_ADMIN : access?.admin ? ROLES.ADMIN : null;
}
