"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Option1 from "./LinesLoading";
import Option2 from "./CenterLinesLoading";

const VARIANTS = {
  option1: Option1,
  option2: Option2,
};

const VERSIONS = [
  {
    label: "V1",
    value: "option1",
  },
  {
    label: "V2",
    value: "option2",
  },
];

export default function LinesLoader({ onComplete, onVariantChange, ...props }) {
  const [activeVariant, setActiveVariant] = useState("option1");
  const [isCompleted, setIsCompleted] = useState(false);

  const ActiveComponent = useMemo(() => {
    return VARIANTS[activeVariant] || Option1;
  }, [activeVariant]);


  const onCompleteRef = useRef(onComplete);
  const onVariantChangeRef = useRef(onVariantChange);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onVariantChangeRef.current = onVariantChange;
  }, [onVariantChange]);

  const handleVariantChange = useCallback((newVariant) => {
    setActiveVariant(newVariant);
    setIsCompleted(false);
    if (onVariantChangeRef.current) {
      onVariantChangeRef.current(newVariant);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, []);

  return (
    <>
      <VersionNav
        activeVariant={activeVariant}
        onVariantChange={handleVariantChange}
        isCompleted={isCompleted}
      />
      {activeVariant === "option1" ? (
        <ActiveComponent
          key={activeVariant}
          onComplete={handleComplete}
          {...props}
        />
      ) : (
        <ActiveComponent
          key={activeVariant}
          lineCount={41}
          title="Build better interfaces"
          subtitle="Hyperiux Vault"
          onComplete={handleComplete}
          {...props}
        />
      )}
    </>
  );
}

function VersionNav({ activeVariant, onVariantChange, isCompleted }) {
  const navBgClass = isCompleted 
    ? "border-black/10 bg-white/20" 
    : "border-white/20 bg-black/8";

  return (
    <div
      className={`fixed bottom-30 left-1/2 z-9999 flex -translate-x-1/2 flex-col items-center gap-3 transition-all duration-500 max-md:bottom-35 max-sm:bottom-40 ${
        isCompleted
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <a
        href="/effects"
        className="group relative inline-flex h-[4.2vw] items-center justify-center overflow-hidden rounded-full bg-[#ff5f00] px-10 py-3 text-[0.8vw] font-semibold uppercase tracking-[0.24em] text-black no-underline transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] hover:scale-[0.96] max-md:h-[9vw] max-md:px-8 max-md:text-[2.6vw] max-sm:h-[15vw] max-sm:px-7 max-sm:text-[4vw]"
      >
        <span className="relative inline-block overflow-hidden leading-[1.2]">
          <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:-translate-y-[1.3em] [text-shadow:0_1.3em_currentColor]">
            Explore all effects
          </span>
        </span>
      </a>
      <nav className={`flex gap-1 rounded-full border px-1.5 py-1.5 backdrop-blur-md transition-all duration-300 max-md:px-3 max-md:py-2 max-sm:px-2 max-sm:py-1.5 ${navBgClass}`}>
        {VERSIONS.map((variant) => {
          const isActive = activeVariant === variant.value;
          const btnClass = isCompleted
            ? (isActive ? "bg-black text-white" : "text-black/65 hover:text-black")
            : (isActive ? "bg-white text-black" : "text-white/65 hover:text-white");

          return (
            <button
              key={variant.value}
              type="button"
              onClick={() => onVariantChange(variant.value)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold tracking-widest transition-all duration-200 max-md:text-lg max-sm:text-sm ${btnClass}`}
            >
              {variant.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
