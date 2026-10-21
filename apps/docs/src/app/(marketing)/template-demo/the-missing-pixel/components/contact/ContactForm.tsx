// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState, type SyntheticEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import {
  ChoiceGroup,
  FloatCheckbox,
  FloatInput,
  FloatSelect,
  FloatTextarea,
} from "../effects/animated-form";

gsap.registerPlugin(useGSAP);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STUDIOS = ["No preference", "Delhi", "London", "Dubai", "New York"];
const SERVICES = ["Strategy", "Identity", "Website", "Motion", "Packaging", "Campaign", "Not sure yet"];
const BUDGETS = ["Under $15k", "$15k to $30k", "$30k to $60k", "$60k+"];

const MESSAGES = {
  name: "Enter your name so we know who to reply to.",
  email: "Enter a valid email address, like name@company.com.",
  message: "Tell us a little about the project. A few lines is enough.",
  consent: "Tick the box so we can store your details and reply.",
};

type Values = {
  name: string;
  email: string;
  company: string;
  studio: string;
  services: string[];
  budget: string[];
  message: string;
  consent: boolean;
};

type Errors = Partial<Record<"name" | "email" | "message" | "consent", string>>;

const EMPTY: Values = {
  name: "",
  email: "",
  company: "",
  studio: "",
  services: [],
  budget: [],
  message: "",
  consent: false,
};

const check = (key: keyof Errors, values: Values): string | undefined => {
  if (key === "consent") return values.consent ? undefined : MESSAGES.consent;
  if (key === "email") return EMAIL_PATTERN.test(values.email.trim()) ? undefined : MESSAGES.email;
  return values[key].trim().length > 1 ? undefined : MESSAGES[key];
};

const ContactForm = () => {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (key: keyof Errors) => {
    setErrors((current) => ({ ...current, [key]: check(key, values) }));
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keys: (keyof Errors)[] = ["name", "email", "message", "consent"];
    const next: Errors = {};
    keys.forEach((key) => {
      next[key] = check(key, values);
    });
    setErrors(next);
    const firstInvalid = keys.find((key) => next[key]);
    if (firstInvalid) {
      const id = `f-${firstInvalid}`;
      formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus();
      return;
    }
    setSent(true);
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setSent(false);
  };

  useGSAP(
    () => {
      if (!sent || !successRef.current) return;
      successRef.current.focus();
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    },
    { dependencies: [sent] },
  );

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 bg-white px-[3.9vw] py-[3.9vw] outline-none max-lg:px-[5vw] max-lg:py-[5vw] max-md:px-[8vw] max-md:py-[8vw]"
      >
        <h2>Got it.</h2>
        <p className="text-28 text-mpx-muted">
          A partner will read this properly and reply within two working days. Probably sooner.
        </p>
        <PixelButton label="Send Another" variant="outline" onClick={reset} />
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-describedby="form-note" className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-8">
        <FloatInput
          id="f-name"
          name="name"
          label="Your name *"
          autoComplete="name"
          required
          value={values.name}
          error={errors.name}
          onChange={(value) => set("name", value)}
          onBlur={() => values.name && validate("name")}
        />
        <FloatInput
          id="f-email"
          name="email"
          type="email"
          label="Work email *"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          onChange={(value) => set("email", value)}
          onBlur={() => values.email && validate("email")}
        />
      </div>
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-8">
        <FloatInput
          id="f-company"
          name="company"
          label="Company"
          autoComplete="organization"
          value={values.company}
          onChange={(value) => set("company", value)}
        />
        <FloatSelect
          id="f-studio"
          label="Nearest studio"
          options={STUDIOS}
          value={values.studio}
          onChange={(value) => set("studio", value)}
        />
      </div>
      <ChoiceGroup
        legend="What do you need?"
        name="services"
        options={SERVICES}
        values={values.services}
        multiple
        onChange={(next) => set("services", next)}
      />
      <ChoiceGroup
        legend="Budget"
        name="budget"
        options={BUDGETS}
        values={values.budget}
        onChange={(next) => set("budget", next)}
      />
      <FloatTextarea
        id="f-message"
        name="message"
        label="What are you making? *"
        required
        value={values.message}
        error={errors.message}
        onChange={(value) => set("message", value)}
        onBlur={() => values.message && validate("message")}
      />
      <FloatCheckbox
        id="f-consent"
        checked={values.consent}
        error={errors.consent}
        onChange={(checked) => set("consent", checked)}
        label={
          <>
            Store my details so you can reply. We never share them.{" "}
            <a href="#" className="underline underline-offset-4">
              Privacy policy
            </a>
          </>
        }
      />
      <div className="flex flex-col gap-6">
        <div className="h-px w-full bg-black/10" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <p id="form-note" className="text-14 text-mpx-muted">
            Fields marked * are required.
          </p>
          <PixelButton label="Send It" type="submit" icon />
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
