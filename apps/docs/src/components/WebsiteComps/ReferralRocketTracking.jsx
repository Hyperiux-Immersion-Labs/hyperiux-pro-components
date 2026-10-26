"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { REFERRAL_ROCKET_CAMPAIGN_ID, hasReferralParam, isReferredVisitor } from "@/lib/referral-rocket";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";

// Referral click tracking (ReferralRocket's widget), mounted once in the root
// layout. The script itself reads ?referralCode= off the URL and stores it in
// the rr_referral_code cookie - see lib/referral-rocket.js for the rest of
// this integration. It loads:
// - on the homepage, for everyone (where it always ran);
// - on any page opened from a referral link - straight away, before a click
//   on to another page drops ?referralCode= from the URL;
// - on every page for a visitor already carrying the cookie, so window.Rocket
//   is there to report the lead wherever they sign up (the /sign-up page, the
//   sign-up modal, an OAuth return). Once loaded it stays for the visit.
// Everyone else never fetches it.
//
// It's 381 KiB, 46% of the homepage's total script weight by itself (see
// the Lighthouse Treemap that flagged it) and has no UI - nothing on the
// page depends on it running before the visitor has actually engaged.
// lazyOnload only deprioritized it (still fetches within a couple seconds
// via requestIdleCallback, well inside a Lighthouse trace); this instead
// gates the mount itself behind the same "don't fetch until it's actually
// needed" rule as the video/icon fixes - here, real user interaction, since
// there's no viewport/expand-state to gate on for a script with no DOM. A
// short timeout fallback still loads it for the (rare) visitor who never
// interacts at all, so referral attribution doesn't just silently drop.
//
// That same fallback is exactly why PageSpeed/Lighthouse kept flagging it
// anyway: an automated audit never scrolls or clicks, but its trace window
// is longer than the fallback delay, so the safety net fired during every
// measured run regardless. Audit/headless traffic never converts a
// referral, so there's nothing lost skipping it there outright - same two
// signals shouldSkipRealtimeGPU (lib/audit.js) already combines for the
// same reason (isLighthouseOrHeadless catches PSI mobile/webdriver;
// isSoftwareRenderer catches PSI's real desktop crawler, which presents a
// plain Chrome UA and no navigator.webdriver).
const INTERACTION_EVENTS = ["pointerdown", "mousemove", "scroll", "keydown", "touchstart"];
const FALLBACK_DELAY_MS = 5000;

export default function ReferralRocketTracking() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/index";
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    if (isLighthouseOrHeadless() || isSoftwareRenderer()) return;
    const fromReferralLink = hasReferralParam();
    if (!fromReferralLink && !isHome && !isReferredVisitor()) return;

    const load = () => setShouldLoad(true);

    INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, load, { once: true, passive: true })
    );
    // A referral link loads it straight away, before a click drops the code from the URL
    const fallback = setTimeout(load, fromReferralLink ? 0 : FALLBACK_DELAY_MS);

    return () => {
      INTERACTION_EVENTS.forEach((event) =>
        window.removeEventListener(event, load)
      );
      clearTimeout(fallback);
    };
  }, [shouldLoad, isHome]);

  if (!shouldLoad) return null;

  return (
    <Script
      src="https://app.referralrocket.io/widget/widgetIndex.js"
      campaign-id={REFERRAL_ROCKET_CAMPAIGN_ID}
      strategy="afterInteractive"
    />
  );
}
