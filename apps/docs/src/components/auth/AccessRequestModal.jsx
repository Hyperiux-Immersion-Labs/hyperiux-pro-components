"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Waitlist } from "@clerk/nextjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildUrlWithWaitlist(pathname, searchParams) {
  const params = new URLSearchParams(searchParams.toString());

  params.set("waitlist", "open");

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function buildUrlWithoutWaitlist(pathname, searchParams) {
  const params = new URLSearchParams(searchParams.toString());

  params.delete("waitlist");

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function useWaitlistModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("waitlist") === "open";

  const openWaitlist = useCallback(() => {
    router.push(buildUrlWithWaitlist(pathname, searchParams), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const closeWaitlist = useCallback(() => {
    router.push(buildUrlWithoutWaitlist(pathname, searchParams), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  return {
    isOpen,
    openWaitlist,
    closeWaitlist,
  };
}

export function WaitlistTrigger({
  children = "Unlock the Vault",
  className = "",
}) {
  const { openWaitlist } = useWaitlistModal();

  return (
    <button type="button" onClick={openWaitlist} className={className}>
      {children}
    </button>
  );
}

export default function AccessRequestModal() {
  const { isOpen, closeWaitlist } = useWaitlistModal();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const afterJoinWaitlistUrl = useMemo(() => {
    return buildUrlWithoutWaitlist(pathname, searchParams);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeWaitlist();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeWaitlist]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-6 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
    >
      <button
        type="button"
        aria-label="Close waitlist modal"
        onClick={closeWaitlist}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
      />

      <div className="relative z-10 w-[43vw] rounded-[0.9vw] border border-white/5 bg-white/[0.02] backdrop-blur-lg px-[8vw] py-[3.2vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] max-md:w-[95%] max-md:rounded-[2vw] max-sm:rounded-[3.5vw] max-md:py-[7vw]">
        <button
          type="button"
          aria-label="Close"
          onClick={closeWaitlist}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          ×
        </button>

        <div className="mb-10 text-center max-sm:mb-8">
          <h1
            id="waitlist-modal-title"
            className="font-display text-[2.5vw] max-md:text-[7vw] max-sm:text-[9vw] font-normal leading-none text-white"
          >
            Unlock the Vault
          </h1>

          <p className="mx-auto mt-2 w-full text-center text-[1vw] max-md:text-[2.5vw] max-sm:text-[4vw] text-white/50 max-sm:mt-4">
            Create your free account and start exploring the Vault.
            <br className="max-sm:hidden" />
            Your login details will be delivered to your inbox.
          </p>
        </div>

        <Waitlist
          afterJoinWaitlistUrl={afterJoinWaitlistUrl}
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
    </div>
  );
}