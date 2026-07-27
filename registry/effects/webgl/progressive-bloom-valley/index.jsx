// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import FilmGrainEffect from "./FilmGrainEffect";
import EdgeBlurEffect from "./EdgeBlurEffect";
import Experience from "./ExperienceComp";
import { createVisibilityGate } from "./createSuspendedRaf";

export default function ProgressiveBloomValley() {
 const rootRef = useRef(null);
 const [frameloop, setFrameloop] = useState("always");

 useEffect(() => {
 const gate = createVisibilityGate({
 root: rootRef,
 onChange: (active) => setFrameloop(active ? "always" : "never"),
 });
 setFrameloop(gate.isActive ? "always" : "never");
 return () => gate.destroy();
 }, []);

 return (
 <div ref={rootRef} className="h-screen w-full relative">

 <Canvas
 dpr={[1, 1.5]}
 flat
 frameloop={frameloop}
 gl={{
 powerPreference:"high-performance",
 outputColorSpace: THREE.SRGBColorSpace,
 }}

 >
 <color attach="background" args={["#000"]} />
 <Suspense fallback={null}>
 <Experience />
 </Suspense>

 <EffectComposer disableNormalPass>
 {/* Mipmap blur creates an extremely soft, diffused glow without harsh edges */}
 {/* Threshold ensures only the hovered (multiplied) pixels bloom, preserving details elsewhere */}
  <EdgeBlurEffect blurStrength={1.2} blurStart={0.2} />
 <FilmGrainEffect amount={0.05} scale={1} />
 <Vignette

 offset={0.3}
 darkness={.7}
 />
 </EffectComposer>
 </Canvas>
 </div>
 );
}
