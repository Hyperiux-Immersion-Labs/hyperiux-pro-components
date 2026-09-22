// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client';
import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
const Input = forwardRef(function Input({ id, label, placeholder, type = "text", error, className = "", ...rest }, ref) {
    return (<div className="w-full">
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
 {label && (<label htmlFor={id} className="
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
">
 <span className="bg-white text-gray-700 inline-flex px-1 text-sm">
 {label}
 </span>
 </label>)}
 <input ref={ref} id={id} type={type} placeholder={placeholder ?? " "} className={`
 w-full border rounded-full bg-white
 h-14 pl-5 pr-4 text-sm text-gray-800
 outline-none transition-all
 border-gray-200
 focus:border-gray-400
 ${error ? "border-red-400 focus:border-red-400" : ""}
 ${className}
 `} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest}/>
 </div>
 {error && (<p id={`${id}-error`} className="mt-1 ml-4 text-xs text-red-500">{error}</p>)}
 </div>);
});
const Textarea = forwardRef(function Textarea({ id, label, error, rows = 5, className = "", ...rest }, ref) {
    return (<div className="w-full">
 <div className="group relative w-full">
 {label && (<label htmlFor={id} className="
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
">
 <span className="bg-white text-gray-700 inline-flex px-1 text-sm">
 {label}
 </span>
 </label>)}
 <textarea ref={ref} id={id} rows={rows} placeholder="" className={`
 w-full border rounded-2xl bg-white
 pt-5 pb-4 pl-5 pr-4 text-sm text-gray-800
 outline-none transition-all resize-none
 border-gray-200
 focus:border-gray-400
 ${error ? "border-red-400 focus:border-red-400" : ""}
 ${className}
 `} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest}/>
 </div>
 {error && (<p id={`${id}-error`} className="mt-1 ml-4 text-xs text-red-500">{error}</p>)}
 </div>);
});
const Select = forwardRef(function Select({ id, label, options = [], error, className = "", ...rest }, ref) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const selectedOption = options.find((opt) => opt.value === rest.value);
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!containerRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelect = (value) => {
        if (rest.onChange) {
            rest.onChange({ target: { value, id } });
        }
        setOpen(false);
    };
    return (<div className="w-full" ref={containerRef}>
 <div className="relative w-full">
 {/* Trigger */}
 <button type="button" id={id} ref={ref} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} onClick={() => setOpen((prev) => !prev)} className={`
 w-full border rounded-full bg-white
 h-14 pl-5 pr-10 text-sm text-left
 outline-none transition-all cursor-pointer
 border-gray-200
 focus:border-gray-400
 flex items-center
 ${!selectedOption
            ? "text-gray-400"
            : "text-gray-800"}
 ${error ? "border-red-400 focus:border-red-400" : ""}
 ${className}
 `}>
 {selectedOption ? selectedOption.label : label}
 </button>

 {/* Chevron */}
 <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="m6 9 6 6 6-6"/>
 </svg>
 </span>

 {/* Fancy Dropdown */}
 <div className={`
 absolute z-50 mt-2 w-full
 transition-all duration-200 origin-top
 ${open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
 `}>
 <div className="bg-white p-1 border border-gray-200 rounded-lg shadow-xl overflow-hidden">
 {options.map((opt) => (<button key={opt.value} type="button" onClick={() => handleSelect(opt.value)} className={`
 w-full text-left px-5 py-3 text-sm transition-all rounded-lg
 hover:bg-gray-100
 ${rest.value === opt.value
                ? "bg-gray-50 text-gray-900 font-medium"
                : "text-gray-700"}
 `}>
 {opt.label}
 </button>))}
 </div>
 </div>
 </div>

 {error && (<p id={`${id}-error`} className="mt-1 ml-4 text-xs text-red-500">{error}</p>)}
 </div>);
});
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
const joinClasses = (...classes) => classes.filter(Boolean).join(" ");
const PhoneInput = forwardRef(function PhoneInput({ id = "phone", label = "Phone Number*", value = "", onChange, defaultCountry = "IN", countries = COUNTRY_CODES, error, className = "", wrapperClassName = "", countryButtonClassName = "", flagClassName = "", dialCodeClassName = "", chevronClassName = "", dropdownClassName = "", optionClassName = "", activeOptionClassName = "", optionFlagClassName = "", optionCodeClassName = "", optionDialClassName = "", dividerClassName = "", inputClassName = "", errorClassName = "", placeholder, showCountryName = false, ...rest }, ref) {
    const rootRef = useRef(null);
    const [selectedCountry, setSelectedCountry] = useState(() => {
        return countries.find((country) => country.code === defaultCountry) || countries[0];
    });
    const [open, setOpen] = useState(false);
    const numberPart = value.startsWith(selectedCountry.dial)
        ? value.slice(selectedCountry.dial.length).trim()
        : value;
    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!rootRef.current)
                return;
            if (!rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        window.addEventListener("pointerdown", handlePointerDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setOpen(false);
        onChange?.(`${country.dial} ${numberPart}`.trim());
    };
    const handleNumberChange = (event) => {
        const nextNumber = event.target.value.replace(/[^\d\s\-()]/g, "");
        onChange?.(`${selectedCountry.dial} ${nextNumber}`.trim());
    };
    return (<div ref={rootRef} className={joinClasses("w-full", wrapperClassName)}>
      <div className={joinClasses("flex h-14 items-center rounded-full border bg-white transition-all", "border-gray-200 focus-within:border-gray-400", error && "border-red-400 focus-within:border-red-400", className)}>
        <div className="relative shrink-0">
          <button type="button" onClick={() => setOpen((current) => !current)} className={joinClasses("flex h-full cursor-pointer items-center gap-1 pl-4 pr-2 text-sm text-gray-700 transition-colors hover:text-gray-900", countryButtonClassName)} aria-expanded={open} aria-haspopup="listbox">
            <span className={joinClasses("text-base", flagClassName)}>
              {selectedCountry.flag}
            </span>

            <span className={joinClasses("font-medium", dialCodeClassName)}>
              {selectedCountry.dial}
            </span>

            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={joinClasses("transition-transform duration-200", open && "rotate-180", chevronClassName)}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {open && (<div role="listbox" className={joinClasses("absolute left-0 top-full z-50 mt-2 max-h-52 min-w-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg", dropdownClassName)}>
              {countries.map((country) => {
                const isActive = selectedCountry.code === country.code;
                return (<button key={`${country.code}-${country.dial}`} type="button" role="option" aria-selected={isActive} onClick={() => handleCountrySelect(country)} className={joinClasses("flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50", optionClassName, isActive && joinClasses("font-medium text-orange-500", activeOptionClassName))}>
                    <span className={joinClasses("", optionFlagClassName)}>
                      {country.flag}
                    </span>

                    <span className={joinClasses("", optionCodeClassName)}>
                      {showCountryName ? country.name : country.code}
                    </span>

                    <span className={joinClasses("ml-auto text-gray-400", optionDialClassName)}>
                      {country.dial}
                    </span>
                  </button>);
            })}
            </div>)}
        </div>

        <span className={joinClasses("h-6 w-px shrink-0 bg-gray-200", dividerClassName)}/>

        <input ref={ref} id={id} type="tel" value={numberPart} onChange={handleNumberChange} placeholder={placeholder ?? (label === false ? "" : label)} autoComplete="tel" className={joinClasses("h-full flex-1 rounded-r-full bg-transparent pl-4 pr-5 text-sm text-gray-800 outline-none placeholder:text-gray-400", inputClassName)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest}/>
      </div>

      {error && (<p id={`${id}-error`} className={joinClasses("ml-4 mt-1 text-xs text-red-500", errorClassName)}>
          {error}
        </p>)}
    </div>);
});
const Checkbox = forwardRef(function Checkbox({ id, checked, onChange, label, error, accentColor = "bg-orange-500", ...rest }, ref) {
    return (<div className="w-full">
 <div className="flex items-center gap-3">
 <button ref={ref} type="button" id={id} role="checkbox" aria-checked={checked} onClick={() => onChange && onChange(!checked)} className={`
 shrink-0 w-5 h-5 rounded border-2 transition-all duration-200
 flex items-center justify-center cursor-pointer
 ${checked
            ? `${accentColor} border-transparent`
            : "bg-white border-gray-400 hover:border-gray-600"}
 `} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest}>
 {checked && (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="w-3 h-3">
 <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>)}
 </button>

 {label && (<div className="text-sm text-gray-600 font-light leading-snug select-none">
 {label}
 </div>)}
 </div>
 {error && (<p id={`${id}-error`} className="mt-1 ml-8 text-xs text-red-500">{error}</p>)}
 </div>);
});
const Button = forwardRef(function Button({ children, type = "button", isLoading = false, loadingText = "Sending...", className = "", disabled, ...rest }, ref) {
    return (<button ref={ref} type={type} disabled={isLoading || disabled} className={`
 relative inline-flex items-center justify-center
 rounded-full cursor-pointer
 bg-black text-white text-sm font-medium
 px-8 py-4 min-w-45
 transition-all duration-300
 hover:scale-[0.97] active:scale-95
 disabled:opacity-70 disabled:cursor-not-allowed
 ${className}
 `} {...rest}>
 {isLoading ? (<span className="flex items-center gap-2">
 <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
 </svg>
 {loadingText}
 </span>) : (children)}
 </button>);
});
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
function defaultValidate(field, value) {
    if (field.required && (value === "" || value === false || value == null)) {
        return `${typeof field.label === "string" ? field.label.replace("*", "") : "This field"} is required.`;
    }
    if (field.type === "email" && value && !EMAIL_RE.test(value)) {
        return "Invalid email address.";
    }
    if (field.type === "phone" && value && value.replace(/\D/g, "").length < 7) {
        return "Invalid phone number.";
    }
    return undefined;
}
function buildInitialValues(fields) {
    const values = {};
    for (const f of fields) {
        if (f.type === "checkbox")
            values[f.name] = false;
        else if (f.type === "select")
            values[f.name] = "";
        else
            values[f.name] = "";
    }
    return values;
}
// component
function ContactForm({ fields = [], onSubmit, schema, submitLabel = "Submit", loadingLabel = "Sending...", successMessage = " Form submitted successfully!", errorMessage = " Error sending message. Please try again.", accentColor = "#111111", textColor = "#111111", inputBackgroundColor = "#ffffff", fieldBorderColor = "#e5e7eb", inputRoundedness = 28, duration = 0.3, }) {
    const [values, setValues] = useState(() => buildInitialValues(fields));
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [failed, setFailed] = useState(false);
    const uid = useId().replace(/:/g, "");
    const sectionId = `contact-form-${uid}`;
    // ── value helpers ──
    const setValue = useCallback((name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    }, []);
    const clearError = useCallback((name) => {
        setErrors((prev) => {
            if (!prev[name])
                return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);
    // ── per-field validation ──
    const validateField = useCallback((field, value) => {
        // Run built-in checks first
        const builtIn = defaultValidate(field, value);
        if (builtIn)
            return builtIn;
        // Then custom validator
        if (field.validate)
            return field.validate(value);
        return undefined;
    }, []);
    // ── full-form validation ──
    // Returns { valid, data } where `data` is Zod's parsed (coerced/trimmed)
    // output when a schema is used, or the raw values otherwise.
    const validateAll = useCallback(() => {
        const newErrors = {};
        if (schema) {
            // Zod is the source of truth: map the first issue per field by name.
            const result = schema.safeParse(values);
            if (result.success) {
                setErrors(newErrors);
                return { valid: true, data: result.data };
            }
            for (const issue of result.error.issues) {
                const key = issue.path[0];
                if (key != null && !newErrors[key])
                    newErrors[key] = issue.message;
            }
        }
        else {
            for (const f of fields) {
                const err = validateField(f, values[f.name]);
                if (err)
                    newErrors[f.name] = err;
            }
        }
        setErrors(newErrors);
        return { valid: Object.keys(newErrors).length === 0, data: values };
    }, [fields, values, validateField, schema]);
    // ── submit ──
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const { valid, data } = validateAll();
        if (!valid)
            return;
        setIsLoading(true);
        setFailed(false);
        try {
            await onSubmit(data);
            setSubmitted(true);
            setValues(buildInitialValues(fields));
            setTimeout(() => setSubmitted(false), 7000);
        }
        catch {
            setFailed(true);
            setTimeout(() => setFailed(false), 7000);
        }
        finally {
            setIsLoading(false);
        }
    }, [fields, validateAll, onSubmit]);
    // ── render field ──
    const renderField = (field) => {
        const { name, type, label, options, rows, defaultCountry } = field;
        const value = values[name];
        const error = errors[name];
        const commonChange = (val) => {
            setValue(name, val);
            clearError(name);
        };
        switch (type) {
            case "textarea":
                return (<Textarea key={name} id={name} label={label} rows={rows} value={value} onChange={(e) => commonChange(e.target.value)} error={error}/>);
            case "select":
                return (<Select key={name} id={name} label={label} options={options || []} value={value} onChange={(e) => commonChange(e.target.value)} error={error}/>);
            case "phone":
                return (<PhoneInput key={name} id={name} label={label} value={value} onChange={(val) => commonChange(val)} defaultCountry={defaultCountry || "IN"} error={error}/>);
            case "checkbox":
                return (<Checkbox key={name} id={name} label={label} checked={!!value} onChange={(checked) => commonChange(checked)} error={error}/>);
            // text | email | url | number | password |
            default:
                return (<Input key={name} id={name} label={label} type={type || "text"} value={value} onChange={(e) => commonChange(e.target.value)} error={error}/>);
        }
    };
    return (<section className="h-full w-full" id={sectionId} style={{
            "--form-accent": accentColor,
            "--form-text": textColor,
            "--form-input-bg": inputBackgroundColor,
            "--form-field-border": fieldBorderColor,
            "--form-input-radius": `${Math.max(0, Number(inputRoundedness) || 0)}px`,
            "--form-duration": `${Math.max(0.05, Number(duration) || 0.3)}s`,
        }}>
 <style>{`
 #${sectionId} input,
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
 #${sectionId} input:focus,
 #${sectionId} textarea:focus,
 #${sectionId} button[id]:focus,
 #${sectionId} .group:focus-within input,
 #${sectionId} .group:focus-within textarea {
   border-color: var(--form-accent);
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
   background-color: var(--form-accent);
   border-radius: var(--form-input-radius);
   color: #ffffff;
   transition-duration: var(--form-duration);
 }
 #${sectionId} [role="checkbox"][aria-checked="true"] {
   background-color: var(--form-accent);
   border-color: var(--form-accent);
 }
 `}</style>
 <div className="w-full h-full">
 <div className="w-full flex flex-col gap-[2vw]">
 <form autoComplete="off" className="space-y-[1.2vw] max-md:space-y-[4vw] max-[1025px]:space-y-[4vw]" onSubmit={handleSubmit}>
 {fields.map((field) => renderField(field))}

 <div className="flex items-center justify-start  max-md:mt-[10vw]">
 <Button type="submit" isLoading={isLoading} loadingText={loadingLabel} className="mt-[3vw]  max-md:mt-0 max-[1025px]:mt-[3vw]">
 {submitLabel}
 </Button>
 </div>

 {submitted && (<p className="text-green-600 text-sm mt-2">{successMessage}</p>)}
 {failed && (<p className="text-red-600 text-sm mt-2">{errorMessage}</p>)}
 </form>
 </div>
 </div>
 </section>);
}
// ---- index.tsx ----
// Built using Hyperiux Vault: https://vault.hyperiux.com
const FIELDS = [
    { type: "text", name: "name", label: "Name*", required: true },
    { type: "email", name: "email", label: "Business Email*", required: true },
    { type: "phone", name: "phone", label: "Phone*", required: true, defaultCountry: "IN" },
    {
        type: "select",
        name: "topic",
        label: "Topic*",
        required: true,
        options: [
            { value: "general", label: "General Inquiry" },
            { value: "partnership", label: "Partnership" },
        ],
    },
    { type: "textarea", name: "message", label: "Your message", rows: 4 },
    {
        type: "checkbox",
        name: "terms",
        required: true,
        label: <>I agree to the <a href="#" className="underline">Terms</a>.</>,
    },
];
// Phone values are stored as "+<dial> <number>" (e.g. "+91 9876543210").
// Strip the leading dial code so we count only the national number's digits.
const nationalDigits = (val) => val.replace(/^\+\d+\s*/, "").replace(/\D/g, "");
// Valid national-number digit ranges per dial code (E.164, trunk prefix
// excluded). A single "exactly 10" rule rejects every valid number from
// Ireland, Australia, France, the UAE and Singapore.
const NATIONAL_LENGTH_BY_DIAL = {
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
const isValidPhone = (val) => {
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
        .min(2, "Name must be at least 2 characters."),
    email: z
        .string()
        .trim()
        .min(1, "Business Email is required.")
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
    message: z.string().trim().max(1000, "Message is too long.").optional(),
    terms: z.literal(true, {
        message: "You must agree to the Terms.",
    }),
});
async function submitHandler(data) {
    console.log("Contact form submitted:", data);
}
export default function AnimatedForm({ accentColor = "#111111", backgroundColor = "#ffffff", textColor = "#111111", inputBackgroundColor = "#ffffff", fieldBorderColor = "#e5e7eb", inputRoundedness = 28, duration = 0.3, }) {
    return (<main className="w-full min-h-screen mx-auto py-20 max-[1025px]:pt-28 px-6" style={{ backgroundColor }}>
  <div className="w-[50%] max-[1025px]:w-[90%] max-md:w-[95%] mx-auto">  <h1 className="text-3xl mb-8" style={{ color: textColor }}>Get in touch</h1>
 <ContactForm fields={FIELDS} schema={contactSchema} onSubmit={submitHandler} submitLabel="Send Message" accentColor={accentColor} textColor={textColor} inputBackgroundColor={inputBackgroundColor} fieldBorderColor={fieldBorderColor} inputRoundedness={inputRoundedness} duration={duration}/>
 </div>
 </main>);
}
export { Button, Checkbox, ContactForm, Input, PhoneInput, Select, Textarea };
