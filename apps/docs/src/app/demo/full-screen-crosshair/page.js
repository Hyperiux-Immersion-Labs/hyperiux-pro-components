import FullScreenCrosshair from "@/components/full-screen-crosshair";

export default function Page() {
  return (
    <main className="h-screen w-screen bg-[#211951] text-[#826fffaa]">
      <FullScreenCrosshair
        lineSize={1500}
        thickness={0.5}
        lerpFactor={0.1}
        hideNativeCursor
        color="#F0F3FF"
        centerContent="•"
      />

      <h1 className="w-full h-full flex items-center justify-center text-[5.5vw] font-medium">
       Move the cursor around to see the effect
      </h1>
    </main>
  );
}
