-- Admin roles (ADMIN_ROLES_PLAN.md): named sets of permissions the owner (the one super
-- admin) creates in the admin Roles tab and gives to admins. An admin can have several;
-- which ones sits on their Clerk account (publicMetadata.admin.roles = role ids), next to
-- single permissions granted or taken away. Read by lib/admin-roles.js.
--   id          - a short slug ("support"), also what accounts store
--   permissions - keys from lib/admin-permissions.js ("users.support", "finance.view", ...)
-- Run once, before deploying the admin roles branch. Until it runs, the dashboard uses the
-- presets in lib/admin-permissions.js and roles can't be created or edited.

create table if not exists admin_roles (
  id text primary key,
  name text not null,
  description text not null default '',
  permissions text[] not null default '{}',
  preset boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_roles enable row level security;

-- The presets, matching PRESET_ROLES in lib/admin-permissions.js
insert into admin_roles (id, name, description, permissions, preset) values
  ('support', 'Support', 'Helps customers: credits, templates, extra installs, notes, password resets and suspensions',
    array['users.support', 'users.reset', 'users.suspend'], true),
  ('user-management', 'User Management', 'Runs accounts: creates them, changes plans, resets, suspensions, internal accounts, invites, the export and the Email log',
    array['users.create', 'users.plan', 'users.reset', 'users.suspend', 'users.internal', 'users.invite', 'users.export', 'emails.view'], true),
  ('system-admin', 'System Admin', 'Keeps the platform running: the Email log, the admin log and settings, plus password resets and new accounts',
    array['users.create', 'users.reset', 'emails.view', 'log.view', 'settings.manage'], true)
on conflict (id) do nothing;
