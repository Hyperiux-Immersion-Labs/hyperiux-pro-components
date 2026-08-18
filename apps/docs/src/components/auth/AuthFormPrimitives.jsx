"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";

// Shared building blocks for the custom Clerk auth flows (SignInFlow,
// SignUpFlow) - both step through Clerk's low-level useSignIn()/useSignUp()
// resources with the same split-panel layout, so the visual pieces (and the
// requestSubmit()-via-ButtonV3 wiring) live here once instead of being
// duplicated per flow.

export function errorMessage(err, fallback) {
  return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || fallback;
}

export function StepHeading({ title, subtitle }) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-[3.4vw] font-semibold text-white">{title}</h1>
      {subtitle && <p className="text-[1.1vw] text-white">{subtitle}</p>}
    </div>
  );
}

export function TextField({ id, label, type = "text", value, onChange, placeholder, autoComplete }) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-5 space-y-2">
      <label htmlFor={id} className="block text-[1vw] font-geist-mono font-medium tracking-wide text-white/80">
        {label}
      </label>
      <div className="group relative w-full h-fit">
        <input
          id={id}
          name={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full border border-white/10 bg-white/5 py-3 text-[1vw]! text-white placeholder:text-white/30 outline-none transition ${
            isPassword ? "pl-4 pr-12" : "px-4"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-[1vw] w-[1vw] min-h-4 min-w-4" /> : <Eye className="h-[1vw] w-[1vw] min-h-4 min-w-4" />}
          </button>
        )}
        <span className="pointer-events-none max-sm:hidden absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-primary opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 max-md:h-3 max-md:w-3 focus-frame" />
        <span className="pointer-events-none max-sm:hidden absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-primary opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 max-md:h-3 max-md:w-3" />
        <span className="pointer-events-none max-sm:hidden absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-primary opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 max-md:h-3 max-md:w-3" />
        <span className="pointer-events-none max-sm:hidden absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-primary opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 max-md:h-3 max-md:w-3" />
      </div>
    </div>
  );
}

export function GlobalError({ message }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}

// ButtonV3 renders a <Link>, not a <button type="submit">, so a click on it
// can't trigger native form submission on its own - requestSubmit() on the
// owning form reuses the exact same submit event (and required-field
// validation) a native type="submit" button relied on.
export function SubmitButton({ loading, formRef, children, className }) {
  return (
    <ButtonV3
      href="#"
      preventDefault
      disabled={loading}
      onClick={() => formRef.current?.requestSubmit()}
      className={className || "w-full justify-center"}
    >
      {loading ? "Please wait…" : children}
    </ButtonV3>
  );
}

export function SecondaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-white/50 transition hover:text-[#ff5f00] duration-300 ease-in-out "
    >
      {children}
    </button>
  );
}
