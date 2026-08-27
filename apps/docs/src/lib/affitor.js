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
}) {
  if (!affitor) {
    console.warn("AFFITOR_TRACK_SALE_SKIPPED: AFFITOR_API_KEY not set");
    return null;
  }

  const res = await affitor.trackSale({
    customerExternalId,
    amount,
    invoiceId,
    currency,
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
