-- Admin Invoicing: refunded subscription payments, and payments excluded from revenue.
-- Run once, before deploying the admin-dashboard-tools branch (its code reads `excluded`).

-- 1. A refunded subscription payment keeps its row, marked "refunded" (the Razorpay
--    refund webhook sets it; template_purchases already does the same). Drops the
--    default-named status check if there is one, so "refunded" is accepted.
alter table invoices drop constraint if exists invoices_status_check;

-- 2. "Exclude from revenue" on a ledger row: kept in the ledger, left out of every
--    revenue figure and count. Separate from is_test (Razorpay test-mode payments,
--    which never show in the ledger at all).
alter table invoices add column if not exists excluded boolean not null default false;
alter table template_purchases add column if not exists excluded boolean not null default false;

-- 3. The one refund so far, made before the webhook marked invoices (2026-10-16)
update invoices set status = 'refunded' where razorpay_payment_id = 'pay_TochOD3HY7LLGt';
