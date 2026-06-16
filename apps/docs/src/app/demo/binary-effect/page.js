
import BinaryEffect from "@/components/binary-effect";

export default function Page() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-black">
      <BinaryEffect
        charColumns={100}
        colorizeFromVideo
        videoZoom={1.9}
        charZoom={0.9}
        spellBrightChars
      />
    </main>
  );
}
