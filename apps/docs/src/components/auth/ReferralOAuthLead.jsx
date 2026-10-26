"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { addReferralLead, takeOAuthSignUpPending } from "@/lib/referral-rocket";

// An account this recent was made by the OAuth round trip that left the note
const NEW_ACCOUNT_MS = 30 * 60 * 1000;

// Reports a referred GitHub/Google sign-up once the visitor lands back signed
// in. Email sign-ups report from useVaultClerk's activate(); an OAuth one
// leaves the site mid-flow, so startOAuth leaves a note in sessionStorage
// (only for referred visitors) and this picks it up on the way back.
export default function ReferralOAuthLead() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (!takeOAuthSignUpPending()) return;
    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    if (Date.now() - createdAt > NEW_ACCOUNT_MS) return;
    addReferralLead(user.primaryEmailAddress?.emailAddress);
  }, [isLoaded, isSignedIn, user]);

  return null;
}
