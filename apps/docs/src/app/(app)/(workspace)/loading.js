import { PixelSquaresLoader } from "@/components/ui/PixelSquaresLoader";

export default function WorkspaceLoading() {
  return (
    <div className="sticky top-0  flex h-screen w-full items-center justify-center">
      <PixelSquaresLoader />
    </div>
  );
}
