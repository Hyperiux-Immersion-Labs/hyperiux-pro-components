-- Admin audit log: every change made from the admin dashboard - who, when, to which
-- account, and what (plan grants, roles, suspensions, internal flags, revenue
-- exclusions, cancellations, refunds, Razorpay syncs, invites). Written by
-- lib/admin-audit.js with the service role; read by /api/admin/audit.
-- Run once, before deploying the admin-dashboard-tools branch.

create table if not exists admin_audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_clerk_user_id text not null,
  actor_email text,
  action text not null,
  target_clerk_user_id text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_log_created_idx on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_target_idx on admin_audit_log (target_clerk_user_id, created_at desc);

-- No client access: only the server (service role) reads or writes it
alter table admin_audit_log enable row level security;
