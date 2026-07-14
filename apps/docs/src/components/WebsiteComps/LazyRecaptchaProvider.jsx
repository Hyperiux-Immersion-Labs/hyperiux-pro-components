"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReCaptchaProvider } from "next-recaptcha-v3";

const MODAL_KEYS = ["custom-animation-form", "work-with-hyperiux"];

// reCAPTCHA (~250KB) was loaded on every page via a root provider even though
// it is only needed inside contact modals. Mount the provider only when a
// modal query is open so the homepage never downloads it on first paint.
function LazyRecaptchaProviderInner({ children }) {
  const searchParams = useSearchParams();
  const needsRecaptcha = MODAL_KEYS.some(
    (key) => searchParams.get(key) === "open"
  );
  // Stick once armed so closing the modal doesn't tear down the provider mid-token.
  const [armed, setArmed] = useState(false);
  const enabled = armed || needsRecaptcha;

  useEffect(() => {
    if (needsRecaptcha) setArmed(true);
  }, [needsRecaptcha]);

  if (!enabled) return children;

  return (
    <ReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      {children}
    </ReCaptchaProvider>
  );
}

export default function LazyRecaptchaProvider({ children }) {
  return (
    <Suspense fallback={children}>
      <LazyRecaptchaProviderInner>{children}</LazyRecaptchaProviderInner>
    </Suspense>
  );
}
