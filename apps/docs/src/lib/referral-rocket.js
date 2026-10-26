// ReferralRocket campaign id for the click tracker
// (components/WebsiteComps/ReferralRocketTracking.jsx), which loads the
// widget script that captures ?referralCode= from the URL into the
// rr_referral_code cookie (60-day retention). Sale/payment tracking is
// handled entirely by ReferralRocket's own Razorpay webhook integration
// (configured directly in the Razorpay dashboard) - nothing on our side for
// that half. Lead tracking has to be client-side (window.Rocket) since the
// server-side REST API (POST /api/v1/addParticipant) needs a paid-plan API
// key we don't have - see addReferralLead below and where it's called
// (components/auth/vault-door/useVaultClerk.js, ReferralOAuthLead.jsx).
export const REFERRAL_ROCKET_CAMPAIGN_ID = "B8eATbfQ";

// Set by the widget itself (js-cookie, so readable here)
const REFERRAL_COOKIE = "rr_referral_code";
const REFERRAL_PARAM = "referralCode";

// A GitHub/Google sign-up leaves the page for the provider, so it can't report
// the lead in-place: it leaves this note in sessionStorage, and
// ReferralOAuthLead reports it once the visitor lands back signed in
const OAUTH_PENDING_KEY = "rr:oauth-signup";
const OAUTH_PENDING_MAX_AGE_MS = 30 * 60 * 1000;

const ROCKET_WAIT_MS = 10000;

export function hasReferralParam() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(REFERRAL_PARAM);
}

// Came in through a referral link, now or in an earlier visit
export function isReferredVisitor() {
  if (typeof document === "undefined") return false;
  return (
    hasReferralParam() ||
    document.cookie.split("; ").some((cookie) => cookie.startsWith(`${REFERRAL_COOKIE}=`))
  );
}

function whenRocketReady() {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      const campaign = window.Rocket?.getCampaign?.();
      if (campaign) resolve(campaign);
      else if (Date.now() - started > ROCKET_WAIT_MS) resolve(null);
      else setTimeout(check, 250);
    };
    check();
  });
}

// Attributes a new account to its referrer. Only referred visitors load the
// widget away from the homepage, so anyone else is skipped up front; the
// widget may still be loading at sign-up time, hence the short wait. Never
// throws - a tracking failure must not get in the way of the real sign-up.
export async function addReferralLead(email) {
  if (!email || !isReferredVisitor()) return;
  try {
    const campaign = await whenRocketReady();
    campaign?.addParticipant({ email });
  } catch (error) {
    console.error("REFERRAL_ROCKET_ADD_PARTICIPANT_ERROR:", error);
  }
}

export function markOAuthSignUpPending() {
  if (!isReferredVisitor()) return;
  try {
    sessionStorage.setItem(OAUTH_PENDING_KEY, String(Date.now()));
  } catch {}
}

// Reads and clears the note; true only while it's fresh
export function takeOAuthSignUpPending() {
  try {
    const startedAt = Number(sessionStorage.getItem(OAUTH_PENDING_KEY));
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    return Boolean(startedAt) && Date.now() - startedAt < OAUTH_PENDING_MAX_AGE_MS;
  } catch {
    return false;
  }
}
