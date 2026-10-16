-- Razorpay webhook log: one row per delivery to /api/razorpay/webhooks and what we did
-- with it - applied, skipped (and why), ignored, failed (and the error) or rejected (bad
-- signature / payload). Shown in the admin Log tab (Razorpay events) and in each account's
-- Billing section. IDs, amounts and the outcome only - no customer details.
-- Run once, before deploying the admin-dashboard-tools branch.

create table if not exists razorpay_webhook_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  event_id text,
  event text,
  outcome text not null,
  detail text,
  clerk_user_id text,
  subscription_id text,
  payment_id text,
  amount integer,
  currency text
);

create index if not exists razorpay_webhook_events_received_idx on razorpay_webhook_events (received_at desc);
create index if not exists razorpay_webhook_events_user_idx on razorpay_webhook_events (clerk_user_id, received_at desc);
create index if not exists razorpay_webhook_events_outcome_idx on razorpay_webhook_events (outcome, received_at desc);

alter table razorpay_webhook_events enable row level security;
