"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Option1 from "./LinesLoading";
import Option2 from "./CenterLinesLoading";
import { ArrowUpRight } from "lucide-react";

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
  return (
    <div
      className={`fixed bottom-30 max-sm:bottom-[14vh] left-1/2 z-2 flex -translate-x-1/2 flex-col items-center gap-10 max-sm:gap-4 transition-all duration-500 max-md:bottom-35  ${
        isCompleted
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center">
        <Link
          href="/effects"
          className="rounded-full flex items-center gap-1 px-6 py-2 text-base  text-black transition-colors hover:text-primary duration-300 ease-in"
        >
          Explore all effects
          <ArrowUpRight className="size-4" />
        </Link>
          <Link
          href="/effects/loaders/lines-loader"
          className="rounded-full flex items-center gap-1 px-6 py-2 text-base  text-black transition-colors hover:text-primary duration-300 ease-in"
        >
          Read Article
          <ArrowUpRight className="size-4" />
        </Link>
        </div>
      <nav className="flex gap-1 rounded-full border border-white/20 bg-black px-1.5 py-1.5 backdrop-blur-md transition-all duration-300 max-md:px-3 max-md:py-2 max-sm:px-2 max-sm:py-1.5">
        {VERSIONS.map((variant) => {
          const isActive = activeVariant === variant.value;
          const btnClass = isCompleted
            ? (isActive ? "bg-white text-black" : "text-white/65 hover:text-white")
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
