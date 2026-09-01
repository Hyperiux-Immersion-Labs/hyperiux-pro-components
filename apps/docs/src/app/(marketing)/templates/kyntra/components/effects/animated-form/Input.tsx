import React, { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

/**
 * Floating-label Input (Kyntra glass variant)
 * The label sits inside the pill as a placeholder and floats up on
 * focus / when the field holds a value.
 */
export type InputProps = {
  id?: string;
  label?: ReactNode;
  type?: string;
  error?: string;
  className?: string;
  labelBg?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'type'>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, placeholder, type = "text", error, labelBg = "", className = "", ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      <div className="group relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="
              pointer-events-none absolute left-[1.6vw] top-1/2 z-10 block
              -translate-y-1/2 font-aeonik-pro text-[1.05vw] text-white
              transition-all duration-300 ease-out
              group-focus-within:top-[0.9vw] group-focus-within:text-[0.75vw] group-focus-within:text-white
              has-[+input:not(:placeholder-shown)]:top-[0.9vw]
              has-[+input:not(:placeholder-shown)]:text-[0.75vw]
              has-[+input:not(:placeholder-shown)]:text-white
              max-[1025px]:left-[5vw] max-[1025px]:text-[3.2vw]
              max-[1025px]:group-focus-within:top-[3vw] max-[1025px]:group-focus-within:text-[2.4vw]
              max-[1025px]:has-[+input:not(:placeholder-shown)]:top-[3vw]
              max-[1025px]:has-[+input:not(:placeholder-shown)]:text-[2.4vw]
              max-md:text-[4vw]
            "
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder ?? " "}
          className={`
            h-[3.6vw] w-full rounded-[0.8vw] border border-white/25 bg-white/5 max-[1025px]:rounded-[2.5vw]
            pl-[1.6vw] pr-[1.6vw] pt-[0.9vw] font-aeonik-pro text-[1.05vw]
            text-white outline-none backdrop-blur-[1px] transition-colors duration-300
            hover:border-white/40 focus:border-white/60
            max-[1025px]:h-[12vw] max-[1025px]:pl-[5vw] max-[1025px]:pr-[5vw] max-[1025px]:pt-[3vw] max-[1025px]:text-[3.2vw]
            max-md:h-[14vw] max-md:text-[4vw]
            ${error ? "border-red-400/70 focus:border-red-400" : ""}
            ${className}
          `}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="ml-[1.4vw] mt-[0.4vw] font-aeonik-pro text-[0.8vw] text-red-400 max-[1025px]:ml-[5vw] max-[1025px]:mt-[1.5vw] max-[1025px]:text-[2.6vw] max-md:text-[3.2vw]"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
