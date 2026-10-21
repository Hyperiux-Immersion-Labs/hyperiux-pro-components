# Admin Roles and Permissions: Plan

2026-10-19 · Updated 2026-10-21 · Status: built (phases 1-4). Needs `sql/admin_roles.sql`, then `sql/admin_roles_email_log.sql` run, then the checks in ADMIN_ROLE_ACCESS_TESTS.md

## Decisions so far

| Question | Decision |
| --- | --- |
| Roles per admin | Several; an admin's permissions combine all of their roles |
| What every admin can see | The basic views (Activity, Users) are always on, without revenue or payment details. Effects (Effect health) and the Email log are permissions |
| Finances (revenue, payments, invoices) | Seeing them needs `finance.view`, acting on them needs `finance.manage`; both granted by the super admin |
| Per-person overrides | Yes: the super admin can add or remove single permissions for one person |
| Super admins | Four for now: harsh@, b@, jyoti@ and hitesh@weareenigma.com. Each has every permission and manages roles and access. Super admins are set in Clerk (`publicMetadata.role: "super_admin"`), never from the dashboard |
| Presets | Three: Support, User Management and System Admin. Legacy admin was removed on 2026-10-21 (no real admin had it). Finance is granted one by one |
| Support's account actions | Both: password resets and suspending accounts |
| Email log | Only User Management, System Admin and super admins (it shows who was emailed what) |

## Who does what

**Super Admin** (harsh@, b@, jyoti@, hitesh@weareenigma.com)
- Purpose: owns the dashboard and decides who can do what.
- Powers: every permission below, plus creating roles and giving or removing admin access. Set in Clerk only, never from the dashboard.
- The only admins who see finances by default (revenue, payments, invoices, the Razorpay log) and can act on them (refunds, cancellations, syncs).

