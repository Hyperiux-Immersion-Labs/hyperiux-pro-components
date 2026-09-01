import "server-only";
import Affitor from "@affitor/sdk/server";

// Server-side Affitor client for reporting revenue from our own backend
// (the Razorpay webhook) - the counterpart to the client-side click-tracking
// script in components/WebsiteComps/AffitorTracking.jsx (same program,
// "1062"). Unlike lib/razorpay.js this never throws when unconfigured: a
// missing/failing Affitor call must never break the real subscription
// webhook it's reporting on, so callers get a client that no-ops (and logs)
// instead of crashing the handler and making Razorpay retry the delivery.
const apiKey = process.env.AFFITOR_API_KEY;

export const affitor = apiKey ? new Affitor({ apiKey }) : null;

// pro-access.js's getBillingInterval() returns this codebase's own
// "monthly"/"yearly" convention (see getBillingLabel() throughout the
// dashboard) - Affitor's trackSale enum spells the annual one differently.
const SUBSCRIPTION_INTERVAL_MAP = {
  monthly: "monthly",
  yearly: "annual",
};

// Affitor's own /api/v1/track/sale throws a 500 whenever currency is "INR"
// (confirmed by isolating it against a real sale - every other field, and
// USD, work fine) - a bug on their end, not documented as a failure mode at
// https://docs.affitor.com/brand/tracking/payment-tracking-stripe, so this
// isn't something we can fix by changing what we send them, only work
// around. Our own invoices table (pro-access.js's recordInvoice) still
// records the real captured INR amount/currency untouched - only the copy
// reported TO Affitor gets normalized.
//
// Not a live FX conversion - this product's dual pricing means every INR
// plan already has a known, fixed rupee price, and the intended USD-cents
// figure for Affitor is exactly that number treated as cents (₹999/mo ->
// 999 cents = $9.99; ₹8999/yr -> 8999 cents = $89.99, i.e. rupees / 100 =
// dollars). Deriving from the plan id rather than Razorpay's actual
// payment.amount also sidesteps GST: Razorpay's checkout adds GST on top
// of these prices, so payment.amount is GST-inclusive and would overstate
// the sale if reported directly - the fixed per-plan amount is the
// pre-tax figure Affitor should see.
const INR_PLAN_USD_CENTS = {
  [process.env.RAZORPAY_PRO_MONTHLY_INR_PLAN_ID]: 999, // ₹999/mo -> $9.99
  [process.env.RAZORPAY_PRO_YEARLY_INR_PLAN_ID]: 8999, // ₹8999/yr -> $89.99
  // RAZORPAY_PRO_FOUNDING_YEARLY_INR_PLAN_ID intentionally has no entry yet -
  // its price hasn't been confirmed, and guessing would silently misreport
  // commission. Falls through to the payment.amount/INR_TO_USD_RATE
  // approximation below until a real figure is provided.
};

// Fallback only for an INR sale whose plan_id isn't in INR_PLAN_USD_CENTS
// above (currently just the founding yearly plan) - an approximate live-FX-
// style rate, not the product's real fixed pricing, so revisit this instead
// of trusting it indefinitely once the founding price is known.
const INR_TO_USD_RATE = Number(process.env.AFFITOR_INR_TO_USD_RATE) || 0.012;

function normalizeForAffitor(amount, currency, planId) {
  if (currency?.toUpperCase() !== "INR") {
    return { amount, currency };
  }

  const fixedCents = INR_PLAN_USD_CENTS[planId];

  if (fixedCents !== undefined) {
    return { amount: fixedCents, currency: "USD" };
  }

  return {
    amount: Math.round(amount * INR_TO_USD_RATE),
    currency: "USD",
  };
}

// Binds a new signup to whichever partner referred them, using the
// affitor_click_id the browser captured at signup time (threaded through as
// Clerk unsafeMetadata, read back out of the user.created webhook payload -
// see api/webhooks/clerk/route.js). Proved reliable in E2E testing where the
// client-side tracker's own signup() call silently failed to bind despite
// having a valid clickId in its own state - this server-to-server call using
// the identical clickId succeeded immediately, so this is the only signup
// tracking mechanism now (no client-side call left as a redundant, silently-
// failing path). Both signup flows (custom SignUpFlow.jsx and Clerk's
// prebuilt OAuth <SignUp/> widget) go through this one webhook, so this
// covers both uniformly instead of needing a separate hook per flow.
export async function trackAffitorLead({ customerExternalId, clickId, email }) {
  if (!affitor) {
    console.warn("AFFITOR_TRACK_LEAD_SKIPPED: AFFITOR_API_KEY not set");
    return null;
  }

  const res = await affitor.trackLead({ customerExternalId, clickId, email });

  if (!res.ok) {
    console.error("AFFITOR_TRACK_LEAD_ERROR:", res.status, res.error);
  }

  return res;
}

// Reports a subscription charge as a sale so Affitor can attribute
// commission to whichever partner referred this customer at signup.
// `invoiceId` should be the Razorpay payment id - same idempotency key
// pro-access.js's recordInvoice() already uses, so retries dedupe cleanly
// on both sides. `billingInterval` is this codebase's "monthly"/"yearly"
// value (getBillingInterval(subscription.plan_id)) - mapped to Affitor's
// own subscriptionInterval enum below.
export async function trackAffitorSale({
  customerExternalId,
  amount,
  invoiceId,
  currency,
  subscriptionId,
  billingInterval,
  planId,
}) {
  if (!affitor) {
    console.warn("AFFITOR_TRACK_SALE_SKIPPED: AFFITOR_API_KEY not set");
    return null;
  }

  const normalized = normalizeForAffitor(amount, currency, planId);

  const res = await affitor.trackSale({
    customerExternalId,
    amount: normalized.amount,
    invoiceId,
    currency: normalized.currency,
    saleType: "subscription",
    isRecurring: true,
    subscriptionId,
    subscriptionInterval: SUBSCRIPTION_INTERVAL_MAP[billingInterval],
  });

  if (!res.ok) {
    console.error("AFFITOR_TRACK_SALE_ERROR:", res.status, res.error);
  }

  return res;
}
