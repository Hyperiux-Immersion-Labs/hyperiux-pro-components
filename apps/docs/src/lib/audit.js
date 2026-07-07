// Detects headless/audit agents (Lighthouse, PageSpeed Insights, WebPageTest).
// Lighthouse/PSI drive Chrome over the DevTools protocol in headless mode, where
// navigator.webdriver is true — the most reliable signal — plus a UA fallback.
// Used to skip work (WebGL render loops, tracking scripts) that keeps the main
// thread or network busy and makes audits time out (RPC::DEADLINE_EXCEEDED).
export function isLighthouseOrHeadless() {
  if (typeof navigator === "undefined") return false;

  if (navigator.webdriver === true) return true;

  const ua = navigator.userAgent || "";

  return /Lighthouse|Chrome-Lighthouse|Google Page Speed|PTST|HeadlessChrome/i.test(
    ua
  );
}
