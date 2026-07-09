import "server-only";
import BLOCKED_DOMAINS from "./blocked-email-domains.json";

// Server-only on purpose: this 200KB JSON used to be imported by the client
// zod schema, shipping the whole blacklist in the landing-page bundle. The
// check only means anything server-side anyway (client validation is
// bypassable).
//
// Data quirk: each entry is {"0-mail.com": "<domain>"} - a broken CSV->JSON
// conversion where the first row became every entry's key. The VALUES are the
// real domain list.
let BLOCKED_SET;
try {
  BLOCKED_SET = new Set(
    BLOCKED_DOMAINS.map((entry) => Object.values(entry)[0])
  );
} catch {
  BLOCKED_SET = new Set();
}

export function isBlockedEmailDomain(email) {
  const domain = String(email).split("@")[1]?.toLowerCase();
  return Boolean(domain && BLOCKED_SET.has(domain));
}
