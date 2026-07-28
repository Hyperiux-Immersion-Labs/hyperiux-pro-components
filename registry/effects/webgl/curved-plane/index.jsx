// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useMemo, useState } from "react";
import CurvedPlaneHorizontal from "./CurvedSwiperHorizontal";
import CurvedPlaneVertical from "./CurvedSwiperVertical";


const VARIANTS = {
  horizontal: CurvedPlaneHorizontal,
  vertical: CurvedPlaneVertical,
};

/** @type {{ label: string, value: 'horizontal'|'vertical' }[]} */
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

/**
 * @typedef {Object} CurvedPlaneOwnProps
 * @property {'horizontal'|'vertical'} [variant]
 */

/** @param {CurvedPlaneOwnProps & Record<string, any>} props */
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

/**
 * @typedef {Object} VersionNavProps
 * @property {string} activeVariant
 * @property {(value: 'horizontal'|'vertical') => void} onVariantChange
 */

/** @param {VersionNavProps} props */
function VersionNav({ activeVariant, onVariantChange }) {
  return (
    <nav className="fixed bottom-8 h-fit  max-[1025px]:bottom-28 left-1/2 z-9999 flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-black/8 px-1.5 py-1.5 backdrop-blur-md  max-[1025px]:px-3 max-[1025px]:py-2  max-md:px-2 max-md:py-1.5">
      {VERSIONS.map((variant) => {
        const isActive = activeVariant === variant.value;

        return (
          <button
            key={variant.value}
            type="button"
            onClick={() => onVariantChange(variant.value)}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold tracking-widest transition-all duration-200 max-[1025px]:text-lg max-md:text-sm ${
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
