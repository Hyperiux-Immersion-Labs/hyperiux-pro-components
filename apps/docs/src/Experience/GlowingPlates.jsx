"use client";

// ─────────────────────────────────────────────────────────────────────────────
// PlatesScene — 51 metallic discs arranged in a helix ring.
// Hover: screen-space nearest-plate detection → Gaussian neighbourhood glow.
// Rendering: MeshStandardMaterial + custom shader-based additive glow overlay.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo, useLayoutEffect, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import useIsMobile from "@/hooks/useIsMobile";
import gsap from "gsap";

// ─── Utilities ────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG = {
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
  metalness: 0.75,
  plateColor: "#0e0e0e",

  // Hover Physics & Animation
  hoverSigma: 2.0,
  hoverSpeed: 0.09,
  hoverScale: 1.25,
  rotationSpeed: 0.05,
  hoverThreshold: 0.48,

  // Glow/Heat Gradient Shader Settings
  glowIntensity: 1.8,

  // Lighting & Environment
  lightColor: "#ff4f00",
  lightIntensity: 1.0,
  lightPosition: [20, 10.5, -20],
  lightShadowNear: 1,
  lightShadowFar: 60,
  lightShadowFrustum: 12,
  shadowBias: 0.0,
  shadowNormalBias: 0.04,
  environmentIntensity: 0.1,
  environmentPreset: "city",

  wrapperPosition: [1, 0, 0],
  groupPosition: [4.15, 3.93, -0.5],
  groupRotation: [1.41, 0.01, -0.14],

  // Camera & Canvas
  cameraPosition: [0, 0.8, 7.0],
  cameraFov: 62,
  toneMappingExposure: 1.1,
  canvasDpr: 1.0, 

  // Bloom Post-processing
  bloomIntensity: 1.35,
  bloomThreshold: 0.22,
  bloomSmoothing: 0.99,
  bloomRadius: 0.,

  updateFPS: 0,
};

// ─── Materials ────────────────────────────────────────────────────────────────
function makePlateMaterial(roughness, metalness) {
  return new THREE.MeshStandardMaterial({
    color: CONFIG.plateColor,
    roughness,
    metalness,
  });
}

function makePlateGeometry(r, h) {
  return new THREE.CylinderGeometry(r, r, h, 64, 1, false);
}

