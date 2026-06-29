"use client";
import PixelCircle from "./pixel-circle";
import PixelShift from "./pixel-shift";
import EnhancedPixelCube from "./enhanced-pixel-cube";

const VARIANTS = {
  "pixel-circle": PixelCircle,
  "pixel-shift": PixelShift,
  "enhanced-pixel-cube": EnhancedPixelCube,
};

const DEFAULT_PIXEL_SHIFT_IMAGE = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg";

export function MousePixelation({
  variant = "pixel-circle",
  imageUrl = DEFAULT_PIXEL_SHIFT_IMAGE,
  ...props
}) {
  const Component = VARIANTS[variant] ?? PixelCircle;

  return <Component imageUrl={imageUrl} {...props} />;
}

export default MousePixelation;
export { PixelCircle, PixelShift, EnhancedPixelCube };
