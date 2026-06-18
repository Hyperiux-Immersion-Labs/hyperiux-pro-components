"use client";

import { useMemo, useState, useCallback, useRef } from "react";
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

export default function LinesLoadingDemo({ onComplete, onVariantChange, ...props }) {
  const [activeVariant, setActiveVariant] = useState("option1");
  const [isCompleted, setIsCompleted] = useState(false);

  const ActiveComponent = useMemo(() => {
    return VARIANTS[activeVariant] || Option1;
  }, [activeVariant]);


  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onVariantChangeRef = useRef(onVariantChange);
  onVariantChangeRef.current = onVariantChange;

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
    <nav className={`fixed bottom-30 max-md:bottom-35 max-sm:bottom-40 left-1/2 z-[9999] flex -translate-x-1/2 gap-1 rounded-full border px-1.5 py-1.5 backdrop-blur-md max-md:px-3 max-md:py-2 max-sm:px-2 max-sm:py-1.5 transition-all duration-300 ${navBgClass}`}>
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
  );
}
