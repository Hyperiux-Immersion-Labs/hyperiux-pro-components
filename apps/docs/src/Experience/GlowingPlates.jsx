"use client";

// ─────────────────────────────────────────────────────────────────────────────
// PlatesScene — 51 metallic discs arranged in a helix ring.
// Hover: screen-space nearest-plate detection → Gaussian neighbourhood glow.
// Rendering: MeshStandardMaterial + separate additive glow overlay + Bloom.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo, useLayoutEffect, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// ─── Utilities ────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG = {
  // Helix Geometry
  count: 51,
  radius: 4.5,
  heightStep: 0.0,
  turns: 1.0,
  localTiltX: 0.21,
  localTiltY: -0.04,
  localTiltZ: 0.0,
  plateRadius: 1.5,
  plateThickness: 0.04,

  // Material Properties
  roughness: 0.3,
  metalness: 0.75, // 0.95 → 0.75 so diffuse channel (where shadows live) is visible
  plateColor: "#0e0e0e",

  // Hover Physics & Animation
  hoverSigma: 2.0,       // Gaussian spread (plates)
  hoverSpeed: 0.09,      // lerp rate per frame
  hoverScale: 1.40,      // max XZ scale at hover centre
  rotationSpeed: 0.05,   // helix rotation speed factor
  hoverThreshold: 0.48,  // screen-space distance threshold for hover

  // Glow Settings
  glowIntensity: 1.5,   // HDR multiplier for additive overlay
  glowColor: "#ff7c00",   // base material color
  glowRGB: { r: 1.0, g: 0.25, b: 0.0 }, // real-time instanceColor multiplication factor

  // Lighting & Environment
  lightColor: "#ff4f00",
  lightIntensity: 1.0,
  lightPosition: [20, 10.5, -20],
  lightShadowNear: 1,
  lightShadowFar: 60,
  lightShadowFrustum: 12, // shadow camera boundary (top/bottom/left/right)
  shadowBias: 0.0,
  shadowNormalBias: 0.04,
  environmentIntensity: 0.1,
  environmentPreset: "city",

  // Placement & Group Orientation
  wrapperPosition: [1, 0, 0],
  groupPosition: [4.15, 3.93, -0.5],
  groupRotation: [1.41, 0.01, -0.14],

  // Camera & Canvas
  cameraPosition: [0, 0.8, 7.0],
  cameraFov: 62,
  toneMappingExposure: 1.1,
  canvasDpr: 1.0,        // Device Pixel Ratio limit for performance

  // Bloom Post-processing
  bloomIntensity: 1.5,
  bloomThreshold: 0.15,
  bloomSmoothing: 0.98,
  bloomRadius: 0.,

  // Performance throttling
  updateFPS: 0,         // FPS limit for matrix updates (e.g. 30, 60 or 0 for uncapped)
};

// ─── Materials ────────────────────────────────────────────────────────────────
function makePlateMaterial(roughness, metalness) {
  return new THREE.MeshStandardMaterial({
    color: CONFIG.plateColor,
    roughness,
    metalness,
  });
}

