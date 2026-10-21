// What an admin may do in the admin dashboard (ADMIN_ROLES_PLAN.md). Safe in the
// browser: the Roles tab and the Manage drawer render from it, and the server checks
// against the same keys (lib/admin requirePermission).
//
// Every admin always has the basic views - Activity and Users, without revenue or
// payments. Everything below is granted by the owner (the one super admin), through
// roles or one by one. Managing roles and access isn't a permission: only the owner can,
// so it can never be granted.

export const PERMISSION_GROUPS = [
  { id: "finance", label: "Finance" },
  { id: "users", label: "Users" },
  { id: "effects", label: "Effects" },
  { id: "system", label: "System" },
];

export const PERMISSIONS = {
  "finance.view": { group: "finance", label: "View finances", description: "Revenue, lifetime spend, user payments, invoice emails, the Invoicing tab and the Razorpay log", does: "See revenue, payments, invoices and the Razorpay log" },
  "finance.manage": { group: "finance", label: "Manage payments", description: "Refund, cancel a subscription, sync with Razorpay, exclude a payment from revenue", does: "Refund payments, cancel subscriptions, sync with Razorpay and leave a payment out of revenue" },
  "users.export": { group: "users", label: "Export users", description: "Download the users CSV", does: "Download the users list as a CSV" },
  "users.invite": { group: "users", label: "Invite", description: "Send waitlist invites", does: "Invite people from the waitlist" },
  "users.create": { group: "users", label: "Create accounts", description: "Make an account with a password and send its sign-in details", does: "Create accounts and send their sign-in details" },
  "users.plan": { group: "users", label: "Change plans", description: "Give or remove Pro", does: "Give or remove Pro and Pro+" },
  "users.support": { group: "users", label: "Support", description: "Add or remove template credits, give a template free, allow extra installs today, write notes", does: "Add or remove template credits, give a template free, allow extra installs for today and write team notes" },
  "users.reset": { group: "users", label: "Password resets", description: "Send a password reset email", does: "Send password reset emails" },
  "users.suspend": { group: "users", label: "Suspend", description: "Suspend or restore an account", does: "Suspend and restore customer accounts" },
  "users.internal": { group: "users", label: "Internal accounts", description: "Mark an account internal or count it as a customer", does: "Mark an account internal or count it as a customer" },
  "effects.view": { group: "effects", label: "Effect health", description: "The Effects tab: where effects' Sanity guides and the registry disagree", does: "See effect health: where Sanity guides and the registry disagree" },
  "effects.manage": { group: "effects", label: "Refresh effect pages", description: "Rebuild an effect's cached page (includes Effect health, where the button is)", does: "Refresh effect pages" },
  "emails.view": { group: "system", label: "Email log", description: "Every email Vault sent and whether it went out (invoice amounts need View finances)", does: "See the Email log: every email Vault sent and whether it went out" },
  "log.view": { group: "system", label: "Admin log", description: "See every change made from the admin dashboard", does: "See every change made in the admin dashboard" },
  "settings.manage": { group: "system", label: "Settings", description: "Install limits and the internal emails and domains", does: "Change install limits and the internal emails and domains" },
};

export const PERMISSION_KEYS = Object.keys(PERMISSIONS);

export const isPermission = (key) => Object.hasOwn(PERMISSIONS, key);

// The built-in roles (sql/admin_roles.sql seeds the same ones; ADMIN_ROLES_PLAN.md says
// who does what). Super admins can add their own in the Roles tab.
export const PRESET_ROLES = [
  {
    id: "support",
    name: "Support",
    description: "Helps customers: credits, templates, extra installs, notes, password resets and suspensions",
    permissions: ["users.support", "users.reset", "users.suspend"],
  },
  {
    id: "user-management",
    name: "User Management",
    description: "Runs accounts: creates them, changes plans, resets, suspensions, internal accounts, invites, the export and the Email log",
    permissions: ["users.create", "users.plan", "users.reset", "users.suspend", "users.internal", "users.invite", "users.export", "emails.view"],
  },
  {
    id: "system-admin",
    name: "System Admin",
    description: "Keeps the platform running: the Email log, the admin log and settings, plus password resets and new accounts",
    permissions: ["users.create", "users.reset", "emails.view", "log.view", "settings.manage"],
  },
];

/**
 * An account's admin access as stored on it (Clerk publicMetadata.admin), cleaned:
 * { roles: [role id], grant: [permission], revoke: [permission] }.
 */
export function readAccess(publicMetadata = {}) {
  const raw = publicMetadata?.admin && typeof publicMetadata.admin === "object" ? publicMetadata.admin : {};
  const list = (value) => (Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === "string"))] : []);
  return { roles: list(raw.roles), grant: list(raw.grant).filter(isPermission), revoke: list(raw.revoke).filter(isPermission) };
}

/**
 * What an admin may do: every permission for the owner; otherwise every permission their
 * roles give, plus the ones granted to them, minus the ones taken away. `rolesById` maps a
 * role id to its permissions; unknown roles and keys count for nothing.
 */
export function effectivePermissions({ owner = false, roles = [], grant = [], revoke = [], rolesById = new Map() }) {
  if (owner) return new Set(PERMISSION_KEYS);
  const permissions = new Set();
  for (const id of roles) for (const key of rolesById.get(id) || []) if (isPermission(key)) permissions.add(key);
  for (const key of grant) if (isPermission(key)) permissions.add(key);
  for (const key of revoke) permissions.delete(key);
  // Refreshing a page happens on the Effects tab, so it brings the tab with it
  if (permissions.has("effects.manage")) permissions.add("effects.view");
  return permissions;
}

// What every admin has, whatever their roles
export const BASIC_VIEWS = "Activity and Users";

/**
 * What an admin is, in words - the admin view's "Your access": { title: "Super Admin" |
 * "Support admin" | "Admin", roles: [role name], abilities: [sentence] } - what they can do,
 * the basic views first, then each permission they hold (its `does`), area by area.
 * `roleNames` are their roles' names; `permissions` the keys they hold.
 */
export function describeAccess({ owner = false, roleNames = [], permissions = [] }) {
  const held = owner ? PERMISSION_KEYS : PERMISSION_KEYS.filter((key) => permissions.includes(key));
  // "Support admin"; a role already called "... admin" isn't doubled
  const title = owner ? "Super Admin" : roleNames.length === 1 ? (/admin$/i.test(roleNames[0]) ? roleNames[0] : `${roleNames[0]} admin`) : "Admin";
  const abilities = [
    `See ${BASIC_VIEWS}`,
    ...PERMISSION_GROUPS.flatMap((group) => held.filter((key) => PERMISSIONS[key].group === group.id).map((key) => PERMISSIONS[key].does)),
    ...(owner ? ["Create roles and decide who has admin access"] : []),
  ];
  return { title, roles: owner ? [] : roleNames, abilities };
}
