"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useSignUp } from "@clerk/nextjs/legacy";
import SplitAuthLayout from "./SplitAuthLayout";
import {
  errorMessage,
  StepHeading,
  TextField,
  GlobalError,
  SubmitButton,
  SecondaryButton,
} from "./AuthFormPrimitives";

// Custom-built replacement for the prebuilt `<SignUp />` component, mirroring
// SignInFlow.jsx's approach and layout - see that file for why `useSignUp()`
// is imported from the `/legacy` subpath (plain `@clerk/nextjs` now returns
// a Signals-based shape with no `isLoaded`/`setActive`, which silently
// breaks the `if (!isLoaded || loading) return;` guards below).

const ART_SRC =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg";

const RESEND_COOLDOWN_SECONDS = 30;

// Matches the prebuilt <SignUp/> component's existing fallbackRedirectUrl
// (see the old sign-up page.js) - keeps the same post-signup funnel.
const REDIRECT_AFTER_SIGN_UP = "/pricing#pricing-cards";

export default function SignUpFlow() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const formRef = useRef(null);

  // "start" | "verify-email"
  const [step, setStep] = useState("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function completeSignUp(result) {
    await setActive({ session: result.createdSessionId });
    router.push(REDIRECT_AFTER_SIGN_UP);
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    if (!isLoaded || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.create({ emailAddress: email, password });

      if (result.status === "complete") {
        await completeSignUp(result);
      } else {
        // Every sign-up on this instance requires email verification before
        // it can complete - prepare it up front rather than branching on
        // exactly which requirement Clerk reports missing.
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("verify-email");
        startResendCooldown();
      }
    } catch (err) {
      setError(errorMessage(err, "Unable to create your account. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!isLoaded || loading || resendCooldown > 0) return;

    setLoading(true);
    setError(null);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      startResendCooldown();
    } catch (err) {
      setError(errorMessage(err, "Unable to resend the code. Try again in a moment."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail(event) {
    event.preventDefault();
    if (!isLoaded || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await completeSignUp(result);
      } else {
        setError("Additional verification is required for this account. Please contact support.");
      }
    } catch (err) {
      setError(errorMessage(err, "That code didn't work. Check it and try again."));
    } finally {
      setLoading(false);
    }
  }

  function backToStart() {
    setError(null);
    setStep("start");
  }

  return (
    <SplitAuthLayout artSrc={ART_SRC}>
      <GlobalError message={error} />

      {step === "start" && (
        <form ref={formRef} onSubmit={handleCreateAccount}>
          <StepHeading
            title="Open the Vault."
            subtitle="Create an account and start with the Free Core. Install what you need. Own what you ship."
          />

          <TextField
            id="email-address"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          {/* Required by Clerk's bot sign-up protection (Smart CAPTCHA) for
              custom flows - signUp.create() has nowhere to mount its
              challenge widget without this and hangs indefinitely. See
              https://clerk.com/docs/guides/development/custom-flows/authentication/bot-sign-up-protection */}
          <div id="clerk-captcha" />

          <div className="mt-6">
            <SubmitButton loading={loading} formRef={formRef} className="w-fit">
              Create my account
            </SubmitButton>
          </div>

          <p className="mt-6 text-left text-sm text-white/50 font-geist-mono">
            Already have an account?{" "}
            <NextLink href="/sign-in" className="text-[#ff5f00] hover:text-[#ff7a29]">
              Sign in
            </NextLink>
          </p>
        </form>
      )}

      {step === "verify-email" && (
        <form ref={formRef} onSubmit={handleVerifyEmail}>
          <StepHeading
            title="Check your email."
            subtitle={`Enter the code we sent to ${email} to verify your account.`}
          />

          <TextField
            id="code"
            label="Verification code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            autoComplete="one-time-code"
          />

          <div className="mb-6">
            <SubmitButton loading={loading} formRef={formRef} className="w-fit">
              Verify email
            </SubmitButton>
          </div>

          <div className="flex items-center justify-between text-sm">
            <SecondaryButton onClick={backToStart}>Go back</SecondaryButton>
            {resendCooldown > 0 ? (
              <span className="text-white/30">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[#ff5f00] hover:text-[#ff7a29]"
              >
                Resend code
              </button>
            )}
          </div>
        </form>
      )}
    </SplitAuthLayout>
  );
}
