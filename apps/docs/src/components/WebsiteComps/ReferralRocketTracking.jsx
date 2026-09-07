"use client";

import Script from "next/script";
import { REFERRAL_ROCKET_CAMPAIGN_ID } from "@/lib/referral-rocket";

// Referral click tracking (ReferralRocket's widget). Homepage-only by
// design, same reasoning as the old Affitor tracker: rendered directly in
// (marketing)/page.js rather than the root layout, since that's the only
// page we want attributed here. The script itself reads ?referralCode= off
// the URL and stores it in the rr_referral_code cookie - see
// lib/referral-rocket.js for the rest of this integration.
//
// strategy="lazyOnload": PageSpeed flags this script's own 382 KiB / 188ms
// main-thread cost under "3rd parties" (its short 4h Cache-Control TTL is
// set by ReferralRocket's CDN, not something we control). It has no UI and
// nothing on the page depends on it running early, so afterInteractive -
// which fires right as the page becomes interactive, the busiest moment on
// the main thread - was the wrong strategy. lazyOnload defers it to
// browser idle time instead, keeping the same tracking behavior off the
// critical path.
export default function ReferralRocketTracking() {
  return (
    <Script
      src="https://app.referralrocket.io/widget/widgetIndex.js"
      campaign-id={REFERRAL_ROCKET_CAMPAIGN_ID}
      strategy="lazyOnload"
    />
  );
}
