
import DitherCanvas from "@/components/dither-canvas";

export default function Page() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-black">
      <DitherCanvas
        charColumns={100}
        colorizeFromVideo
        videoZoom={1.9}
        charZoom={0.9}
        spellBrightChars
      />
    </main>
  );
}