**Support**
- Purpose: helps individual customers with their account.
- Powers: add or remove template credits, give a template free, allow extra installs for today, write team notes, send password resets, suspend and restore customer accounts (never an admin's).
- Can't: change plans, see the Email log, Admin Log, Settings or finances, export or invite.

**User Management**
- Purpose: runs the accounts themselves: who's in, on what plan, counted how.
- Powers: create accounts, give or remove Pro and Pro+, send password resets, suspend and restore customer accounts, mark accounts internal, invite from the waitlist, export the users CSV, see the Email log (invoice amounts hidden).
- Can't: support tools (credits, templates, notes), Admin Log, Settings, Effect health or finances.

**System Admin**
- Purpose: keeps the platform running and checks what happened.
- Powers: the Email log, the Admin log (admin changes only), Settings (install limits, internal emails and domains), plus creating accounts and sending password resets.
- Can't: the Effects tab (Effect health, refreshing pages), change plans, suspend accounts, support tools, export or invite, or see finances (so no Razorpay events in the Admin log).

**Every admin**: Activity and Users, without revenue or payments. Anything else is one of the permissions below, through a role or given to one person.

## Permissions

The basic views need no permission: every admin has them. These 15 are granted by the super admin:

| Group | Permission | Lets them |
| --- | --- | --- |
| Finance | `finance.view` | See revenue cards, lifetime spend, user payments, invoice emails, the Invoicing tab and the Razorpay log |
| | `finance.manage` | Refund, cancel a subscription, sync with Razorpay, exclude from revenue |
| Users | `users.export` | Download the users CSV |
| | `users.invite` | Send waitlist invites |
| | `users.plan` | Give or remove Pro |
| | `users.support` | Template credits, give a template, extra installs today, add and read notes |
| | `users.reset` | Send a password reset |
| | `users.suspend` | Suspend or restore an account |
| | `users.create` | Create an account with a password and send the sign-in details |
| | `users.internal` | Mark an account internal or count it as a customer |
| Effects | `effects.view` | See the Effects tab (Effect health): where Sanity guides and the registry disagree |
| | `effects.manage` | Refresh an effect page (includes `effects.view`) |
| System | `emails.view` | See the Email log (invoice amounts also need `finance.view`) |
| | `log.view` | See the admin changes log |
| | `settings.manage` | Change install limits and the internal emails and domains |

The owner alone manages roles and access. That isn't a permission, so it can never be granted.

## Presets

| Preset | Permissions |
| --- | --- |
| Support | `users.support`, `users.reset`, `users.suspend` |
| User Management | `users.create`, `users.plan`, `users.reset`, `users.suspend`, `users.internal`, `users.invite`, `users.export`, `emails.view` |
| System Admin | `users.create`, `users.reset`, `emails.view`, `log.view`, `settings.manage` |

The Effects tab (`effects.view`, `effects.manage`) is in no role: super admins have it, and it can be given to one person.

## Route map (35 admin routes)

| Route | Needs | Field-level |
| --- | --- | --- |
| `GET activity/overview` | admin | revenue only with `finance.view` |
| `GET activity/[userSlug]` | admin | payments, spend, billing ids only with `finance.view` |
| `GET installs`, `GET copy-activity` | admin | |
| `GET users`, `GET users/stats` | admin | subscription status and Razorpay ids only with `finance.view` |
| `GET users/export` | `users.export` | billing columns only with `finance.view` |
| `GET/POST waitlist/invite` | `users.invite` | |
| `POST users/update-plan` | `users.plan` | |
| `GET users/support` | admin | |
| `POST users/credits`, `give-template`, `install-bonus`, `notes` | `users.support` | |
| `POST users/send-password-reset` | `users.reset` | |
| `POST users/suspend` | `users.suspend` | |
| `POST users/create` | `users.create` | |
| `POST users/update-internal` | `users.internal` | |
| `POST users/update-role` | owner (becomes "access") | |
| `GET users/billing` | `finance.view` | |
| `POST users/cancel-subscription`, `sync-subscription` | `finance.manage` | |
| `POST payments/refund`, `payments/exclude` | `finance.manage` | |
| `GET invoices`, `invoices/stats`, `template-purchases`, `subscriptions/health` | `finance.view` | |
| `GET webhook-events` | `finance.view` | |
| `GET audit` | `log.view` | notes (`action=note.add&userId=`) also with `users.support` |
| `GET/POST settings` | `settings.manage` | |
| `GET emails` | `emails.view` | invoice email bodies and amounts only with `finance.view` |
| `GET effects/health` | admin | |
| `POST effects/refresh` | `effects.manage` | |
| `GET me` | signed in | returns the permission list |

## Phases

1. **Permission layer** (no visible change): catalogue, effective-permission logic, server helpers, `/api/admin/me` returns permissions. Today's `admin` maps to Legacy admin, `super_admin` to everything.
2. **Switch the routes**: every route and response field above uses permission checks, with a refusal test per route.
3. **Roles**: `admin_roles` table, Roles tab, Access section in the Manage drawer, audit actions, migration of current admins to Legacy admin.
4. **Permission-aware screens**: tabs, buttons and drawer sections filtered by permission.

## Phase 1 design

### Files

- `src/lib/admin-permissions.js` (safe in the browser):
  - `PERMISSIONS`: key, label, group, one-line description, as in the table above.
  - `PRESETS`: Support, User Management, Legacy admin.
  - `effectivePermissions({ owner, roles, grant, revoke })`: the owner gets everything. Otherwise it's the union of the roles' permissions plus `grant`, minus `revoke`, keeping only known keys.
- `src/lib/admin.js` (server):
  - `getAdminAccess(user)` returns `{ owner, admin, permissions: Set }`.
  - `requirePermission(key)` (API routes) returns that access, or `null` for a 403.
  - `requireAdminAccess()` covers the always-on views.
  - `can(access, key)` for field-level checks.
  - `assertAdmin` and `assertSuperAdmin` stay as wrappers until phase 2 has moved every route.
- `GET /api/admin/me` adds `owner` and `permissions`. `useAdminRole` exposes `can(key)`.

### Where access lives (phase 1 reads it, phase 3 writes it)

Clerk `publicMetadata.admin = { roles: ["<role id>", ...], grant: ["finance.view"], revoke: [] }`. Roles are rows in `admin_roles`, cached for 30 seconds.

Until phase 3 there's no table. The mapping then is:
- `role: "admin"` → Legacy admin (removed 2026-10-21: an old `role: "admin"` with no roles now gives nothing);
- `role: "super_admin"` or `ADMIN_EMAIL` → owner.

### Tests

- **Effective permissions:** union of roles, grant, revoke, unknown keys dropped, owner gets everything.
- **Mapping:** the two current roles map exactly to today's access.
- **`requirePermission`:** a signed-out user, a non-admin, and an admin without the key are all refused.

## Defaults taken while building

- **Super admins:** every account with `role: "super_admin"` is one (four today). The dashboard can't make or remove one, and a super admin can't change or suspend another; that's done in Clerk.
- **How quickly changes apply:** a person's own access (roles, grants, removals) is read fresh on every request, so changes apply at once. A role's permissions are cached for 30 seconds per server, so editing a role reaches everyone with it within 30 seconds.
- **Suspending an admin** is for the owner only, even with `users.suspend`.
- **Admins are never install-limited** (`isAdminUser`), now including role-based admins. That's the same rule as before, applied to more accounts.