function makeGlowMaterial() {
  return new THREE.MeshBasicMaterial({
    color: CONFIG.glowColor,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    // Same geometry as main — polygon offset renders it in front without Z-fight
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

// ─── Geometry ─────────────────────────────────────────────────────────────────
function makePlateGeometry(r, h) {
  return new THREE.CylinderGeometry(r, r, h, 64);
}

// ─────────────────────────────────────────────────────────────────────────────
// ParametricPlates
// ─────────────────────────────────────────────────────────────────────────────
function ParametricPlates() {
  const {
    count, radius, heightStep, turns,
    localTiltX, localTiltY, localTiltZ,
    plateRadius, plateThickness, roughness, metalness,
    hoverSigma, hoverSpeed, hoverScale, glowIntensity,
    rotationSpeed, hoverThreshold, glowRGB, updateFPS
  } = CONFIG;

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mainRef = useRef();
  const glowRef = useRef();
  const hoveredRef = useRef(-1);
  const accumulator = useRef(0);
  const tmpColor = useRef(new THREE.Color());
  const dummy = useRef(new THREE.Object3D());
  const pos = useRef(new THREE.Vector3());
  const projPos = useRef(new THREE.Vector3());
  const groupMat = useRef(new THREE.Matrix4());
  const ndcPointer = useRef(new THREE.Vector2(-9999, -9999));

  const arraysRef = useRef(null);
  if (arraysRef.current === null) {
    arraysRef.current = {
      glowArr: new Float32Array(count).fill(0),
      scaleArr: new Float32Array(count).fill(1.0),
      tiltXArr: new Float32Array(count).fill(localTiltX),
      tiltYArr: new Float32Array(count).fill(localTiltY),
      sinThetaArr: new Float32Array(count),
      cosThetaArr: new Float32Array(count),
      prevGlowArr: new Float32Array(count).fill(-999),
    };
  }

  const baseTheta = useMemo(() => {
    const arr = new Float32Array(count);
    const thetaStep = (turns * Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      arr[i] = i * thetaStep;
    }
    return arr;
  }, [count, turns]);

  // ── Materials & Geometries (Shared single geometry) ────────────────────────
  const mainMat = useMemo(() => makePlateMaterial(roughness, metalness), [roughness, metalness]);
  const glowMat = useMemo(() => makeGlowMaterial(), []);
  const geo = useMemo(() => makePlateGeometry(plateRadius, plateThickness), [plateRadius, plateThickness]);

  // ── Initialise glow instanceColor to black before first render ──────────────
  useLayoutEffect(() => {
    const mesh = glowRef.current;
    if (!mesh) return;
    const black = new THREE.Color(0, 0, 0);
    for (let i = 0; i < count; i++) mesh.setColorAt(i, black);
    mesh.instanceColor.needsUpdate = true;
  }, [count]);

  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const pointer = ndcPointer.current;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    const onLeave = () => pointer.set(-9999, -9999);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [gl]);

  // ── Frame loop ──────────────────────────────────────────────────────────────
  useFrame(({ clock }, delta) => {
    const main = mainRef.current;
    const glow = glowRef.current;
    if (!main || !glow) return;

    const {
      glowArr,
      scaleArr,
      tiltXArr,
      tiltYArr,
      sinThetaArr,
      cosThetaArr,
      prevGlowArr,
    } = arraysRef.current;
    const pointer = ndcPointer.current;
    const dummyObj = dummy.current;
    const position = pos.current;
    const projected = projPos.current;
    const parentMatrix = groupMat.current;
    const color = tmpColor.current;

    // Optional FPS throttling
    if (updateFPS > 0) {
      accumulator.current += delta;
      const interval = 1 / updateFPS;
      if (accumulator.current < interval) return;
      accumulator.current -= interval;
    }

    const time = clock.getElapsedTime();
    const rotation = time * rotationSpeed;

    // Cache parent world matrix for screen-space projection
    if (main.parent) {
      main.parent.updateWorldMatrix(true, false);
      parentMatrix.copy(main.parent.matrixWorld);
    }

    const mouseActive = pointer.x > -2;
    let hovId = -1;

    if (mouseActive) {
      let minDist = Infinity;
      let nearestId = -1;

      for (let i = 0; i < count; i++) {
        const theta = baseTheta[i] + rotation;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        cosThetaArr[i] = cosT;
        sinThetaArr[i] = sinT;

        projected
          .set(cosT * radius, (i - count / 2) * heightStep, sinT * radius)
          .applyMatrix4(parentMatrix)
          .project(camera);

        const d2 = (projected.x - pointer.x) ** 2 + (projected.y - pointer.y) ** 2;
        if (d2 < minDist) {
          minDist = d2;
          nearestId = i;
        }
      }

      const HOVER_THRESH_SQ = hoverThreshold * hoverThreshold;
      hoveredRef.current = (minDist < HOVER_THRESH_SQ) ? nearestId : -1;
      hovId = hoveredRef.current;
    } else {
      hoveredRef.current = -1;
      hovId = -1;

      // Still need updated sin/cos for the transform loop
      for (let i = 0; i < count; i++) {
        const theta = baseTheta[i] + rotation;
        cosThetaArr[i] = Math.cos(theta);
        sinThetaArr[i] = Math.sin(theta);
      }
    }

    let colorsDirty = false;

    // Single unified transform pass
    for (let i = 0; i < count; i++) {
      const cosT = cosThetaArr[i];
      const sinT = sinThetaArr[i];

      // Gaussian influence: peak 1.0 at hovered plate, smooth falloff over ±5
      const dist = hovId === -1 ? Infinity : Math.abs(i - hovId);
      const influence = hovId === -1 ? 0 : Math.exp(-(dist ** 2) / (2 * hoverSigma ** 2));

      glowArr[i] = lerp(glowArr[i], influence, hoverSpeed);
      scaleArr[i] = lerp(scaleArr[i], 1.0 + (hoverScale - 1) * influence, hoverSpeed);
      tiltXArr[i] = lerp(tiltXArr[i], localTiltX * (1 - influence), hoverSpeed);
      tiltYArr[i] = lerp(tiltYArr[i], localTiltY * (1 - influence), hoverSpeed);

      // Helix position
      position.set(cosT * radius, (i - count / 2) * heightStep, sinT * radius);
      dummyObj.position.copy(position);

      // Tangent-align cylinder axis to the circle using optimized arithmetic quaternion
      const tx = -sinT;
      const ty = heightStep > 0 ? heightStep / radius : 0;
      const tz = cosT;

      let nx = tx;
      let ny = ty;
      let nz = tz;

      if (heightStep > 0) {
        const len = Math.sqrt(tx * tx + ty * ty + tz * tz);
        nx /= len;
        ny /= len;
        nz /= len;
      }

      const r = ny + 1.0;
      if (r < 0.0001) {
        dummyObj.quaternion.set(1, 0, 0, 0);
      } else {
        dummyObj.quaternion.set(nz, 0, -nx, r).normalize();
      }

      dummyObj.rotateX(tiltXArr[i]);
      dummyObj.rotateY(tiltYArr[i]);
      dummyObj.rotateZ(localTiltZ);
      dummyObj.scale.set(scaleArr[i], 1.0, scaleArr[i]);
      dummyObj.updateMatrix();

      main.setMatrixAt(i, dummyObj.matrix);
      glow.setMatrixAt(i, dummyObj.matrix);

      // Glow brightness driven by influence (single warm-orange tone)
      // Optimization: Only setColorAt when color has changed significantly
      const g = glowArr[i];
      if (Math.abs(g - prevGlowArr[i]) > 0.001) {
        prevGlowArr[i] = g;
        color.setRGB(
          g * glowIntensity * glowRGB.r,
          g * glowIntensity * glowRGB.g,
          g * glowIntensity * glowRGB.b
        );
        glow.setColorAt(i, color);
        colorsDirty = true;
      }
    }

    main.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
    if (colorsDirty && glow.instanceColor) {
      glow.instanceColor.needsUpdate = true;
    }
  });

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <instancedMesh
        ref={mainRef}
        args={[geo, mainMat, count]}
        castShadow
        receiveShadow
        frustumCulled={false}
      />
      {/* Additive glow overlay — same geometry, polygon-offset in front */}
      <instancedMesh
        ref={glowRef}
        args={[geo, glowMat, count]}
        castShadow
        frustumCulled={false}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene Root
// ─────────────────────────────────────────────────────────────────────────────
export default function GlowingPlates() {
  return (
    <div className="absolute z-10 bg-background inset-0 h-[140vh] w-full">
      <Canvas
        className="h-full w-full"
        dpr={CONFIG.canvasDpr}
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: CONFIG.toneMappingExposure,
        }}
      >
        <PerspectiveCamera makeDefault position={CONFIG.cameraPosition} fov={CONFIG.cameraFov} />
        <Environment preset={CONFIG.environmentPreset} environmentIntensity={CONFIG.environmentIntensity} />

        {/* Key light — warm orange, tight frustum for crisp inter-plate shadows */}
        <directionalLight
          castShadow
          color={CONFIG.lightColor}
          intensity={CONFIG.lightIntensity}
          position={CONFIG.lightPosition}
     
        />
        <group position={CONFIG.wrapperPosition}>
          <group position={CONFIG.groupPosition} rotation={CONFIG.groupRotation}>
            <ParametricPlates />
          </group>
        </group>

        <EffectComposer>
          <Bloom
            intensity={CONFIG.bloomIntensity}
            luminanceThreshold={CONFIG.bloomThreshold}
            luminanceSmoothing={CONFIG.bloomSmoothing}
            mipmapBlur
            radius={CONFIG.bloomRadius}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}