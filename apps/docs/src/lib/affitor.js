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

// Reports a subscription charge as a sale so Affitor can attribute
// commission to whichever partner referred this customer at signup.
// `invoiceId` should be the Razorpay payment id - same idempotency key
// pro-access.js's recordInvoice() already uses, so retries dedupe cleanly
// on both sides.
export async function trackAffitorSale({ customerExternalId, amount, invoiceId, currency }) {
  if (!affitor) {
    console.warn("AFFITOR_TRACK_SALE_SKIPPED: AFFITOR_API_KEY not set");
    return null;
  }

  const res = await affitor.trackSale({ customerExternalId, amount, invoiceId, currency });

  if (!res.ok) {
    console.error("AFFITOR_TRACK_SALE_ERROR:", res.status, res.error);
  }

  return res;
}
