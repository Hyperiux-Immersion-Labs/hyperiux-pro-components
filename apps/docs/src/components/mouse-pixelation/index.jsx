"use client";

import { useEffect, useMemo, useState } from "react";

import PixelCircle from "./PixelCircle";
import PixelShift from "./PixelShift";
import EnhancedPixelCube from "./EnhancedPixelCube";

const VARIANTS = {
  "pixel-circle": PixelCircle,
  "pixel-shift": PixelShift,
  "enhanced-pixel-cube": EnhancedPixelCube,
};

const VERSIONS = [
  {
    label: "V1",
    value: "pixel-circle",
  },
  {
    label: "V2",
    value: "pixel-shift",
  },
  {
    label: "V3",
    value: "enhanced-pixel-cube",
  },
];

export default function MousePixelation({
  variant = "pixel-shift",
  imageUrl = "/assets/img/image06.png",
  ...props
}) {
  const [activeVariant, setActiveVariant] = useState(
    VARIANTS[variant] ? variant : "pixel-shift"
  );

  useEffect(() => {
    if (VARIANTS[variant]) {
      setActiveVariant(variant);
    }
  }, [variant]);

  const ActiveComponent = useMemo(() => {
    return VARIANTS[activeVariant] || PixelShift;
  }, [activeVariant]);

  return (
    <>
      <VersionNav
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
      />

      <ActiveComponent
        imageUrl={imageUrl}
        img={imageUrl}
        {...props}
      />
    </>
  );
}

export { PixelCircle, PixelShift, EnhancedPixelCube };

function VersionNav({ activeVariant, onVariantChange }) {
  return (
    <nav className="fixed top-4 left-1/2 z-9999 flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-white/10 px-1.5 py-1.5 backdrop-blur-md max-md:top-8 max-md:px-3 max-md:py-2 max-sm:top-5 max-sm:px-2 max-sm:py-1.5">
      {VERSIONS.map((variant) => {
        const isActive = activeVariant === variant.value;

        return (
          <button
            key={variant.value}
            type="button"
            onClick={() => onVariantChange(variant.value)}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold tracking-widest transition-all duration-200 max-md:text-2xl max-sm:text-sm ${
              isActive
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            {variant.label}
          </button>
        );
      })}
    </nav>
  );
}