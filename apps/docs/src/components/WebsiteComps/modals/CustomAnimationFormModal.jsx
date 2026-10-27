"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import PhoneInput from "@/components/WebsiteComps/form/PhoneInput";
import { GlobalError, StepHeading, SubmitButton } from "@/components/auth/AuthFormPrimitives";
import Turnstile from "@/components/WebsiteComps/Turnstile";
import { validateForm } from "@/lib/form-validation";
import { useCustomAnimationFormModal } from "./CustomAnimationForm";
import { useLenisLock } from "@/hooks/useLenisLock";

const MODAL_TRANSITION = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1],
};

// Input/Textarea/PhoneInput (components/animated-form) forward unknown
// props onto their real <input>/<textarea>, so this reaches the actual DOM
// node without touching those shared components - they're also reused by
// light-background template-demo forms, which still want the browser's
// light default. globals.css's base input:-webkit-autofill rule paints an
// inset box-shadow the size of the field to fake a background override
// (Chrome's own autofill fill can't be styled directly) - transparent here
// means that fake fill paints nothing, so the field's own background (set
// via its own className) just shows through autofilled or not, instead of
// flashing a solid color. -webkit-text-fill-color still needs the explicit
// white override regardless: browsers force autofilled text to a fixed dark
// color otherwise, unreadable here no matter what the background does.
const AUTOFILL_STYLE = {
  "--input-autofill-bg": "transparent",
  "--input-autofill-text": "var(--foreground)",
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

// Fields match the sign-in page (components/auth/AuthFormPrimitives TextField):
// Geist Mono label and a quiet white/5 box.
const FIELD_CLASS =
  "w-full border border-white/10 bg-white/5 px-4 py-3 text-base! text-white placeholder:text-white/30 outline-none transition";

function Field({ id, label, error, children }) {
  return (
    <div className="mb-5 space-y-2 max-md:mb-4">
      <label htmlFor={id} className="block font-geist-mono text-sm font-medium tracking-wide text-white/80">
        {label}
      </label>
      <div className="group relative h-fit w-full">
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function CustomAnimationFormModalInner() {
  const { isOpen, closeCustomAnimationForm } =
    useCustomAnimationFormModal();


  const formRef = useRef(null);
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  // The page's scrollbar stays in place while the form is open (hiding the overflow
  // took its width away and shifted the page), hidden until the exit animation ends
  useLenisLock(isOpen, { closeMs: MODAL_TRANSITION.duration * 1000 });

  // (Lenis is stopped and restarted by useLenisLock above, which knows whether another
  // modal still holds the page)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCustomAnimationForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCustomAnimationForm]);

  useEffect(() => {
    if (isOpen) return;

    const timeoutId = window.setTimeout(() => {
      setValues(INITIAL_FORM);
      setErrors({});
      setServerError("");
      setStatus("idle");
      setCaptchaVerified(false);
      setCaptchaToken(null);
      setCaptchaError("");
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

    if (!captchaToken) {
      setCaptchaError("Still checking you're human - give it a moment, then send again.");
      return;
    }

    setCaptchaError("");
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
          turnstileToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("idle");
        setCaptchaVerified(false);
        setCaptchaToken(null);
        // Field-level errors (e.g. the server-side blocked-domain check) land
        // on their inputs; the banner is only for non-field failures.
        if (data?.errors && Object.keys(data.errors).length > 0) {
          setErrors((prev) => ({ ...prev, ...data.errors }));
        } else {
          setServerError(
            data?.error || "Something went wrong. Please try again."
          );
        }
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
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-lg"
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
            className="relative z-10 w-full max-w-160"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={MODAL_TRANSITION}
          >
            {/* Card: the sign-in page's surface - site background, hairline border. */}
            <div
              data-lenis-prevent
              className="custom-animation-form-scroll relative max-h-[88vh] w-full overflow-x-hidden overflow-y-auto border border-white/10 bg-background px-12 py-12 text-white shadow-float max-lg:px-8 max-lg:py-10 max-md:px-5 max-md:py-8"
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Same close control as the site's other modals. */}
              <button
                id="custom-animation-form-modal-close"
                type="button"
                aria-label="Close"
                onClick={closeCustomAnimationForm}
                className="group absolute top-5 right-5 flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-colors duration-500 ease-in-out hover:border-primary hover:bg-primary hover:text-white max-md:top-4 max-md:right-4 max-md:h-9 max-md:w-9"
              >
                <span className="relative flex h-4 w-4 items-center justify-center transition-transform duration-500 ease-in-out group-hover:rotate-90">
                  <span className="h-px w-4 rotate-45 bg-white" />
                  <span className="absolute h-px w-4 -rotate-45 bg-white" />
                </span>
              </button>

              <div id="custom-animation-form-title" className="pr-12">
                <StepHeading
                  title={isSuccess ? "Request Sent." : "Request a Custom Animation."}
                  subtitle={
                    isSuccess
                      ? "We received your request and will get back to you shortly."
                      : "Tell us the interaction, loader, transition, cursor or WebGL detail you want. We'll review it and get back to you."
                  }
                />
              </div>

              {isSuccess ? (
                <p className="font-geist-mono text-sm text-white/50">
                  Closing this window now. The tiny interaction goblin has been notified.
                </p>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <GlobalError message={serverError} />

                  <Field id="custom-animation-name" label="Name" error={errors.name}>
                    <input
                      id="custom-animation-name"
                      name="name"
                      className={FIELD_CLASS}
                      style={AUTOFILL_STYLE}
                      value={values.name}
                      onChange={updateField("name")}
                      autoComplete="name"
                      placeholder="Enter your name"
                      aria-invalid={errors.name ? true : undefined}
                    />
                  </Field>

                  <Field id="custom-animation-email" label="Email" error={errors.email}>
                    <input
                      id="custom-animation-email"
                      name="email"
                      type="email"
                      className={FIELD_CLASS}
                      style={AUTOFILL_STYLE}
                      value={values.email}
                      onChange={updateField("email")}
                      autoComplete="email"
                      placeholder="Enter your email address"
                      aria-invalid={errors.email ? true : undefined}
                    />
                  </Field>

                  <Field id="custom-animation-number" label="Phone number" error={errors.number}>
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
                      className="h-12.5! rounded-none! border-white/10! bg-white/5! text-white"
                      style={AUTOFILL_STYLE}
                      countryButtonClassName="text-white/80 hover:text-white"
                      flagClassName="text-base"
                      dialCodeClassName="text-white"
                      chevronClassName="text-white/60"
                      dividerClassName="bg-white/10"
                      // PhoneInput's own <input> is rounded (it's built as a pill); squared
                      // here so the autofill fill doesn't poke rounded corners out.
                      inputClassName="rounded-none! text-base! text-white placeholder:text-base! placeholder:text-white/30"
                      dropdownClassName="rounded-none! min-w-64 border-white/10! bg-background! text-white shadow-float"
                      optionClassName="rounded-none! text-white/70 hover:bg-white/10 hover:text-white"
                      activeOptionClassName="text-primary"
                      optionDialClassName="text-white/40"
                    />
                  </Field>

                  <Field id="custom-animation-message" label="Message" error={errors.message}>
                    <textarea
                      id="custom-animation-message"
                      name="message"
                      rows={5}
                      className={`${FIELD_CLASS} block min-h-32 resize-y`}
                      style={AUTOFILL_STYLE}
                      value={values.message}
                      onChange={updateField("message")}
                      placeholder="Tell us what you want to build..."
                      aria-invalid={errors.message ? true : undefined}
                    />
                  </Field>

                  <div className="mb-6">
                    <Turnstile
                      action="custom_animation_form"
                      checked={captchaVerified}
                      onChange={(verified, token) => {
                        setCaptchaVerified(verified);
                        setCaptchaToken(token);
                        if (verified) setCaptchaError("");
                      }}
                    />
                    {captchaError && <p className="mt-2 text-sm text-red-400">{captchaError}</p>}
                  </div>

                  {/* Same submit control as the sign-in page: Button + a hidden real
                      submit button so Enter in a field still submits. */}
                  <SubmitButton id="custom-animation-form-modal-send-request" loading={isSubmitting} formRef={formRef} className="w-fit">
                    Send Request
                  </SubmitButton>
                </form>
              )}
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