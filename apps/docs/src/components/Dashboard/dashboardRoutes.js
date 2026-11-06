// Every dashboard URL carries the account's username (lib/user-slug): /dashboard/{username}/{tab}.
// The user view's tabs sit at the root, the admin view's under /admin.

export const dashboardPath = (username, sub = "") => `/dashboard/${username}${sub ? `/${sub}` : ""}`;

// `sub` is the path below /dashboard/{username}; `light` tabs render on the light sheet.
export const USER_TABS = [
  { key: "overview", label: "Overview", sub: "", light: true },
  { key: "saved", label: "Saved Effects", sub: "saved", light: true },
  { key: "templates", label: "My Templates", sub: "templates", light: true },
  { key: "usage", label: "Usage", sub: "usage", light: true },
  { key: "invoicing", label: "Invoicing", sub: "invoicing", light: true },
  { key: "settings", label: "Settings", sub: "settings", light: true },
];

// The admin view's tabs. Activity and Users are every admin's;
// the rest need a permission (lib/admin-permissions) - or, for Campaigns and Roles, the owner. The real
// gate is the API behind each one.
export const ADMIN_TABS = [
  { key: "activity", label: "Activity", sub: "admin/activity", light: true },
  { key: "users", label: "Users", sub: "admin/users", light: true },
  { key: "emails", label: "Email Log", sub: "admin/emails", permission: "emails.view", light: true },
  { key: "admin-campaigns", label: "Campaigns", sub: "admin/campaigns", owner: true, light: true },
  { key: "admin-effects", label: "Effects", sub: "admin/effects", permission: "effects.view", light: true },
  { key: "admin-invoicing", label: "Invoicing", sub: "admin/invoicing", permission: "finance.view", light: true },
  { key: "admin-log", label: "Admin Log", sub: "admin/log", permission: "log.view", light: true },
  { key: "admin-settings", label: "Settings", sub: "admin/settings", permission: "settings.manage", light: true },
  { key: "admin-roles", label: "Roles", sub: "admin/roles", owner: true, light: true },
];

// Whether an admin's access shows a tab: `can(key)` from useDashboard / useAdminRole
export const canSeeTab = (tab, { owner, can }) => (tab.owner ? owner : !tab.permission || can(tab.permission));

// The tab a path belongs to: the longest `sub` that prefixes it, so
// admin/activity/{user} still lights up Activity.
export function activeTab(tabs, username, pathname) {
  return tabs
    .filter((tab) => {
      const href = dashboardPath(username, tab.sub);
      return tab.sub ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;
    })
    .sort((a, b) => b.sub.length - a.sub.length)[0];
}

export const isAdminPath = (username, pathname) => pathname.startsWith(dashboardPath(username, "admin"));
