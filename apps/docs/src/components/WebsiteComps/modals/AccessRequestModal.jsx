"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useWaitlist } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ROLE_OPTIONS = [
  "Founder",
  "Frontend Developer",
  "UI Engineer",
  "Design Engineer",
  "Creative Developer",
  "Product Designer",
  "Agency / Studio",
  "Other",
];

const MODAL_TRANSITION = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1],
};

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

function useWaitlistModalInner() {
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
    pathname,
    searchParams,
  };
}

export function useWaitlistModal() {
  return useWaitlistModalInner();
}

function WaitlistTriggerInner({
  children = "Unlock the Vault",
  className = "",
}) {
  const { openWaitlist } = useWaitlistModalInner();

  return (
    <button type="button" onClick={openWaitlist} className={className}>
      {children}
    </button>
  );
}

export function WaitlistTrigger(props) {
  return (
    <Suspense fallback={null}>
      <WaitlistTriggerInner {...props} />
    </Suspense>
  );
}

function AccessRequestModalInner() {
  const { isOpen, closeWaitlist } = useWaitlistModalInner();
  const { waitlist, errors, fetchStatus } = useWaitlist();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [localError, setLocalError] = useState("");

  const isSubmitting = fetchStatus === "fetching";

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

  useEffect(() => {
    if (!isOpen) {
      setLocalError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!waitlist?.id) return;

    const timeoutId = window.setTimeout(() => {
      closeWaitlist();
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [waitlist?.id, closeWaitlist]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLocalError("");

    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedEmail = emailAddress.trim();

    if (!trimmedName) {
      setLocalError("Please enter your name.");
      return;
    }

    if (!trimmedRole) {
      setLocalError("Please select what best describes you.");
      return;
    }

    if (!trimmedEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    const { error } = await waitlist.join({
      emailAddress: trimmedEmail,
    });

    if (error) {
      setLocalError(
        error?.longMessage ||
          error?.message ||
          "Something went wrong. Please try again."
      );
      return;
    }

    try {
      await fetch("/api/waitlist-extra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          role: trimmedRole,
          emailAddress: trimmedEmail,
        }),
      });
    } catch (error) {
      console.error("Failed to save extra waitlist fields:", error);
    }

    setName("");
    setRole("");
    setEmailAddress("");

    window.setTimeout(() => {
      closeWaitlist();
    }, 650);
  };

  const emailError = errors?.fields?.emailAddress?.longMessage;
  const visibleError = localError || emailError;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="access-request-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-6 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
         
        >
          <motion.button
            type="button"
            aria-label="Close waitlist modal"
            onClick={closeWaitlist}
             initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={MODAL_TRANSITION}

            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            className="relative z-10 w-[43vw] rounded-[0.9vw] border border-white/5 bg-white/[0.02] px-[8vw] py-[4.5vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-lg max-md:w-[95%] max-md:rounded-[2vw] max-md:py-[7vw] max-sm:rounded-[3.5vw]"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={MODAL_TRANSITION}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeWaitlist}
              className="absolute right-5  top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:bg-[#ff5f00] hover:border-[#ff5f00] hover:text-white group"
            >
              <div className="w-4 h-4 flex items-center justify-center group-hover:rotate-90 duration-500 ease-in-out relative">
              <span className=" h-[1px] w-4 rotate-45 bg-white" />
              <span className="absolute h-[1px] w-4 -rotate-45 bg-white" />

              </div>
            </button>

            <div className="mb-10 text-center max-sm:mb-8">
              <h1
                id="waitlist-modal-title"
                className="font-display text-[2.5vw] font-normal leading-none text-white max-md:text-[7vw] max-sm:text-[9vw]"
              >
                Get inside the Vault
              </h1>

              <p className="mx-auto mt-2 w-full text-center text-[1vw] text-white/50 max-md:text-[2.5vw] max-sm:mt-4 max-sm:text-[4vw]">
                Join the waitlist for early access to creative interaction effects, Pro packs, and founder pricing before the doors get heavier.
              </p>
            </div>

            {waitlist?.id ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center text-sm leading-6 text-emerald-200">
                You are on the list. We will notify you when access opens.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                <div className="m-0">
                  <label
                    htmlFor="waitlist-name"
                    className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90"
                  >
                    Name
                  </label>

                  <input
                    id="waitlist-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoComplete="name"
                    placeholder="What should we call you?"
                    className="h-[3vw] min-h-12 w-full rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none shadow-none transition-colors placeholder:text-white/35 focus:border-primary/70 focus:ring-0 focus:shadow-none max-md:h-12 max-sm:px-5"
                  />
                </div>

                <div className="m-0">
                  <label
                    htmlFor="waitlist-role"
                    className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90"
                  >
                    What are you here to ship?
                  </label>

                  <select
                    id="waitlist-role"
                    name="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    required
                    className="h-[3vw] min-h-12 w-full appearance-none rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none shadow-none transition-colors focus:border-primary/70 focus:ring-0 focus:shadow-none max-md:h-12 max-sm:px-5"
                  >
                    <option value="" className="bg-[#111] text-white">
                      Choose your lane
                    </option>

                    {ROLE_OPTIONS.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-[#111] text-white"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="m-0">
                  <label
                    htmlFor="waitlist-email"
                    className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90"
                  >
                    Email address
                  </label>

                  <input
                    id="waitlist-email"
                    name="emailAddress"
                    type="email"
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="h-[3vw] min-h-12 w-full rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none shadow-none transition-colors placeholder:text-white/35 focus:border-primary/70 focus:ring-0 focus:shadow-none max-md:h-12 max-sm:px-5"
                  />
                </div>

                {visibleError && (
                  <div className="mt-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200">
                    {visibleError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex h-[3.3vw] min-h-12 w-full cursor-pointer items-center justify-center rounded-full border-0 bg-primary px-6 text-[clamp(16px,1.05vw,22px)] font-medium text-white shadow-none transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55 max-md:h-12 max-sm:mt-8"
                >
                  {isSubmitting ? "Joining..." : "Join the Waitlist"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AccessRequestModal() {
  return (
    <Suspense fallback={null}>
      <AccessRequestModalInner />
    </Suspense>
  );
}