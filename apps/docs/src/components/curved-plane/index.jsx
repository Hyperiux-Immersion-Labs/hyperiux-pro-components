"use client";

import { useMemo, useState } from "react";
import CurvedPlaneHorizontal from "./CurvedSwiperHorizontal";
import CurvedPlaneVertical from "./CurvedSwiperVertical";


const VARIANTS = {
  horizontal: CurvedPlaneHorizontal,
  vertical: CurvedPlaneVertical,
};

const VERSIONS = [
  {
    label: "V1",
    value: "horizontal",
  },
  {
    label: "V2",
    value: "vertical",
  },
];

export default function CurvedPlane({ variant = "horizontal", ...props }) {
  const [activeVariant, setActiveVariant] = useState(
    VARIANTS[variant] ? variant : "horizontal"
  );

  const ActiveComponent = useMemo(() => {
    return VARIANTS[activeVariant] || CurvedPlaneHorizontal;
  }, [activeVariant]);

  return (
    <>
      <VersionNav
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
      />
      <ActiveComponent {...props} />
    </>
  );
}

function VersionNav({ activeVariant, onVariantChange }) {
  return (
    <nav className="fixed bottom-8 h-fit  max-md:bottom-28 left-1/2 z-9999 flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-black/8 px-1.5 py-1.5 backdrop-blur-md  max-md:px-3 max-md:py-2  max-sm:px-2 max-sm:py-1.5">
      {VERSIONS.map((variant) => {
        const isActive = activeVariant === variant.value;

        return (
          <button
            key={variant.value}
            type="button"
            onClick={() => onVariantChange(variant.value)}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold tracking-widest transition-all duration-200 max-md:text-lg max-sm:text-sm ${
              isActive
                ? "bg-black text-white"
                : "text-black/65 hover:text-black"
            }`}
          >
            {variant.label}
          </button>
        );
      })}
    </nav>
  );
}
