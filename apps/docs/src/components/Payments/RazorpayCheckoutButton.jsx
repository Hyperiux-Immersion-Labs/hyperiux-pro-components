"use client";

import { useState } from "react";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";

// Razorpay Standard Checkout button. Two modes:
//   <RazorpayCheckoutButton amount={1} />          one-time order (testing)
//   <RazorpayCheckoutButton plan="monthly" />      subscription (monthly|yearly|founding)
export default function RazorpayCheckoutButton({
  amount,
  plan,
  className = "",
  onSuccess,
  onError,
  children = "Pay with Razorpay",
}) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const endpoint = plan
        ? "/api/razorpay/create-subscription"
        : "/api/razorpay/create-order";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan ? { plan } : { amount }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not start checkout");
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        ...(plan
          ? { subscription_id: data.subscriptionId }
          : {
              order_id: data.orderId,
              amount: data.amount,
              currency: data.currency,
            }),
        name: "Hyperiux Vault",
        description: plan ? `Vault Pro (${plan})` : "Test payment",
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        handler: async function handleCheckoutSuccess(response) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();

            if (!verifyRes.ok || !verifyJson.verified) {
              throw new Error(verifyJson.error || "Payment could not be verified");
            }

            onSuccess?.({ ...response, ...verifyJson });
          } catch (err) {
            setError(err.message);
            onError?.(err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment failed";
        setError(message);
        onError?.(new Error(message));
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
      onError?.(err);
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !scriptReady}
        className={className}
      >
        {loading ? "Processing…" : children}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </>
  );
}
