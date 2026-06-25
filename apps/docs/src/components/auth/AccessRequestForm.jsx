"use client";

import { Waitlist } from "@clerk/nextjs";

export default function AccessRequestForm() {
  return (
    <div className="w-[43vw] rounded-[0.9vw] border border-white/5 bg-white/[0.02] backdrop-blur-lg px-[8vw] py-[3.2vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] max-md:w-[95%] max-md:rounded-[2vw] max-sm:rounded-[3.5vw] max-md:py-[7vw]">
      <div className="mb-10 text-center max-sm:mb-8">
        <h1 className="font-display text-[2.5vw] max-md:text-[7vw] max-sm:text-[9vw] font-normal leading-none text-white">
          Unlock the Vault
        </h1>

        <p className="mx-auto mt-2 w-full text-center text-[1vw] max-md:text-[2.5vw] max-sm:text-[4vw] text-white/50 max-sm:mt-4">
          Create your free account and start exploring the Vault.
          <br className="max-sm:hidden" />
          Your login details will be delivered to your inbox.
        </p>
      </div>

      <Waitlist
        appearance={{
          variables: {
            colorPrimary: "#ff5f00",
            colorBackground: "transparent",
            colorInputBackground: "rgba(255,255,255,0.10)",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.55)",
            colorDanger: "#fecaca",
            borderRadius: "9999px",
            fontFamily: "inherit",
          },
          elements: {
            rootBox: "w-full",
            card: [
              "w-full",
              "bg-transparent",
              "shadow-none",
              "border-0",
              "p-0",
              "m-0",
            ].join(" "),

            header: "hidden",
            headerTitle: "hidden",
            headerSubtitle: "hidden",

            main: "w-full",
            form: "",
            formField: "",
            formFieldRow: "",

            formFieldLabel:
              "mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90",

            formFieldInput: [
              "h-[3vw]",
              "w-full",
              "rounded-full",
              "border",
              "border-transparent",
              "bg-white/10",
              "px-7",
              "text-[clamp(15px,0.95vw,19px)]",
              "text-white",
              "outline-none",
              "shadow-none",
              "transition-colors",
              "placeholder:text-white/35",
              "focus:border-primary/70",
              "focus:ring-0",
              "focus:shadow-none",
              "max-md:h-12",
              "max-sm:px-5",
            ].join(" "),

            formButtonPrimary: [
              "mt-8",
              "flex",
              "h-[3.3vw]",
              "min-h-12",
              "w-full",
              "items-center",
              "justify-center",
              "rounded-full",
              "bg-primary",
              "px-6",
              "text-[clamp(16px,1.05vw,22px)]",
              "font-medium",
              "text-white",
              "shadow-none",
              "transition-colors",
              "duration-300",
              "hover:bg-primary-hover",
              "disabled:cursor-not-allowed",
              "disabled:opacity-55",
              "max-sm:mt-8",
              "max-md:h-12",
              "cursor-pointer",
            ].join(" "),

            formFieldErrorText:
              "mt-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200",

            alert: [
              "rounded-2xl",
              "border",
              "border-red-500/20",
              "bg-red-500/10",
              "px-5",
              "py-3",
              "text-sm",
              "leading-6",
              "text-red-200",
            ].join(" "),

            alertText: "text-red-200",
            alertIcon: "text-red-200",

            footer: "hidden",
            footerAction: "hidden",
            footerActionText: "hidden",
            footerActionLink: "hidden",

            socialButtonsBlockButton: "hidden",
            dividerRow: "hidden",

            otpCodeFieldInput:
              "h-12 w-12 rounded-xl border border-white/10 bg-white/10 text-white",
          },
          layout: {
            socialButtonsPlacement: "bottom",
          },
        }}
      />
    </div>
  );
}