// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import ArcLight from "./effects/arc-light";

export type MintArcShape = {
  // Mirror the arcs so each page has its own form; the cursor stir is mirrored with them
  flipX?: boolean;
  flipY?: boolean;
  speed?: number;
  flow?: number;
  // Above 1 the arcs spread into broad, silky bands instead of thin strands
  softness?: number;
  intensity?: number;
};

// The Arc Light shader, always in the Ordin mint. The light renders in greyscale on black and a flat mint
// layer multiplies it, so its brightest point is exactly the palette's mint and never white or neon green.
// The whole group is screened over the dark page, so black disappears and only the light remains.
// Moving the cursor across it drags the light like ink in water.
export default function MintArc({ flipX, flipY, speed = 0.9, flow = 0.9, softness = 1.2, intensity = 1.45 }: MintArcShape) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black mix-blend-screen">
      <ArcLight
        backgroundColor="#000000"
        color="#ffffff"
        saturation={0}
        intensity={intensity}
        softness={softness}
        speed={speed}
        flow={flow}
        grain={0.04}
        flipX={flipX}
        flipY={flipY}
        interactive
        smearStrength={1.6}
        smearRadius={0.16}
      />
      <div className="pointer-events-none absolute inset-0 bg-(--ord-primary) mix-blend-multiply" />
    </div>
  );
}
