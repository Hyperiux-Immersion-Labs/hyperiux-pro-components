import { PixelSquaresLoader } from "@/components/ui/PixelSquaresLoader";

export default function EffectDetailLoading() {
  return (
    <div className="absolute inset-x-0 top-0 flex h-screen items-center justify-center">
      <PixelSquaresLoader />
    </div>
  );
}
