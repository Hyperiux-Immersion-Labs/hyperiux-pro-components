// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client';
import React, { forwardRef, type ChangeEvent, type ComponentPropsWithoutRef, type CSSProperties, type FormEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { type ZodType, z } from "zod";
import { usePrefersReducedMotion } from "@/lib/motion";

// ---- motion.tsx ----

export type ErrorAnimation = "slide" | "fade" | "none";

/**
 * The error line under a field. It slides open (or fades) when an error appears and closes the
 * same way, keeping the last message on screen while it goes so the text never vanishes first.
 */
function FieldError({ id, error, className = "" }: { id?: string; error?: string; className?: string }) {
  const [shown, setShown] = useState(error);
  if (error && error !== shown) setShown(error);
  return (
    <div data-form-error={error ? "open" : "closed"} aria-hidden={error ? undefined : true}>
      <div className="min-h-0 overflow-hidden">
        {shown && (
          <p id={`${id}-error`} className={`pt-1 text-xs text-red-500 ${className}`}>
            {shown}
          </p>
        )}
      </div>
    </div>
  );
}

/** A tick that draws itself in once the field's value is valid, and fades out when it isn't. */
function SuccessTick({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      data-form-tick={on ? "on" : "off"}
      viewBox="0 0 24 24"
      fill="none"
      className={`pointer-events-none size-4 shrink-0 ${className}`}
    >
      <path d="M4 12.5 9.5 18 20 6.5" pathLength={1} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Input.tsx ----

export type InputProps = {
  id?: string;
  label?: ReactNode;
  type?: string;
  error?: string;
  className?: string;
  /** Valid value: shows the success tick. Leave undefined to never show it. */
  valid?: boolean;
  /** Shows "used / maxLength" at the end of the field. Needs maxLength. */
  showCounter?: boolean;
} & Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'type'>;

const Input = forwardRef<HTMLInputElement, InputProps>(
 function Input(
 { id, label, placeholder, type ="text", error, className ="", valid, showCounter = false, ...rest },
 ref
) {
 return (
 <div className="w-full">
 <style>{`
 input:-webkit-autofill,
 input:-webkit-autofill:hover,
 input:-webkit-autofill:focus,
 input:-webkit-autofill:active {
   -webkit-text-fill-color: #1f2937;
   caret-color: #1f2937;
   box-shadow: 0 0 0 1000px #ffffff inset !important;
   transition: background-color 9999s ease-in-out 0s;
 }
 `}</style>
 <div className="group relative w-full">
 {label && (
 <label
 htmlFor={id}
 className="
 origin-start text-gray-400
 group-focus-within:text-gray-700
 has-[+input:not(:placeholder-shown)]:text-gray-700
 absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm
 transition-all duration-200 ease-out z-10
 group-focus-within:pointer-events-none
 group-focus-within:top-0
 group-focus-within:-translate-y-1/2
 group-focus-within:cursor-default
 group-focus-within:text-xs
 group-focus-within:font-medium
 has-[+input:not(:placeholder-shown)]:pointer-events-none
 has-[+input:not(:placeholder-shown)]:top-0
 has-[+input:not(:placeholder-shown)]:-translate-y-1/2
 has-[+input:not(:placeholder-shown)]:cursor-default
 has-[+input:not(:placeholder-shown)]:text-xs
 has-[+input:not(:placeholder-shown)]:font-medium
 ml-4
"
 >
 <span className="bg-white text-gray-700 inline-flex px-1 text-sm">
 {label}
 </span>
 </label>
 )}
 <input
 ref={ref}
 id={id}
 type={type}
 placeholder={placeholder ?? " "}
 className={`
 w-full border rounded-full bg-white
 h-14 pl-5 ${
 showCounter && rest.maxLength
 ? valid === undefined ? "pr-20" : "pr-28"
 : valid === undefined ? "pr-4" : "pr-11"
 } text-sm text-gray-800
 outline-none transition-all
 border-gray-200
 focus:border-gray-400
 ${error ?"border-red-400 focus:border-red-400" :""}
 ${className}
 `}
 aria-invalid={error ? true : undefined}
 aria-describedby={error ? `${id}-error` : undefined}
 {...rest}
 />
 {/* Tick first, then the counter at the very end of the field. */}
 {(valid !== undefined || (showCounter && rest.maxLength)) && (
 <span className="pointer-events-none absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-2">
 {valid !== undefined && <SuccessTick on={valid} />}
 {showCounter && rest.maxLength ? (
 <span
 data-form-counter={String(rest.value ?? "").length >= rest.maxLength * 0.9 ? "near" : undefined}
 className="text-xs tabular-nums text-gray-400"
 >
 {String(rest.value ?? "").length}/{rest.maxLength}
 </span>
 ) : null}
 </span>
 )}
 </div>
 <FieldError id={id} error={error} className="ml-4" />
 </div>
 );
})
;


// ---- Textarea.tsx ----

export type TextareaProps = {
  id?: string;
  label?: ReactNode;
  error?: string;
  rows?: number;
  className?: string;
  valid?: boolean;
  /** Shows "used / maxLength" in the corner. Needs maxLength. */
  showCounter?: boolean;
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'id' | 'rows'>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
 function Textarea(
 { id, label, error, rows = 5, className ="", valid, showCounter = false, ...rest },
 ref
) {
 return (
 <div className="w-full">
 <div className="group relative w-full">
 {label && (
 <label
 htmlFor={id}
 className="
 origin-start text-gray-400
 group-focus-within:text-gray-700
 has-[+textarea:not(:placeholder-shown)]:text-gray-700
 absolute top-0 block translate-y-4 cursor-text px-2 text-sm
 transition-all z-5 ml-3
 group-focus-within:pointer-events-none
 group-focus-within:-translate-y-1/2
 group-focus-within:cursor-default
 group-focus-within:text-xs
 group-focus-within:font-medium
 has-[+textarea:not(:placeholder-shown)]:pointer-events-none
 has-[+textarea:not(:placeholder-shown)]:-translate-y-1/2
 has-[+textarea:not(:placeholder-shown)]:cursor-default
 has-[+textarea:not(:placeholder-shown)]:text-xs
 has-[+textarea:not(:placeholder-shown)]:font-medium
"
 >
 <span className="bg-white text-gray-700 inline-flex px-1 text-sm">
 {label}
 </span>
 </label>
 )}
 <textarea
 ref={ref}
 id={id}
 rows={rows}
 placeholder=""
 className={`
 w-full border rounded-2xl bg-white
 pt-5 ${showCounter && rest.maxLength ? "pb-9" : "pb-4"} pl-5 ${valid === undefined ? "pr-4" : "pr-11"} text-sm text-gray-800
 outline-none transition-all resize-none
 border-gray-200
 focus:border-gray-400
 ${error ?"border-red-400 focus:border-red-400" :""}
 ${className}
 `}
 aria-invalid={error ? true : undefined}
 aria-describedby={error ? `${id}-error` : undefined}
 {...rest}
 />
 {valid !== undefined && (
 <SuccessTick on={valid} className="absolute right-5 top-5" />
 )}
 {showCounter && rest.maxLength ? (
 <span
 data-form-counter={String(rest.value ?? "").length >= rest.maxLength * 0.9 ? "near" : undefined}
 className="pointer-events-none absolute bottom-3 right-5 text-xs tabular-nums text-gray-400"
 >
 {String(rest.value ?? "").length}/{rest.maxLength}
 </span>
 ) : null}
 </div>
 <FieldError id={id} error={error} className="ml-4" />
 </div>
 );
})
;


// ---- Select.tsx ----

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  label?: string;
  options?: SelectOption[];
  error?: string;
  className?: string;
  value?: string;
  onChange?: (event: { target: { value: string, id?: string } }) => void;
  valid?: boolean;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
 function Select(
 { id, label, options = [], error, className ="", valid, ...rest },
 ref
) {
 const [open, setOpen] = useState(false);
 const containerRef = useRef<HTMLDivElement | null>(null);

 const selectedOption = options.find((opt) => opt.value === rest.value);

 // Close on outside click
 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (!containerRef.current?.contains(e.target as Node | null)) {
 setOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSelect = (value: string) => {
 if (rest.onChange) {
 rest.onChange({ target: { value, id } });
 }
 setOpen(false);
 };

 return (
 <div className="w-full" ref={containerRef}>
 <div className="relative w-full">
 {/* Trigger */}
 <button
 type="button"
 id={id}
 ref={ref}
 aria-expanded={open}
 // A button can't carry aria-invalid; the error is announced through aria-describedby
 aria-describedby={error ? `${id}-error` : undefined}
 onClick={() => setOpen((prev) => !prev)}
 className={`
 w-full border rounded-full bg-white
 h-14 pl-5 ${valid === undefined ? "pr-10" : "pr-16"} text-sm text-left
 outline-none transition-all cursor-pointer
 border-gray-200
 focus:border-gray-400
 flex items-center
 ${
 !selectedOption
 ?"text-gray-400"
 :"text-gray-800"
 }
 ${error ?"border-red-400 focus:border-red-400" :""}
 ${className}
 `}
 >
 {selectedOption ? selectedOption.label : label}
 </button>

 {valid !== undefined && (
 <SuccessTick on={valid} className="absolute right-10 top-1/2 -translate-y-1/2" />
 )}

 {/* Chevron */}
 <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 width="16"
 height="16"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 >
 <path d="m6 9 6 6 6-6" />
 </svg>
 </span>

 {/* Fancy Dropdown */}
 <div
 className={`
 absolute z-50 mt-2 w-full
 transition-all duration-200 origin-top
 ${
 open
 ?"opacity-100 scale-100 translate-y-0"
 :"opacity-0 scale-95 -translate-y-2 pointer-events-none"
 }
 `}
 >
 <div data-select-dropdown="" className="bg-white p-1 border border-gray-200 rounded-lg shadow-xl overflow-hidden">
 {options.map((opt) => (
 <button
 key={opt.value}
 type="button"
 onClick={() => handleSelect(opt.value)}
 className={`
 w-full text-left px-5 py-3 text-sm transition-all rounded-lg
 hover:bg-gray-100
 ${
 rest.value === opt.value
 ?"bg-gray-50 text-gray-900 font-medium"
 :"text-gray-700"
 }
 `}
 >
 {opt.label}
 </button>
 ))}
 </div>
 </div>
 </div>

 <FieldError id={id} error={error} className="ml-4" />
 </div>
 );
})
;


// ---- PhoneInput.tsx ----

export const COUNTRY_CODES = [
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "IE", dial: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
];

const joinClasses = (...classes: (string | boolean | undefined | null)[]): string => classes.filter(Boolean).join(" ");

export interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

export type PhoneInputProps = {
  id?: string;
  label?: string | false;
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  countries?: CountryCode[];
  error?: string;
  className?: string;
  wrapperClassName?: string;
  countryButtonClassName?: string;
  flagClassName?: string;
  dialCodeClassName?: string;
  chevronClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  optionFlagClassName?: string;
  optionCodeClassName?: string;
  optionDialClassName?: string;
  dividerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  placeholder?: string;
  showCountryName?: boolean;
  valid?: boolean;
} & Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'value' | 'onChange' | 'placeholder'>;

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
  {
    id = "phone",
    label = "Phone Number*",
    value = "",
    onChange,
    defaultCountry = "IN",
    countries = COUNTRY_CODES,
    error,
    className = "",
    wrapperClassName = "",
    countryButtonClassName = "",
    flagClassName = "",
    dialCodeClassName = "",
    chevronClassName = "",
    dropdownClassName = "",
    optionClassName = "",
    activeOptionClassName = "",
    optionFlagClassName = "",
    optionCodeClassName = "",
    optionDialClassName = "",
    dividerClassName = "",
    inputClassName = "",
    errorClassName = "",
    placeholder,
    showCountryName = false,
    valid,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    return countries.find((country) => country.code === defaultCountry) || countries[0];
  });

  const [open, setOpen] = useState(false);

  const numberPart = value.startsWith(selectedCountry.dial)
    ? value.slice(selectedCountry.dial.length).trim()
    : value;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node | null)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setOpen(false);

    onChange?.(`${country.dial} ${numberPart}`.trim());
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextNumber = event.target.value.replace(/[^\d\s\-()]/g, "");

    onChange?.(`${selectedCountry.dial} ${nextNumber}`.trim());
  };

  return (
    <div ref={rootRef} className={joinClasses("w-full", wrapperClassName)}>
      <div
        data-phone-field=""
        data-invalid={error ? "true" : undefined}
        className={joinClasses(
          "flex h-14 items-center rounded-full border bg-white transition-all",
          "border-gray-200 focus-within:border-gray-400",
          error && "border-red-400 focus-within:border-red-400",
          className
        )}
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={joinClasses(
              "flex h-full cursor-pointer items-center gap-1 pl-4 pr-2 text-sm text-gray-700 transition-colors hover:text-gray-900",
              countryButtonClassName
            )}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className={joinClasses("text-base", flagClassName)}>
              {selectedCountry.flag}
            </span>

            <span className={joinClasses("font-medium", dialCodeClassName)}>
              {selectedCountry.dial}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={joinClasses(
                "transition-transform duration-200",
                open && "rotate-180",
                chevronClassName
              )}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div
              role="listbox"
              data-phone-dropdown=""
              className={joinClasses(
                "absolute left-0 top-full z-50 mt-2 max-h-52 min-w-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg",
                dropdownClassName
              )}
            >
              {countries.map((country) => {
                const isActive = selectedCountry.code === country.code;

                return (
                  <button
                    key={`${country.code}-${country.dial}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleCountrySelect(country)}
                    className={joinClasses(
                      "flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50",
                      optionClassName,
                      isActive && joinClasses("font-medium text-orange-500", activeOptionClassName)
                    )}
                  >
                    <span className={joinClasses("", optionFlagClassName)}>
                      {country.flag}
                    </span>

                    <span className={joinClasses("", optionCodeClassName)}>
                      {showCountryName ? country.name : country.code}
                    </span>

                    <span className={joinClasses("ml-auto text-gray-400", optionDialClassName)}>
                      {country.dial}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span
          className={joinClasses("h-6 w-px shrink-0 bg-gray-200", dividerClassName)}
        />

        <input
          ref={ref}
          id={id}
          data-phone-input=""
          type="tel"
          value={numberPart}
          onChange={handleNumberChange}
          placeholder={placeholder ?? (label === false ? "" : label)}
          autoComplete="tel"
          className={joinClasses(
            "h-full flex-1 rounded-r-full bg-transparent pl-4 pr-5 text-sm text-gray-800 outline-none placeholder:text-gray-400",
            inputClassName
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {valid !== undefined && <SuccessTick on={valid} className="mr-5" />}
      </div>

      <FieldError id={id} error={error} className={joinClasses("ml-4", errorClassName)} />
    </div>
  );
})
;


// ---- Checkbox.tsx ----

export type CheckboxProps = {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  error?: string;
  accentColor?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'onChange'>;

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
 function Checkbox(
 { id, checked, onChange, label, error, accentColor ="bg-orange-500", ...rest },
 ref
) {
 return (
 <div className="w-full">
 <div className="flex items-center gap-3">
 <button
 ref={ref}
 type="button"
 id={id}
 role="checkbox"
 aria-checked={checked}
 onClick={() => onChange && onChange(!checked)}
 className={`
 shrink-0 w-5 h-5 rounded border-2 transition-all duration-200
 flex items-center justify-center cursor-pointer
 ${checked
 ? `${accentColor} border-transparent`
 :"bg-white border-gray-400 hover:border-gray-600"
 }
 `}
 aria-invalid={error ? true : undefined}
 aria-describedby={error ? `${id}-error` : undefined}
 {...rest}
 >
 {checked && (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 12 12"
 fill="none"
 className="w-3 h-3"
 >
 <path
 d="M2 6l3 3 5-5"
 stroke="white"
 strokeWidth="1.8"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 )}
 </button>

 {label && (
 <div className="text-sm text-gray-600 font-light leading-snug select-none">
 {label}
 </div>
 )}
 </div>
 <FieldError id={id} error={error} className="ml-8" />
 </div>
 );
})
;


// ---- Button.tsx ----

export type ButtonProps = {
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type'>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 function Button(
 {
 children,
 type ="button",
 isLoading = false,
 loadingText ="Sending...",
 className ="",
 disabled,
 ...rest
 },
 ref
) {
 return (
 <button
 ref={ref}
 type={type}
 disabled={isLoading || disabled}
 className={`
 relative inline-flex items-center justify-center
 rounded-full cursor-pointer
 bg-black text-white text-sm font-medium
 px-8 py-4 min-w-45
 transition-all duration-300
 hover:scale-[0.97] active:scale-95
 disabled:opacity-70 disabled:cursor-not-allowed
 ${className}
 `}
 {...rest}
 >
 {isLoading ? (
 <span className="flex items-center gap-2">
 <svg
 className="animate-spin w-4 h-4"
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 >
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8v8H4z"
 />
 </svg>
 {loadingText}
 </span>
 ) : (
 children
 )}
 </button>
 );
}
);


// ---- ContactForm.tsx ----
/**
 *
 * fields: FieldConfig[]
 * Array that drives EVERY form field. Each object can be:
 *

 * onSubmit: async (data: Record<string, any>) => void
 * Called with the collected form data when validation passes.
 * Should throw on failure so the form can show the error banner.
 *
 * submitLabel?: string (default"Submit")
 * loadingLabel?: string (default"Sending...")
 * successMessage?: string (default" Form submitted successfully!")
 * errorMessage?: string (default" Error sending message. Please try again.")
 *
 * schema?: ZodType
 * Optional Zod schema for the whole form. When provided it becomes the
 * source of truth for validation and its messages are mapped back onto
 * fields by name (schema key === field.name). The built-in checks below
 * are used only when no schema is supplied.
 *
 * Built-in validation (fallback when no `schema` is passed)
 * - required fields checked automatically
 * - email fields validated with regex
 * - phone fields validated for minimum length
 * - Each field can supply its own `validate(value) => string | undefined`

 */


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FieldConfig {
  type: string;
  name: string;
  label?: ReactNode;
  required?: boolean;
  defaultCountry?: string;
  options?: SelectOption[];
  rows?: number;
  /** Textarea/text limit; with showCounter the textarea shows "used / max". */
  maxLength?: number;
  validate?: (value: any) => string | undefined;
}

function defaultValidate(field: FieldConfig, value: any): string | undefined {
 if (field.required && (value ==="" || value === false || value == null)) {
 return `${typeof field.label ==="string" ? field.label.replace("*","") :"This field"} is required.`;
 }
 if (field.type ==="email" && value && !EMAIL_RE.test(value)) {
 return"Invalid email address.";
 }
 if (field.type ==="phone" && value && value.replace(/\D/g,"").length < 7) {
 return"Invalid phone number.";
 }
 return undefined;
}

function buildInitialValues(fields: FieldConfig[]): Record<string, any> {
 const values: Record<string, any> = {};
 for (const f of fields) {
 if (f.type ==="checkbox") values[f.name] = false;
 else if (f.type ==="select") values[f.name] ="";
 else values[f.name] ="";
 }
 return values;
}

export interface ContactFormProps {
  fields?: FieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  schema?: ZodType<any>;
  submitLabel?: string;
  loadingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  textColor?: string;
  inputBackgroundColor?: string;
  fieldBorderColor?: string;
  inputRoundedness?: number;
  duration?: number;
  /** How an error message enters under its field. */
  errorAnimation?: ErrorAnimation;
  /** Fields with an error give a short shake when Submit is pressed. */
  shakeOnError?: boolean;
  /** A tick draws in inside a field once its value is valid. */
  showSuccessTick?: boolean;
  /** Fields with a maxLength (name, email, message) show a live character count. */
  showCounter?: boolean;
  /** Fields fade up one after another when the form first appears. */
  staggerEntrance?: boolean;
}

// component
function ContactForm({
 fields = [],
 onSubmit,
 schema,
 submitLabel ="Submit",
 loadingLabel ="Sending...",
 successMessage =" Form submitted successfully!",
 errorMessage =" Error sending message. Please try again.",
 textColor ="#111111",
 inputBackgroundColor ="#ffffff",
 fieldBorderColor ="#e5e7eb",
 inputRoundedness = 6,
 duration = 0.3,
 errorAnimation = "slide",
 shakeOnError = true,
 showSuccessTick = true,
 showCounter = true,
 staggerEntrance = true,
}: ContactFormProps) {
 const [values, setValues] = useState(() => buildInitialValues(fields));
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isLoading, setIsLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [failed, setFailed] = useState(false);
 const uid = useId().replace(/:/g, "");
 const sectionId = `contact-form-${uid}`;
 const reduceMotion = usePrefersReducedMotion();
 const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

 // Shakes every field that has an error, a short side-to-side nudge.
 const shake = useCallback((names: string[]) => {
 if (!shakeOnError || reduceMotion) return;
 for (const name of names) {
 fieldRefs.current[name]?.animate(
 [
 { transform: "translateX(0)" },
 { transform: "translateX(-6px)" },
 { transform: "translateX(5px)" },
 { transform: "translateX(-3px)" },
 { transform: "translateX(2px)" },
 { transform: "translateX(0)" },
 ],
 { duration: 420, easing: "ease-out" }
 );
 }
 }, [shakeOnError, reduceMotion]);

 // ── value helpers ──
 const setValue = useCallback((name: string, value: any) => {
 setValues((prev) => ({ ...prev, [name]: value }));
 }, []);

 const clearError = useCallback((name: string) => {
 setErrors((prev) => {
 if (!prev[name]) return prev;
 const next = { ...prev };
 delete next[name];
 return next;
 });
 }, []);

 // ── per-field validation ──
 const validateField = useCallback(
 (field: FieldConfig, value: any) => {
 // Run built-in checks first
 const builtIn = defaultValidate(field, value);
 if (builtIn) return builtIn;
 // Then custom validator
 if (field.validate) return field.validate(value);
 return undefined;
 },
 []
 );

 // ── full-form validation ──
 // Returns { valid, data } where `data` is Zod's parsed (coerced/trimmed)
 // output when a schema is used, or the raw values otherwise.
 const validateAll = useCallback(() => {
 const newErrors: Record<string, string> = {};

 if (schema) {
 // Zod is the source of truth: map the first issue per field by name.
 const result = schema.safeParse(values);
 if (result.success) {
 setErrors(newErrors);
 return { valid: true, data: result.data };
 }
 for (const issue of result.error.issues) {
 const key = issue.path[0] as string | number | undefined;
 if (key != null && !newErrors[key]) newErrors[key] = issue.message;
 }
 } else {
 for (const f of fields) {
 const err = validateField(f, values[f.name]);
 if (err) newErrors[f.name] = err;
 }
 }

 setErrors(newErrors);
 shake(Object.keys(newErrors));
 return { valid: Object.keys(newErrors).length === 0, data: values };
 }, [fields, values, validateField, schema, shake]);

 // ── submit ──
 const handleSubmit = useCallback(
 async (e: FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const { valid, data } = validateAll();
 if (!valid) return;

 setIsLoading(true);
 setFailed(false);

 try {
 await onSubmit(data);
 setSubmitted(true);
 setValues(buildInitialValues(fields));
 setTimeout(() => setSubmitted(false), 7000);
 } catch {
 setFailed(true);
 setTimeout(() => setFailed(false), 7000);
 } finally {
 setIsLoading(false);
 }
 },
 [fields, validateAll, onSubmit]
 );

 // ── live validity, for the success tick ──
 const liveIssues: Record<string, boolean> = {};
 if (showSuccessTick) {
 if (schema) {
 const result = schema.safeParse(values);
 if (!result.success) for (const issue of result.error.issues) liveIssues[String(issue.path[0])] = true;
 } else {
 for (const f of fields) if (validateField(f, values[f.name])) liveIssues[f.name] = true;
 }
 }
 const tickFor = (name: string, value: any) => {
 if (!showSuccessTick) return undefined;
 // Phone values carry the dial code, so only the typed number counts as "filled".
 const filled = typeof value === "string" ? value.replace(/^\+\d+\s*/, "").trim() !== "" : !!value;
 return filled && !liveIssues[name];
 };

 // ── render field ──
 const renderField = (field: FieldConfig) => {
 const { name, type, label, options, rows, defaultCountry, maxLength } = field;
 const value = values[name];
 const error = errors[name];
 const valid = tickFor(name, value);

 const commonChange = (val: any) => {
 setValue(name, val);
 clearError(name);
 };

 switch (type) {
 case"textarea":
 return (
 <Textarea
 key={name}
 id={name}
 label={label}
 rows={rows}
 maxLength={maxLength}
 showCounter={showCounter}
 valid={valid}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );

 case"select":
 return (
 <Select
 key={name}
 id={name}
 label={label as string | undefined}
 options={options || []}
 valid={valid}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );

 case"phone":
 return (
 <PhoneInput
 key={name}
 id={name}
 label={label as string | false | undefined}
 value={value}
 onChange={(val) => commonChange(val)}
 defaultCountry={defaultCountry ||"IN"}
 valid={valid}
 error={error}
 />
 );

 case"checkbox":
 return (
 <Checkbox
 key={name}
 id={name}
 label={label}
 checked={!!value}
 onChange={(checked) => commonChange(checked)}
 error={error}
 />
 );

 // text | email | url | number | password |
 default:
 return (
 <Input
 key={name}
 id={name}
 label={label}
 type={type ||"text"}
 maxLength={maxLength}
 showCounter={showCounter}
 valid={valid}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );
 }
 };

 return (
 <section
 className="h-full w-full"
 id={sectionId}
 data-error-animation={errorAnimation}
 style={{
 "--form-text": textColor,
 "--form-input-bg": inputBackgroundColor,
 "--form-field-border": fieldBorderColor,
 "--form-input-radius": `${Math.max(0, Number(inputRoundedness) || 0)}px`,
 "--form-duration": `${Math.max(0.05, Number(duration) || 0.3)}s`,
 "--form-success": "#16a34a",
 } as CSSProperties & Record<`--${string}`, string>}
 >
 <style>{`
 #${sectionId} input:not([data-phone-input]),
 #${sectionId} textarea,
 #${sectionId} select,
 #${sectionId} [role="button"][aria-invalid],
 #${sectionId} button[id] {
   background-color: var(--form-input-bg);
   border-color: var(--form-field-border);
   border-radius: var(--form-input-radius);
   color: var(--form-text);
   transition-duration: var(--form-duration);
 }
 #${sectionId} [data-phone-field] {
   background-color: var(--form-input-bg);
   border-color: var(--form-field-border);
   border-radius: var(--form-input-radius);
   color: var(--form-text);
   transition-duration: var(--form-duration);
 }
 #${sectionId} [data-phone-field] [data-phone-input] {
   background-color: transparent;
   color: var(--form-text);
 }
 #${sectionId} [data-phone-field] [data-phone-input]::placeholder {
   color: var(--form-text);
   opacity: 1;
 }
 #${sectionId} [data-phone-dropdown],
 #${sectionId} [data-select-dropdown] {
   border-radius: var(--form-input-radius);
 }
 #${sectionId} [data-select-dropdown] > button {
   border-radius: max(0px, calc(var(--form-input-radius) - 4px));
 }
 #${sectionId} [data-phone-field] > span {
   background-color: var(--form-field-border);
 }
 #${sectionId} [data-phone-field]:focus-within {
   border-color: var(--form-text);
 }
 #${sectionId} [data-phone-field][data-invalid="true"] {
   border-color: #f87171;
 }
 #${sectionId} input:focus,
 #${sectionId} textarea:focus,
 #${sectionId} button[id]:focus,
 #${sectionId} .group:focus-within input,
 #${sectionId} .group:focus-within textarea {
   border-color: var(--form-text);
 }
 #${sectionId} label span,
 #${sectionId} .text-gray-700,
 #${sectionId} .text-gray-600 {
   color: var(--form-text);
 }
 #${sectionId} label span {
   background-color: var(--form-input-bg);
 }
 #${sectionId} button[type="submit"] {
   background-color: #111111;
   border-radius: var(--form-input-radius);
   color: #ffffff;
   transition-duration: var(--form-duration);
 }
 #${sectionId} [role="checkbox"][aria-checked="true"] {
   background-color: var(--form-text);
   border-color: var(--form-text);
 }

 /* Error line: slides open (height + lift), fades, or appears at once. */
 #${sectionId} [data-form-error] {
   display: grid;
   grid-template-rows: 0fr;
   opacity: 0;
   transform: translateY(-4px);
   transition: grid-template-rows var(--form-duration) cubic-bezier(0.22, 1, 0.36, 1),
     opacity var(--form-duration) ease, transform var(--form-duration) cubic-bezier(0.22, 1, 0.36, 1);
 }
 #${sectionId} [data-form-error="open"] {
   grid-template-rows: 1fr;
   opacity: 1;
   transform: none;
 }
 #${sectionId}[data-error-animation="fade"] [data-form-error] {
   transform: none;
   transition: opacity var(--form-duration) ease, grid-template-rows 0s linear var(--form-duration);
 }
 #${sectionId}[data-error-animation="fade"] [data-form-error="open"] {
   transition: opacity var(--form-duration) ease, grid-template-rows 0s;
 }
 #${sectionId}[data-error-animation="none"] [data-form-error] {
   transition: none;
 }

 /* Success tick draws in along its path. */
 #${sectionId} [data-form-tick] {
   color: var(--form-success);
   opacity: 0;
   transition: opacity calc(var(--form-duration) * 0.6) ease;
 }
 #${sectionId} [data-form-tick] path {
   stroke-dasharray: 1;
   stroke-dashoffset: 1;
   transition: stroke-dashoffset calc(var(--form-duration) * 1.4) cubic-bezier(0.65, 0, 0.35, 1);
 }
 #${sectionId} [data-form-tick="on"] {
   opacity: 1;
 }
 #${sectionId} [data-form-tick="on"] path {
   stroke-dashoffset: 0;
 }

 /* Counter warms up near the limit. */
 #${sectionId} [data-form-counter] {
   transition: color var(--form-duration) ease;
 }
 #${sectionId} [data-form-counter="near"] {
   color: #d97706;
 }

 /* Fields fade up one after another; status messages rise in. */
 @keyframes ${sectionId}-enter {
   from { opacity: 0; transform: translateY(12px); }
 }
 #${sectionId} [data-form-enter] {
   animation: ${sectionId}-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
 }
 #${sectionId} [data-form-status] {
   animation: ${sectionId}-enter calc(var(--form-duration) * 1.5) cubic-bezier(0.22, 1, 0.36, 1) backwards;
 }

 @media (prefers-reduced-motion: reduce) {
   #${sectionId} [data-form-error],
   #${sectionId} [data-form-tick],
   #${sectionId} [data-form-tick] path,
   #${sectionId} [data-form-counter] {
     transition: none;
   }
   #${sectionId} [data-form-enter],
   #${sectionId} [data-form-status] {
     animation: none;
   }
 }
 `}</style>
 <div className="w-full h-full">
 <div className="w-full flex flex-col gap-[2vw]">
 <form
 autoComplete="off"
 className="space-y-[1.2vw] max-md:space-y-[4vw] max-lg:space-y-[4vw]"
 onSubmit={handleSubmit}
 >
 {fields.map((field, index) => (
 <div
 key={field.name}
 ref={(node) => {
 fieldRefs.current[field.name] = node;
 }}
 data-form-enter={staggerEntrance ? "" : undefined}
 style={staggerEntrance ? { animationDelay: `${index * 70}ms` } : undefined}
 >
 {renderField(field)}
 </div>
 ))}

 <div
 className="flex items-center justify-start  max-md:mt-[10vw]"
 data-form-enter={staggerEntrance ? "" : undefined}
 style={staggerEntrance ? { animationDelay: `${fields.length * 70}ms` } : undefined}
 >
 <Button
 type="submit"
 isLoading={isLoading}
 loadingText={loadingLabel}
 className="mt-[3vw]  max-md:mt-0 max-lg:mt-[3vw]"
 >
 {submitLabel}
 </Button>
 </div>

 {submitted && (
 <p data-form-status="" role="status" className="text-green-600 text-sm mt-2">{successMessage}</p>
 )}
 {failed && (
 <p data-form-status="" role="alert" className="text-red-600 text-sm mt-2">{errorMessage}</p>
 )}
 </form>
 </div>
 </div>
 </section>
 );
}


// ---- index.tsx ----
// Built using Hyperiux Vault: https://vault.hyperiux.com

const FIELDS: FieldConfig[] = [
 { type:"text", name:"name", label:"Name*", required: true, maxLength: 60 },
 { type:"email", name:"email", label:"Business Email*", required: true, maxLength: 100 },
 { type:"phone", name:"phone", label:"Phone*", required: true, defaultCountry:"IN" },
 {
 type:"select",
 name:"topic",
 label:"Topic*",
 required: true,
 options: [
 { value:"general", label:"General Inquiry" },
 { value:"partnership", label:"Partnership" },
 ],
 },
 { type:"textarea", name:"message", label:"Your message", rows: 4, maxLength: 500 },
 {
 type:"checkbox",
 name:"terms",
 required: true,
 label: <>I agree to the <a href="#" className="underline">Terms</a>.</>,
 },
];

// Phone values are stored as "+<dial> <number>" (e.g. "+91 9876543210").
// Strip the leading dial code so we count only the national number's digits.
const nationalDigits = (val: string): string => val.replace(/^\+\d+\s*/, "").replace(/\D/g, "");

// Valid national-number digit ranges per dial code (E.164, trunk prefix
// excluded). A single "exactly 10" rule rejects every valid number from
// Ireland, Australia, France, the UAE and Singapore.
const NATIONAL_LENGTH_BY_DIAL: Record<string, [number, number]> = {
 "+91": [10, 10], // India
 "+353": [7, 9], // Ireland
 "+1": [10, 10], // US / Canada
 "+44": [9, 10], // United Kingdom
 "+61": [9, 9], // Australia
 "+49": [7, 11], // Germany
 "+33": [9, 9], // France
 "+971": [8, 9], // United Arab Emirates
 "+65": [8, 8], // Singapore
};

// Countries where people habitually type the leading trunk "0"
// (e.g. UK 07123 456789) - drop it before checking the length.
const TRUNK_ZERO_DIALS = new Set(["+44", "+353", "+61", "+49", "+33", "+971"]);

const isValidPhone = (val: string): boolean => {
 const dial = val.match(/^(\+\d+)\s/)?.[1];
 let digits = nationalDigits(val);

 if (dial && TRUNK_ZERO_DIALS.has(dial) && digits.startsWith("0")) {
 digits = digits.slice(1);
 }

 // Unknown dial code (custom countries prop): fall back to E.164 bounds.
 const [min, max] = NATIONAL_LENGTH_BY_DIAL[dial ?? ""] ?? [6, 14];
 return digits.length >= min && digits.length <= max;
};

const contactSchema = z.object({
 name: z
 .string()
 .trim()
 .min(1, "Name is required.")
 .min(2, "Name must be at least 2 characters.")
 .max(60, "Name is too long."),
 email: z
 .string()
 .trim()
 .min(1, "Business Email is required.")
 .max(100, "Email is too long.")
 .pipe(z.email("Please enter a valid email address.")),
 phone: z
 .string()
 .trim()
 .min(1, "Phone is required.")
 .refine(isValidPhone, {
 message: "Please enter a valid phone number for the selected country.",
 }),
 topic: z.enum(["general", "partnership"], {
 message: "Please select a topic.",
 }),
 message: z.string().trim().max(500, "Message is too long.").optional(),
 terms: z.literal(true, {
 message: "You must agree to the Terms.",
 }),
});

async function submitHandler(data: Record<string, any>) {
 console.log("Contact form submitted:", data);
}

export default function AnimatedForm({
 backgroundColor = "#ffffff",
 textColor = "#111111",
 inputBackgroundColor = "#ffffff",
 fieldBorderColor = "#e5e7eb",
 inputRoundedness = 6,
 duration = 0.3,
 errorAnimation = "slide",
 shakeOnError = true,
 showSuccessTick = true,
 showCounter = true,
 staggerEntrance = true,
}: {
 backgroundColor?: string;
 textColor?: string;
 inputBackgroundColor?: string;
 fieldBorderColor?: string;
 inputRoundedness?: number;
 duration?: number;
 errorAnimation?: ErrorAnimation;
 shakeOnError?: boolean;
 showSuccessTick?: boolean;
 showCounter?: boolean;
 staggerEntrance?: boolean;
}) {
 return (
 <main className="w-full min-h-screen mx-auto py-20 max-lg:pt-28 px-6" style={{ backgroundColor }}>
  <div className="w-[50%] max-lg:w-[90%] max-md:w-[95%] mx-auto">  <h1 className="text-3xl mb-8" style={{ color: textColor }}>Get in touch</h1>
 <ContactForm
 fields={FIELDS}
 schema={contactSchema}
 onSubmit={submitHandler}
 submitLabel="Send Message"
 textColor={textColor}
 inputBackgroundColor={inputBackgroundColor}
 fieldBorderColor={fieldBorderColor}
 inputRoundedness={inputRoundedness}
 duration={duration}
 errorAnimation={errorAnimation}
 shakeOnError={shakeOnError}
 showSuccessTick={showSuccessTick}
 showCounter={showCounter}
 staggerEntrance={staggerEntrance}
 />
 </div>
 </main>
 );
}

export { Button, Checkbox, ContactForm, Input, PhoneInput, Select, Textarea };
