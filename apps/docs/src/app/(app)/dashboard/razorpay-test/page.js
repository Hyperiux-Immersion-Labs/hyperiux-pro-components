"use client";

import { useState } from "react";
import RazorpayCheckoutButton from "@/components/Payments/RazorpayCheckoutButton";

const BUTTON_CLASS =
  "rounded-full bg-white text-black px-7 py-3 text-sm font-semibold transition duration-300 hover:bg-[#ff5f00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

// Internal-only page to validate Razorpay checkout flows end to end.
// Not linked from any nav - visit /dashboard/razorpay-test directly.
export default function RazorpayTestPage() {
  const [result, setResult] = useState(null);

  const handlers = {
    onSuccess: (response) => setResult({ status: "success", ...response }),
    onError: (err) => setResult({ status: "error", message: err.message }),
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Razorpay test checkout</h1>
        <p className="text-white/50 mt-2">
          One-time order and subscription flows against the test account.
          Subscriptions activate Pro access on verify.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4">
        <RazorpayCheckoutButton amount={1} className={BUTTON_CLASS} {...handlers}>
          Pay ₹1 (one-time test)
        </RazorpayCheckoutButton>

        <RazorpayCheckoutButton plan="monthly" className={BUTTON_CLASS} {...handlers}>
          Subscribe — $20/mo
        </RazorpayCheckoutButton>

        <RazorpayCheckoutButton plan="yearly" className={BUTTON_CLASS} {...handlers}>
          Subscribe — $179/yr (auto-discounts to $149 for first 100 paid users)
        </RazorpayCheckoutButton>
      </div>

      {result && (
        <pre className="rounded-md bg-[#272727] p-4 text-xs text-white/70 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