// ─── Custom glow shader — linear gradient across disc face ─────────────────────
function makeGlowShaderMaterial() {
  const vertexShader = `
    attribute float instanceIntensity;
    varying float vIntensity;
    varying vec2 vUv;
    varying float vCapMask;

    void main() {
      vUv = uv;
      vIntensity = instanceIntensity;
      vCapMask = smoothstep(0.15, 0.7, abs(normal.y));
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying float vIntensity;
    varying vec2 vUv;
    varying float vCapMask;

    void main() {
      if (vCapMask <= 0.001 || vIntensity <= 0.001) discard;

      // Linear gradient left → right (UV.x)
      float t = smoothstep(0.0, 1.0, vUv.x);
      vec3 leftColor = vec3(1.0, 0.14, 0.0);   // #ff5f00
      vec3 rightColor = vec3(1.0, 0.07, 0.0);  // #ff5f00

      vec3 col = mix(leftColor, rightColor, t);

      // Silhouette AA only — no radial color falloff
      float radial = length(vUv - 0.5) * 1.0;
      float aa = fwidth(radial) * 1.5;
      float discAlpha = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, radial);

      float strength = vIntensity * vCapMask * discAlpha;
      gl_FragColor = vec4(col * strength, strength);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -0.5,
    polygonOffsetUnits: -0.5,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ParametricPlates
// ─────────────────────────────────────────────────────────────────────────────
function ParametricPlates({ isMobile }) {
  const count = CONFIG.count;
  const radius = CONFIG.radius;
  const {
    heightStep, turns,
    localTiltX, localTiltY, localTiltZ,
    plateRadius, plateThickness, roughness, metalness,
    hoverSigma, hoverSpeed, hoverScale, glowIntensity,
    rotationSpeed, hoverThreshold, updateFPS
  } = CONFIG;

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mainRef = useRef();
  const glowRef = useRef();
  const hoveredRef = useRef(-1);
  const prevRotation = useRef(0);
  const accumulator = useRef(0);
  const dummy = useRef(new THREE.Object3D());
  const pos = useRef(new THREE.Vector3());
  const projPos = useRef(new THREE.Vector3());
  const groupMat = useRef(new THREE.Matrix4());
  const ndcPointer = useRef(new THREE.Vector2(-9999, -9999));
  const rectRef = useRef(null);
  const tempEuler = useRef(new THREE.Euler());
  const tempQuat = useRef(new THREE.Quaternion());

  // Per-instance glow/heat intensities
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
      prevScaleArr: new Float32Array(count).fill(1.0),
      intensityArr: new Float32Array(count).fill(0) // for shader
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

  // ── Materials & Geometries ─────────────────────────────────────────────────
  const mainMat = useMemo(() => makePlateMaterial(roughness, metalness), [roughness, metalness]);
  const geo = useMemo(() => makePlateGeometry(plateRadius, plateThickness), [plateRadius, plateThickness]);
  // Only create once per mount to persist uniform/attribute state
  const glowMat = useMemo(() => makeGlowShaderMaterial(), []);

  // ── Add instanceIntensity attribute to glow instanced mesh before first frame ──
  useLayoutEffect(() => {
    if (!glowRef.current) return;

    // Provide the "instanceIntensity" instanced attribute
    const instancedMesh = glowRef.current;
    const array = arraysRef.current.intensityArr;
    if (!instancedMesh.geometry.getAttribute("instanceIntensity")) {
      const attr = new THREE.InstancedBufferAttribute(array, 1);
      instancedMesh.geometry.setAttribute("instanceIntensity", attr);
    }
  }, [count, geo]);

  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const pointer = ndcPointer.current;

    rectRef.current = el.getBoundingClientRect();

    const ro = new ResizeObserver(() => {
      rectRef.current = el.getBoundingClientRect();
    });
    ro.observe(el);

    const handlePointer = (clientX, clientY) => {
      const r = rectRef.current;
      if (!r) return;
      pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
    };

    const onMouseMove = (e) => {
      handlePointer(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onLeave = () => pointer.set(-9999, -9999);

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchMove, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchMove);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onLeave);
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
      prevScaleArr,
      intensityArr
    } = arraysRef.current;

    const pointer = ndcPointer.current;
    const dummyObj = dummy.current;
    const position = pos.current;
    const projected = projPos.current;
    const parentMatrix = groupMat.current;

    // Optional FPS throttling
    if (updateFPS > 0) {
      accumulator.current += delta;
      const interval = 1 / updateFPS;
      if (accumulator.current < interval) return;
      accumulator.current -= interval;
    }

    const time = clock.getElapsedTime();
    const rotation = time * rotationSpeed;

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
      for (let i = 0; i < count; i++) {
        const theta = baseTheta[i] + rotation;
        cosThetaArr[i] = Math.cos(theta);
        sinThetaArr[i] = Math.sin(theta);
      }
    }

    let matrixDirty =
      hovId !== -1 ||
      Math.abs(rotation - prevRotation.current) > 0.00001;
    prevRotation.current = rotation;

    let intensitiesDirty = false;

    for (let i = 0; i < count; i++) {
      const cosT = cosThetaArr[i];
      const sinT = sinThetaArr[i];

      // Gaussian hover influence
      const dist = hovId === -1 ? Infinity : Math.abs(i - hovId);
      const influence = hovId === -1 ? 0 : Math.exp(-(dist ** 2) / (2 * hoverSigma ** 2));

      glowArr[i] = lerp(glowArr[i], influence, hoverSpeed);
      scaleArr[i] = lerp(scaleArr[i], 1.0 + (hoverScale - 1) * influence, hoverSpeed);
      tiltXArr[i] = lerp(tiltXArr[i], localTiltX * (1 - influence), hoverSpeed);
      tiltYArr[i] = lerp(tiltYArr[i], localTiltY * (1 - influence), hoverSpeed);

      const scaleDelta = Math.abs(scaleArr[i] - prevScaleArr[i]);
      if (scaleDelta > 0.0001) {
        matrixDirty = true;
        prevScaleArr[i] = scaleArr[i];
      }

      // Helix position
      position.set(cosT * radius, (i - count / 2) * heightStep, sinT * radius);
      dummyObj.position.copy(position);

      // Tangent align & local tilt
      const tx = -sinT;
      const ty = heightStep > 0 ? heightStep / radius : 0;
      const tz = cosT;
      let nx = tx, ny = ty, nz = tz;
      if (heightStep > 0) {
        const len = Math.sqrt(tx * tx + ty * ty + tz * tz);
        nx /= len; ny /= len; nz /= len;
      }
      const r = ny + 1.0;
      if (r < 0.0001) {
        dummyObj.quaternion.set(1, 0, 0, 0);
      } else {
        dummyObj.quaternion.set(nz, 0, -nx, r).normalize();
      }
      tempEuler.current.set(tiltXArr[i], tiltYArr[i], localTiltZ);
      tempQuat.current.setFromEuler(tempEuler.current);
      dummyObj.quaternion.multiply(tempQuat.current);

      dummyObj.scale.set(scaleArr[i], 1.0, scaleArr[i]);
      dummyObj.updateMatrix();

      main.setMatrixAt(i, dummyObj.matrix);
      glow.setMatrixAt(i, dummyObj.matrix);

      // Per-instance glow/heat gradient via instanceIntensity attribute
      const g = glowArr[i] * glowIntensity;
      if (Math.abs(g - prevGlowArr[i]) > 0.001) {
        prevGlowArr[i] = g;
        intensityArr[i] = g;
        intensitiesDirty = true;
      }
    }

    if (matrixDirty) {
      main.instanceMatrix.needsUpdate = true;
      glow.instanceMatrix.needsUpdate = true;
    }

    // Upload per-instance glow/heat to shader attribute only if dirty
    if (intensitiesDirty) {
      if (glow.geometry.getAttribute("instanceIntensity")) {
        glow.geometry.getAttribute("instanceIntensity").needsUpdate = true;
      }
    }
  });

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <instancedMesh
        ref={mainRef}
        args={[geo, mainMat, count]}
        castShadow
        rotation={[0,0,0]}
        receiveShadow
        frustumCulled={false}
      />
      {/* Additive linear-gradient overlay with custom shader */}
      <instancedMesh
        ref={glowRef}
        args={[geo, null, count]}
        material={glowMat}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene Root
// ─────────────────────────────────────────────────────────────────────────────
export default function GlowingPlates() {
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const [inView, setInView] = useState(true);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.0 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    const isLoaderActive = typeof document !== "undefined" && document.body.classList.contains("loader-active");

    gsap.set(el, { opacity: 0 });

    const playFadeIn = () => {
      gsap.to(el, {
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        delay: 0.45,
      });
    };

    if (isLoaderActive) {
      const handleLoaderComplete = () => {
        playFadeIn();
      };
      window.addEventListener("loaderComplete", handleLoaderComplete);
      return () => {
        window.removeEventListener("loaderComplete", handleLoaderComplete);
      };
    } else {
      playFadeIn();
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute z-10 bg-background inset-0 h-[140vh] w-full">
      <div ref={canvasWrapperRef} className="h-full w-full opacity-0">
        <Canvas
          className="h-full w-full"
          frameloop={inView ? "always" : "never"}
          dpr={CONFIG.canvasDpr}
          shadows={!isMobile}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: CONFIG.toneMappingExposure,
          }}
        >
          <PerspectiveCamera makeDefault position={CONFIG.cameraPosition} fov={CONFIG.cameraFov} />
          <Environment preset={CONFIG.environmentPreset} environmentIntensity={CONFIG.environmentIntensity} />

          <directionalLight
            castShadow={!isMobile}
            color={CONFIG.lightColor}
            intensity={CONFIG.lightIntensity}
            position={CONFIG.lightPosition}
          />
          <group position={CONFIG.wrapperPosition}>
            <group
              position={CONFIG.groupPosition}
              rotation={CONFIG.groupRotation}
            >
              <ParametricPlates key={isMobile ? "mobile" : "desktop"} isMobile={isMobile} />
            </group>
          </group>

          {!isMobile && (
            <EffectComposer>
              <Bloom
                intensity={CONFIG.bloomIntensity}
                luminanceThreshold={CONFIG.bloomThreshold}
                luminanceSmoothing={CONFIG.bloomSmoothing}
                mipmapBlur
                radius={CONFIG.bloomRadius}
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </div>
  );
}