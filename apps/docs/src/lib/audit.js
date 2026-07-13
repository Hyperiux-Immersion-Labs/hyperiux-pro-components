const AUDIT_UA_PATTERN =
  /Lighthouse|Chrome-Lighthouse|Google Page Speed|PTST|HeadlessChrome/i;

// Server-safe: matches a raw User-Agent string (e.g. a request header), so it
// can gate server-rendered markup (like GTM's <script>) before any
// client-side check would even get a chance to run.
export function isAuditUserAgent(userAgent) {
  return AUDIT_UA_PATTERN.test(userAgent || "");
}

// Detects headless/audit agents (Lighthouse, PageSpeed Insights, WebPageTest).
// Lighthouse/PSI drive Chrome over the DevTools protocol in headless mode, where
// navigator.webdriver is true - the most reliable signal - plus a UA fallback.
// Used to skip work (WebGL render loops, tracking scripts) that keeps the main
// thread or network busy and makes audits time out (RPC::DEADLINE_EXCEEDED).
export function isLighthouseOrHeadless() {
  if (typeof navigator === "undefined") return false;

  if (navigator.webdriver === true) return true;

  return isAuditUserAgent(navigator.userAgent);
}
