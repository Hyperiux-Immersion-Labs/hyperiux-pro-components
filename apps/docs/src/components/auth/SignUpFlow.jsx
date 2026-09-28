"use client";

import { useSearchParams } from "next/navigation";
import SplitAuthLayout from "./SplitAuthLayout";
import SignUpForm from "./SignUpForm";
import { getSafeRedirectUrl } from "./AuthFormPrimitives";

// /sign-up page: the full-page auth layout around SignUpForm, which holds the
// actual Clerk flow (see the notes there).

// Matches SignInFlow.jsx's post-auth destination, the ClerkProvider's
// signInFallbackRedirectUrl, and the invite-accept continuation flow
// (signup/continue/page.js) - a new signup should land in the vault like
// every other auth path, not detour through pricing.
const REDIRECT_AFTER_SIGN_UP = "/effects";

export default function SignUpFlow() {
  const searchParams = useSearchParams();

  // Lets a gated action (e.g. buying a template while signed out) bounce
  // an anonymous visitor through sign-up and land back exactly where they
  // clicked, instead of always dropping them at /effects.
  const rawRedirectUrl = searchParams.get("redirect_url");
  const redirectUrl = getSafeRedirectUrl(rawRedirectUrl, REDIRECT_AFTER_SIGN_UP);
  const signInHref = rawRedirectUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-in";

  return (
    <SplitAuthLayout>
      <SignUpForm redirectUrl={redirectUrl} signInHref={signInHref} />
    </SplitAuthLayout>
  );
}
