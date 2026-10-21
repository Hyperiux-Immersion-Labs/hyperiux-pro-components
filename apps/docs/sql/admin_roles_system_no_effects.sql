-- System Admin no longer has the Effects tab (Effect health, Refresh effect pages): only
-- super admins, or someone given those permissions one by one. Matches PRESET_ROLES in
-- lib/admin-permissions.js. Safe to run before or after deploying.
update admin_roles
set description = 'Keeps the platform running: the Email log, the admin log and settings, plus password resets and new accounts',
    permissions = array['users.create', 'users.reset', 'emails.view', 'log.view', 'settings.manage'],
    updated_at = now()
where id = 'system-admin';
