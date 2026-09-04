"use client";

import Script from "next/script";
import { REFERRAL_ROCKET_CAMPAIGN_ID } from "@/lib/referral-rocket";

// Referral click tracking (ReferralRocket's widget). Homepage-only by
// design, same reasoning as the old Affitor tracker: rendered directly in
// (marketing)/page.js rather than the root layout, since that's the only
// page we want attributed here. The script itself reads ?referralCode= off
// the URL and stores it in the rr_referral_code cookie - see
// lib/referral-rocket.js for the rest of this integration.
export default function ReferralRocketTracking() {
  return (
    <Script
      src="https://app.referralrocket.io/widget/widgetIndex.js"
      campaign-id={REFERRAL_ROCKET_CAMPAIGN_ID}
      strategy="afterInteractive"
    />
  );
}
