"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole, X } from "lucide-react";
import RazorpayCheckoutButton from "@/components/Payments/RazorpayCheckoutButton";

// Same blurred-code visual language as effect-detail.jsx's
// LockedCodePlaceholder, adapted into a modal (that one is an inline
// section, not a dismissible overlay) with an inline one-time-purchase
// checkout instead of a link to /pricing - this is a real purchase, not a
// subscription upsell.
const TEASER_LINES = [
  "const zip = unlock({ technique: 'inspect-element-jutsu' });",
  "if (devtools.open) throw new Error('nice try, detective');",
  "console.log('inspect will not work every time, boss');",
  "const fallbackPlan = purchase({ reason: 'time saved > ego' });",
  "return 'blurred until you buy the template';",
];

export function TemplatePaywallModal({ template, open, onClose, onPurchased }) {
  const [mounted, setMounted] = useState(false);

  // SSR-safe mounted flag - gates the createPortal() call below, which
  // needs document.body and so can only run after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const price = template.pricing?.standaloneOneTime;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-paywall-title"
      onClick={onClose}
    >
      <div
        className="relative w-[42vw] max-md:w-full max-[1025px]:w-[70%] overflow-hidden border border-white/30 bg-[#0e0e0e] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="group absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-all duration-300 hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute left-2 top-0 px-6 py-5 text-[11px] leading-6 text-white">
            {TEASER_LINES.map((line, index) => (
              <p key={`${line}-${index}`} className="whitespace-nowrap blur-md select-none">
                <span className="mr-3 text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-white/5 px-8 py-10 text-center">
          <LockKeyhole className="h-16 w-16 text-white" strokeWidth={1.2} />

          <div className="flex flex-col items-center gap-1">
            <h3 id="template-paywall-title" className="text-2xl font-bold text-white">
              Buy {template.title}
            </h3>

            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              One-time purchase — download the full project and run it in any
              IDE with <code className="text-white/70">npm i</code>. Or get
              every template included with an annual Vault Pro subscription.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-3">
            <RazorpayCheckoutButton
              amount={price}
              // TEMPORARY: forced to INR to isolate a "3dsecure is not
              // enabled" decline that showed up testing with USD - Razorpay
              // test-mode international/3DS card handling, not a bug in
              // this integration (the decline came back from a real
              // create-order -> checkout -> Razorpay round trip). Revert to
              // "USD" once confirmed working end-to-end on INR, then
              // separately resolve international payments in the Razorpay
              // dashboard (or with their support) before shipping USD.
              currency="INR"
              templateSlug={template.slug}
              className="cursor-pointer bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#e0540a] disabled:cursor-not-allowed disabled:opacity-50"
              onSuccess={() => onPurchased?.()}
            >
              {`Buy Template — $${price}`}
            </RazorpayCheckoutButton>

            <a
              href="/pricing"
              className="text-xs text-white/40 underline underline-offset-2 transition-colors hover:text-white/70"
            >
              or get every template with annual Vault Pro
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
