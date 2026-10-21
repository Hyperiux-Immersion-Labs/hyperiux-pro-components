-- The Email log becomes a permission (emails.view) instead of something every admin sees,
-- System Admin becomes a built-in role, and Legacy admin goes: three built-in roles now,
-- Support, User Management and System Admin (ADMIN_ROLES_PLAN.md). Run once, after deploying
-- the code that knows emails.view (before that, the key is simply ignored, so running it
-- early is harmless too). Matches PRESET_ROLES in lib/admin-permissions.js.

-- User Management: also creates accounts and sees the Email log
update admin_roles
set description = 'Runs accounts: creates them, changes plans, resets, suspensions, internal accounts, invites, the export and the Email log',
    permissions = array['users.create', 'users.plan', 'users.reset', 'users.suspend', 'users.internal', 'users.invite', 'users.export', 'emails.view'],
    updated_at = now()
where id = 'user-management';

-- System Admin (made in the Roles tab): built in now, with the platform's logs, settings
-- and effect health. It keeps password resets and new accounts; suspending moves to
-- Support and User Management.
insert into admin_roles (id, name, description, permissions, preset) values
  ('system-admin', 'System Admin', 'Keeps the platform running: the Email log, the admin log and settings, plus password resets and new accounts',
    array['users.create', 'users.reset', 'emails.view', 'log.view', 'settings.manage'], true)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    permissions = excluded.permissions,
    preset = true,
    updated_at = now();

-- Legacy admin is gone. Anyone still holding it (only a test account, betamo7142@...) keeps
-- the id on their account, which now gives nothing: give them a real role in Users → Manage
-- → Access.
delete from admin_roles where id = 'legacy-admin';
