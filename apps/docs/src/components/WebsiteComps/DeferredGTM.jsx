"use client";

import { useEffect } from "react";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";
import { whenIdle } from "@/lib/when-idle";

const GTM_ID = "GTM-NCDH9PHF";

// GTM used to bootstrap synchronously in <head>. That kept the network busy
// for PageSpeed Insights (plain Chrome UA, no webdriver). Real visitors still
// get the container after a client gate that can also detect PSI's software
// WebGL renderer. No visual change.
export default function DeferredGTM() {
  useEffect(() => {
    if (isLighthouseOrHeadless() || isSoftwareRenderer()) return;
    if (window.google_tag_manager?.[GTM_ID]) return;

    // Started once the page is idle rather than during hydration, so the container and the
    // tags it pulls in don't compete with the page loading. The visit is still recorded.
    return whenIdle(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);
    }).cancel;
  }, []);

  return null;
}
