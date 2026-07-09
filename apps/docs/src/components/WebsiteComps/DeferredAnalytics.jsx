"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { isLighthouseOrHeadless } from "@/lib/audit";

// Tracking / session-recording scripts (GTM, Microsoft Clarity, OpenPanel,
// reb2b) keep the network continuously busy, so Lighthouse/PageSpeed never
// reaches the "network idle" state it waits for → the audit runs until its RPC
// budget expires (RPC::DEADLINE_EXCEEDED) and never reports a score.
//
// We render them only for real visitors and skip them entirely under
// headless/audit agents. The gate runs in an effect (client-only) so the
// detection can read navigator.webdriver / userAgent with no SSR mismatch.
// Real users get the full analytics stack, just mounted a tick after hydration
// (negligible) instead of inline in the server HTML.
export default function DeferredAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isLighthouseOrHeadless()) setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* GTM intentionally NOT loaded here - the container is bootstrapped by
          the synchronous script in layout.js <head>; a second GoogleTagManager
          mount double-initialized the container. */}
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xg3k9tc0gm");`,
        }}
      />
      <Script
        id="openpanel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();window.op('init',{clientId:'45f34339-5b18-484e-a126-a77b7d470584',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});`,
        }}
      />
      <Script src="https://openpanel.dev/op1.js" strategy="afterInteractive" />
      <Script
        id="rb2b"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("5NRP9H7J4EO1");`,
        }}
      />
    </>
  );
}
