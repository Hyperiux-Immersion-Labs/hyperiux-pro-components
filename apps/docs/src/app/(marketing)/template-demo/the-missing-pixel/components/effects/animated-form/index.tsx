// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

const FIELD_BASE =
  "w-full border bg-(--mpx-paper) px-[1.2vw] text-22 text-(color:--mpx-ink) outline-none transition-colors duration-300 max-lg:px-[2.4vw] max-md:px-[4vw]";
const FIELD_STATE = "border-(--mpx-ink)/30 hover:border-(--mpx-ink) focus:border-(--mpx-ink)";
const FIELD_ERROR = "border-(--mpx-accent-deep) hover:border-(--mpx-accent-deep) focus:border-(--mpx-accent-deep)";
const FIELD_HEIGHT = "h-[6.4vh] max-lg:h-[4.8vh] max-md:h-[6.8vh]";

const FIELD_RADIUS = "rounded-lg";

const LABEL_BASE = "text-22 font-medium";

type ErrorLineProps = { id: string; error?: string };

const ErrorLine = ({ id, error }: ErrorLineProps) => (
  <p id={`${id}-error`} aria-live="polite" className="min-h-[1.4vh] max-md:min-h-6 px-[1.2vw] text-14 text-(color:--mpx-accent-deep) max-lg:px-[2.4vw] max-md:px-[4vw]">
    {error}
  </p>
);

type FloatInputProps = {
  id: string;
  name: string;
  label: ReactNode;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export const FloatInput = ({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required,
  value,
  error,
  onChange,
  onBlur,
}: FloatInputProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className={LABEL_BASE}>
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-error`}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`${FIELD_RADIUS} ${FIELD_BASE} ${FIELD_HEIGHT} ${error ? FIELD_ERROR : FIELD_STATE}`}
      />
    </div>
    <ErrorLine id={id} error={error} />
  </div>
);

type FloatTextareaProps = {
  id: string;
  name: string;
  label: ReactNode;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export const FloatTextarea = ({ id, name, label, required, value, error, onChange, onBlur }: FloatTextareaProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className={LABEL_BASE}>
      {label}
    </label>
    <div className="relative">
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder="Who it’s for, what success looks like, and what keeps you up at night."
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-error`}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`h-[24vh] resize-none ${FIELD_RADIUS} py-[2vh] max-lg:h-[18vh] max-md:h-[22vh] ${FIELD_BASE} ${error ? FIELD_ERROR : FIELD_STATE}`}
      />
    </div>
    <ErrorLine id={id} error={error} />
  </div>
);

type FloatSelectProps = {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export const FloatSelect = ({ id, label, options, value, onChange }: FloatSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className={LABEL_BASE}>
        {label}
      </span>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`flex items-center ${FIELD_RADIUS} pr-[3vw] text-left ${FIELD_BASE} ${FIELD_HEIGHT} ${open ? "border-(--mpx-ink)" : "border-(--mpx-ink)/30 hover:border-(--mpx-ink)"}`}
        >
          {value || options[0]}
        </button>
        <span
          aria-hidden
          className={`pointer-events-none absolute right-[1.2vw] top-1/2 h-[1vh] aspect-square -translate-y-1/2 border-b border-r border-current transition-transform duration-300 max-lg:right-[2.4vw] max-md:right-[4vw] ${open ? "rotate-[225deg]" : "rotate-45"}`}
        />
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className={`absolute inset-x-0 top-full z-30 flex origin-top flex-col gap-1 rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) px-[0.4vw] py-[0.4vw] transition-all duration-200 max-lg:px-[1vw] max-lg:py-[1vw] max-md:px-[2vw] max-md:py-[2vw] ${
            open ? "visible translate-y-2 scale-100 opacity-100" : "invisible translate-y-0 scale-95 opacity-0"
          }`}
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-[1vw] py-[1.2vh] text-left text-22 transition-colors duration-200 hover:bg-(--mpx-paper) max-lg:px-[2vw] max-md:px-[3vw] ${
                  value === option ? "bg-(--mpx-paper)" : ""
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

type FloatCheckboxProps = {
  id: string;
  label: ReactNode;
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
};

export const FloatCheckbox = ({ id, label, checked, error, onChange }: FloatCheckboxProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-error`}
        onClick={() => onChange(!checked)}
        className={`flex aspect-square h-[3vh] shrink-0 items-center justify-center rounded-md border transition-colors duration-300 max-lg:h-[2.4vh] max-md:h-[3.2vh] ${
          checked
            ? "border-(--mpx-ink) bg-(--mpx-ink) text-(color:--mpx-paper)"
            : `${error ? "border-(--mpx-accent-deep)" : "border-(--mpx-ink)/30 hover:border-(--mpx-ink)"}`
        }`}
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`size-[60%] transition-opacity duration-200 ${checked ? "opacity-100" : "opacity-0"}`}
        >
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <label htmlFor={id} className="cursor-pointer text-22 select-none">
        {label}
      </label>
    </div>
    <ErrorLine id={id} error={error} />
  </div>
);

type ChoiceGroupProps = {
  legend: string;
  name: string;
  options: string[];
  values: string[];
  multiple?: boolean;
  onChange: (values: string[]) => void;
};

export const ChoiceGroup = ({ legend, name, options, values, multiple = false, onChange }: ChoiceGroupProps) => {
  const toggle = (option: string) => {
    if (!multiple) {
      onChange([option]);
      return;
    }
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="float-left w-full text-22 font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="relative">
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option}
              checked={values.includes(option)}
              onChange={() => toggle(option)}
              className="peer absolute inset-0 cursor-pointer opacity-0"
            />
            <span className="inline-flex h-[5vh] items-center rounded-full border border-(--mpx-ink)/30 px-[1.2vw] text-22 transition-colors duration-300 peer-checked:border-(--mpx-ink) peer-checked:bg-(--mpx-ink) peer-checked:text-(color:--mpx-paper) peer-hover:border-(--mpx-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-(--mpx-accent) max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw]">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
