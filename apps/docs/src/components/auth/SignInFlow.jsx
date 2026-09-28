"use client";

import { useSearchParams } from "next/navigation";
import SplitAuthLayout from "./SplitAuthLayout";
import SignInForm from "./SignInForm";
import { getSafeRedirectUrl } from "./AuthFormPrimitives";

// /sign-in page: the full-page auth layout around SignInForm, which holds the
// actual Clerk flow (see the notes there).

export default function SignInFlow() {
  const searchParams = useSearchParams();

  // Lets a gated action (e.g. buying a template while signed out) bounce
  // an anonymous visitor through sign-in and land back exactly where they
  // clicked, instead of always dropping them at /effects.
  const rawRedirectUrl = searchParams.get("redirect_url");
  const redirectUrl = getSafeRedirectUrl(rawRedirectUrl, "/effects");
  const signUpHref = rawRedirectUrl
    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-up";

  return (
    <SplitAuthLayout>
      <SignInForm redirectUrl={redirectUrl} signUpHref={signUpHref} />
    </SplitAuthLayout>
  );
}
