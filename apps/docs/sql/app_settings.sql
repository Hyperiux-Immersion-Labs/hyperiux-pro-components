-- Dashboard settings (the admin Settings tab), so these don't need a code change or a
-- redeploy: one row per setting, the value as JSON. Read by lib/app-settings.js.
--   install_limit_enforced - true: the daily install limit is applied; false: only
--                            recorded ("shadow" mode). No row: the INSTALL_LIMIT_ENFORCE
--                            environment variable decides, as before.
--   internal_emails        - extra team / test emails kept out of the customer numbers
--   internal_domains       - extra team email domains, likewise
-- Run once, before deploying the admin-dashboard-tools branch.

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table app_settings enable row level security;
