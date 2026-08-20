"use client";

import { useUser } from "@clerk/nextjs";
import ButtonV3 from "../components/ButtonV3";
import RazorpayCheckoutButton from "@/components/Payments/RazorpayCheckoutButton";

const ORANGE_BTN =
  "bg-primary text-black font-neue-haas cursor-pointer px-[1.2vw] py-[0.8vw] text-[1.15vw] max-[1025px]:w-full max-[1025px]:px-5 max-[1025px]:py-4 max-[1025px]:text-[2vw] max-md:text-[2.2vw] max-sm:w-full max-sm:justify-center max-sm:py-4 max-sm:text-[4vw]";

export default function PricingV3Cta({ isYearly, currency }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const userPlan = isSignedIn ? user?.publicMetadata?.plan || "free" : null;

  if (!isLoaded || !isSignedIn) {
    return (
      <ButtonV3
        variant="orange"
        href="/sign-up"
        text="Upgrade to Pro"
        className="max-sm:w-full max-sm:justify-center"
      />
    );
  }

  if (userPlan === "pro") {
    return (
      <ButtonV3
        variant="orange"
        href="/dashboard"
        text="You're on Pro"
        className="max-sm:w-full max-sm:justify-center"
      />
    );
  }

  return (
    <RazorpayCheckoutButton
      plan={isYearly ? "yearly" : "monthly"}
      currency={currency}
      className={ORANGE_BTN}
    >
      Upgrade to Pro
    </RazorpayCheckoutButton>
  );
}
