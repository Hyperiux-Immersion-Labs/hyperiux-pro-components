"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLenis } from "lenis/react";
import WebsiteButton from "@/components/WebsiteComps/Button";
import Input from "@/components/animated-form/Input";
import PhoneInput from "@/components/animated-form/PhoneInput";
import Textarea from "@/components/animated-form/Textarea";


const MODAL_QUERY_KEY = "custom-animation-form";
const MODAL_QUERY_VALUE = "open";

const MODAL_TRANSITION = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1],
};

const INITIAL_FORM = {
  name: "",
  email: "",
  number: "",
  message: "",
};

const CUSTOM_ANIMATION_COUNTRIES = [
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
];

function buildUrlWithCustomAnimationForm(pathname, searchParams) {
  const params = new URLSearchParams(searchParams.toString());

  params.set(MODAL_QUERY_KEY, MODAL_QUERY_VALUE);

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function buildUrlWithoutCustomAnimationForm(pathname, searchParams) {
  const params = new URLSearchParams(searchParams.toString());

  params.delete(MODAL_QUERY_KEY);

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function validateForm(values) {
  const errors = {};

  const name = values.name.trim();
  const email = values.email.trim();
  const number = values.number.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!number) {
    errors.number = "Please enter your phone number.";
  } else if (!/^[+()\-.\s0-9]{7,24}$/.test(number)) {
    errors.number = "Please enter a valid phone number.";
  }

  if (!message) {
    errors.message = "Please describe what you need.";
  } else if (message.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90"
    >
      {children}
    </label>
  );
}

function useCustomAnimationFormModalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get(MODAL_QUERY_KEY) === MODAL_QUERY_VALUE;

  const openCustomAnimationForm = useCallback(() => {
    router.push(buildUrlWithCustomAnimationForm(pathname, searchParams), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const closeCustomAnimationForm = useCallback(() => {
    router.push(buildUrlWithoutCustomAnimationForm(pathname, searchParams), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  return {
    isOpen,
    openCustomAnimationForm,
    closeCustomAnimationForm,
  };
}

export function useCustomAnimationFormModal() {
  return useCustomAnimationFormModalInner();
}

function CustomAnimationFormTriggerInner({
  children = "Request Custom Animation",
  className = "",
}) {
  const { openCustomAnimationForm } = useCustomAnimationFormModalInner();

  return (
    <button
      type="button"
      onClick={openCustomAnimationForm}
      className={className}
    >
      {children}
    </button>
  );
}

export function CustomAnimationFormTrigger(props) {
  return (
    <Suspense fallback={null}>
      <CustomAnimationFormTriggerInner {...props} />
    </Suspense>
  );
}

function CustomAnimationFormModalInner() {
  const { isOpen, closeCustomAnimationForm } =
    useCustomAnimationFormModalInner();

  const lenis = useLenis();

  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle");

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    lenis?.stop?.();

    const restartStop = window.setInterval(() => {
      lenis?.stop?.();
    }, 80);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCustomAnimationForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearInterval(restartStop);
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      lenis?.start?.();

      requestAnimationFrame(() => {
        lenis?.start?.();
      });

      window.setTimeout(() => {
        lenis?.start?.();
      }, 80);
    };
  }, [isOpen, lenis, closeCustomAnimationForm]);

  useEffect(() => {
    if (isOpen) return;

    const timeoutId = window.setTimeout(() => {
      setValues(INITIAL_FORM);
      setErrors({});
      setServerError("");
      setStatus("idle");
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const updateField = (field) => (eventOrValue) => {
    const nextValue =
      typeof eventOrValue === "string"
        ? eventOrValue
        : eventOrValue?.target?.value || "";

    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(values);

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");

    try {
      const response = await fetch("/api/custom-animation-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          number: values.number.trim(),
          message: values.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("idle");
        setServerError(
          data?.error || "Something went wrong. Please try again."
        );
        return;
      }

      setStatus("success");

      window.setTimeout(() => {
        closeCustomAnimationForm();
      }, 1100);
    } catch (error) {
      console.error("Custom animation form error:", error);

      setStatus("idle");
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="custom-animation-form-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-6 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-animation-form-title"
        >
          <motion.button
            type="button"
            aria-label="Close custom animation form modal"
            onClick={closeCustomAnimationForm}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
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
          />

          <motion.div
            className="relative z-10 w-[80vw] max-md:w-[95%]"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={MODAL_TRANSITION}
          >
            {/* Mobile/tablet close button — floats above the box */}
            <button
              type="button"
              aria-label="Close"
              onClick={closeCustomAnimationForm}
              className="group md:hidden absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition-all duration-300 hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white max-sm:right-[-5%]"
            >
              <div className="relative flex h-4 w-4 items-center justify-center transition-transform duration-500 ease-in-out group-hover:rotate-90">
                <span className="h-px w-4 rotate-45 bg-white" />
                <span className="absolute h-px w-4 -rotate-45 bg-white" />
              </div>
            </button>

            <div
              className="relative w-full overflow-x-hidden overflow-y-auto rounded-[1.5vw] border border-white/20 bg-black/4 p-[3.5vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl max-md:h-[75vh] max-md:rounded-[4vw] max-md:p-[6vw] max-sm:rounded-[5vw]"
              onWheelCapture={(e) => e.stopPropagation()}
            >
            {/* Desktop close button — inside the box */}
            <button
              type="button"
              aria-label="Close"
              onClick={closeCustomAnimationForm}
              className="max-md:hidden group absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white"
            >
              <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
                <span className="h-[1px] w-4 rotate-45 bg-white" />
                <span className="absolute h-[1px] w-4 -rotate-45 bg-white" />
              </div>
            </button>

            <div className="relative z-10">
              <h3
                id="custom-animation-form-title"
                className="text-[3vw] leading-none max-md:text-[8vw]"
              >
                {isSuccess
                  ? "Request sent."
                  : "Request a Custom Animation"}
              </h3>

              <p className="mt-[1vw] max-w-[70vw] text24 leading-relaxed text-white/80 max-md:mt-4 max-md:max-w-full max-md:text-[4vw]">
                {isSuccess
                  ? "We received your request. Closing this window now."
                  : "Tell us what interaction, loader, transition, cursor, or WebGL detail you want. We will review it and get back to you."}
              </p>

              {isSuccess ? (
                <div className="mt-[4vw] rounded-[1vw] border border-emerald-400/20 bg-emerald-400/10 p-[2vw] max-md:mt-8 max-md:rounded-3xl max-md:p-6">
                  <p className="text-[1.4vw] font-medium text-emerald-100 max-md:text-xl">
                    Your custom animation request has been sent.
                  </p>

                  <p className="mt-2 text-[1vw] text-white/70 max-md:text-[4vw]">
                    We will get back to you shortly. The tiny interaction goblin
                    has been notified.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-[3vw] grid grid-cols-2 gap-x-[3vw] gap-y-[2vw] max-md:mt-8 max-md:grid-cols-1 max-md:gap-5"
                >
                  <div className="space-y-[1vw] max-md:space-y-5">
                    <div>
                      <FieldLabel htmlFor="custom-animation-name">
                        Name*
                      </FieldLabel>
                      <Input
                        id="custom-animation-name"
                        name="name"
                        label={false}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]!"
                        value={values.name}
                        onChange={updateField("name")}
                        autoComplete="name"
                        error={errors.name}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor="custom-animation-email">
                        Email*
                      </FieldLabel>
                      <Input
                        id="custom-animation-email"
                        name="email"
                        type="email"
                        label={false}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]!"
                        value={values.email}
                        onChange={updateField("email")}
                        autoComplete="email"
                        error={errors.email}
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor="custom-animation-number">
                        Phone Number*
                      </FieldLabel>
                      <PhoneInput
                        id="custom-animation-number"
                        name="number"
                        label={false}
                        placeholder="98765 43210"
                        value={values.number}
                        onChange={updateField("number")}
                        defaultCountry="IN"
                        countries={CUSTOM_ANIMATION_COUNTRIES}
                        showCountryName
                        error={errors.number}
                        className="border-white/20 bg-white/10 text-white focus-within:border-[#ff5f00]!"
                        countryButtonClassName="text-white/80 hover:text-white"
                        flagClassName="text-base"
                        dialCodeClassName="text-white"
                        chevronClassName="text-white/60"
                        dividerClassName="bg-white/15"
                        inputClassName="text-white placeholder:text-white/35"
                        dropdownClassName="min-w-64 border-white/10! bg-[#111111]! rounded-md text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        optionClassName="text-white/70 hover:bg-white/10 hover:text-white"
                        activeOptionClassName="text-[#ff5f00]"
                        optionDialClassName="text-white/40"
                        errorClassName="text-red-300"
                      />
                    </div>
                  </div>

                  <div className="h-full">
                    <FieldLabel htmlFor="custom-animation-message">
                      Message*
                    </FieldLabel>
                    <Textarea
                      id="custom-animation-message"
                      name="message"
                      label={false}
                      className="h-[17.3vw]! rounded-xl! border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]! max-md:h-36!"
                      rows={3}
                      value={values.message}
                      onChange={updateField("message")}
                      error={errors.message}
                      placeholder="Tell us what you want to build..."
                    />
                  </div>

                  {serverError && (
                    <div className="col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200 max-md:col-span-1">
                      {serverError}
                    </div>
                  )}

                  <div className="col-span-2 mt-4 flex items-center gap-4 max-md:col-span-1 max-md:flex-col max-md:items-start">
                    <WebsiteButton
                      text={isSubmitting ? "Sending..." : "Send Request"}
                      href="#"
                      preventDefault
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      variant="orange"
                      scaleClass="group-hover:scale-[50]"
                      className="min-w-0"
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CustomAnimationFormModal() {
  return (
    <Suspense fallback={null}>
      <CustomAnimationFormModalInner />
    </Suspense>
  );
}