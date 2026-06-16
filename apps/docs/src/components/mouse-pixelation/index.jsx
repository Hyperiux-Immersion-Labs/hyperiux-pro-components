"use client";
import { useMemo, useState } from "react";
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

const DEFAULT_PIXEL_SHIFT_IMAGE = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg";

export default function MousePixelation({
  variant = "pixel-shift",
  imageUrl = DEFAULT_PIXEL_SHIFT_IMAGE,
  ...props
}) {
  const [activeVariant, setActiveVariant] = useState(
    VARIANTS[variant] ? variant : "pixel-shift"
  );

  const ActiveComponent = useMemo(() => {
    return VARIANTS[activeVariant] || PixelShift;
  }, [activeVariant]);

  return (
    <>
      <VersionNav
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
      />
      <CursorMoveCue />

      <ActiveComponent
        imageUrl={imageUrl}
        img={imageUrl}
        {...props}
      />
    </>
  );
}

function CursorMoveCue() {
  return (
    <div className="pointer-events-none fixed bottom-6 right-[-10%] z-9999 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/35 px-6 py-2 text-md font-medium text-white/80 shadow-[0_0_30px_rgba(255,255,255,0.08)] backdrop-blur-md max-sm:bottom-5 max-sm:text-xs">
     
      <span>Move your cursor to see the pixelated effects</span>
    </div>
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
