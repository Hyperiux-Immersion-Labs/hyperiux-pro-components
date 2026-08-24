"use client";

import {
  Suspense,
  type RefObject,
  useEffect,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  Clone,
  Environment,
  Float,
  MeshTransmissionMaterial,
  ScrollControls,
  useScroll,
  useGLTF,
  useVideoTexture,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_VIDEO_SRC = "/assets/models/bg-video.mp4";
const DEFAULT_MODEL_SRC = "/models/hyperiux-logo.glb";

type Vec3 = [number, number, number];

const CAMERA = { position: [0, 0, 5] as Vec3, fov: 35 };
const GL_CONFIG = {
  antialias: true,
  alpha: false,
  powerPreference: "high-performance" as const,
} satisfies THREE.WebGLRendererParameters;

const PARENT_GROUP_PROPS = {
  // Was [0,0,0] for an intro animation, but without that animation the model
  // stays permanently invisible.
  scale: [1, 1, 1] as const,
  position: [0, 0, 0] as const,
  rotation: [0, 0, 0] as const,
};

const VIDEO_TEXTURE_OPTS = {
  muted: true,
  loop: true,
  playsInline: true,
  crossOrigin: "anonymous",
  start: true,
};

function applyVideoTextureSettings(texture: THREE.VideoTexture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
}

type VideoBackgroundProps = {
  src?: string;
};

function HyperiuxGlassHeroVideoBackground({
  src = DEFAULT_VIDEO_SRC,
}: VideoBackgroundProps) {
  const { scene } = useThree();
  const texture = useVideoTexture(src, VIDEO_TEXTURE_OPTS);

  useEffect(() => {
    applyVideoTextureSettings(texture);

    const previousBackground = scene.background;
    // eslint-disable-next-line react-hooks/immutability -- scene.background is set imperatively for video backdrop
    scene.background = texture;

    const video = texture.image;
    if (!video) {
      return () => {
        scene.background = previousBackground;
      };
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      scene.background = previousBackground;
    };
  }, [scene, texture]);

  return null;
}

type ScrollOffsetInput = number | RefObject<number>;

type HyperiuxGlassHeroModelProps = {
  src?: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  thickness?: number;
  reflectivity?: number;
  cursorFollow?: boolean;
  cursorRotationStrength?: number;
  cursorRotationYLeftStrength?: number | null;
  cursorRotationYRightStrength?: number | null;
  cursorRotationXStrength?: number;
  cursorPositionStrength?: number;
  cursorLerp?: number;
  scrollTriggerSelector?: string;
  scrollMoveY?: number;
  enableScrollMove?: boolean;
  scrollOffset?: ScrollOffsetInput | null;
  scrollRotateY?: number;
  glassColor?: string;
  transmission?: number;
  glassThickness?: number;
  roughness?: number;
  ior?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  distortion?: number;
  distortionScale?: number;
  temporalDistortion?: number;
  backside?: boolean;
  transmissionBuffer?: THREE.Texture | null;
  externalGroupRef?: RefObject<THREE.Group | null> | null;
  introRotationOffsetRef?: RefObject<{ y: number } | null> | null;
  introRotationOffsetY?: number;
};

function HyperiuxGlassHeroModel({
  src = DEFAULT_MODEL_SRC,
  position = [0, 0, 3],
  rotation = [0, 0, 0],
  scale = 0.5,
  thickness = 1.45,
  reflectivity = 0,
  cursorFollow = false,
  cursorRotationStrength = 0.22,
  cursorRotationYLeftStrength = null,
  cursorRotationYRightStrength = null,
  cursorRotationXStrength = 0.5,
  cursorPositionStrength = 0.08,
  cursorLerp = 0.055,
  scrollTriggerSelector = ".container",
  scrollMoveY = 0.5,
  enableScrollMove = true,
  // When `scrollOffset` is provided (0..1), rotation will be derived from it.
  scrollOffset = null,
  scrollRotateY = -Math.PI * 2,
  glassColor = "#ffffff",
  transmission = 1,
  glassThickness = 1.35,
  roughness = 0.24,
  ior = 1.5,
  chromaticAberration = 0.12,
  anisotropy = 0.2,
  distortion = 0.1,
  distortionScale = 0.35,
  temporalDistortion = 0.06,
  backside = true,
  transmissionBuffer = null,
  externalGroupRef = null,
  introRotationOffsetRef = null,
  introRotationOffsetY = 0,
}: HyperiuxGlassHeroModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scrollOffsetRef = useRef(0);
  const scrollRotationYRef = useRef(0);
  const targetPointerRef = useRef(new THREE.Vector2(0, 0));
  const smoothPointerRef = useRef(new THREE.Vector2(0, 0));
  const localIntroRotationOffsetRef = useRef({ y: introRotationOffsetY });

  const { scene } = useGLTF(src);

  /* eslint-disable react-hooks/immutability -- Intro owns these refs for GSAP intro animation */
  useEffect(() => {
    if (introRotationOffsetRef) {
      introRotationOffsetRef.current = localIntroRotationOffsetRef.current;
    }
  }, [introRotationOffsetRef]);

  useEffect(() => {
    if (!externalGroupRef) return;

    externalGroupRef.current = groupRef.current;

    return () => {
      externalGroupRef.current = null;
    };
  }, [externalGroupRef]);
  /* eslint-enable react-hooks/immutability */

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.geometry?.computeVertexNormals();
    });
  }, [scene]);

  // Cursor interaction removed for Trial scene.

  useEffect(() => {
    if (!enableScrollMove) {
      scrollOffsetRef.current = 0;
      scrollRotationYRef.current = 0;
      return;
    }

    // If a scrollOffset is being driven externally (e.g. via ScrollControls),
    // skip ScrollTrigger wiring entirely.
    if (scrollOffset != null) return;

    let raf1 = 0;
    let raf2 = 0;
    let trigger: ScrollTrigger | undefined;

    const applyProgress = (progress: number) => {
      scrollOffsetRef.current = progress * scrollMoveY;
      scrollRotationYRef.current = progress * scrollRotateY;
    };

    const initScrollTrigger = () => {
      const triggerEl = document.querySelector(scrollTriggerSelector);
      if (!triggerEl) return;

      trigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      ScrollTrigger.refresh();
      applyProgress(trigger.progress);
    };

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        initScrollTrigger();
        ScrollTrigger.refresh();
      });
    });

    const handlePageShow = () => {
      ScrollTrigger.refresh();
      if (trigger) applyProgress(trigger.progress);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("load", handlePageShow);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("load", handlePageShow);
      trigger?.kill();
    };
  }, [
    enableScrollMove,
    scrollMoveY,
    scrollOffset,
    scrollRotateY,
    scrollTriggerSelector,
  ]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (cursorFollow) {
      smoothPointerRef.current.lerp(targetPointerRef.current, cursorLerp);
    }

    const pointerX = smoothPointerRef.current.x;
    const pointerY = smoothPointerRef.current.y;

    const leftStrength =
      cursorRotationYLeftStrength ?? cursorRotationStrength * 1.5;
    const rightStrength =
      cursorRotationYRightStrength ?? cursorRotationStrength * 1.5;

    const yRotationFromMouse =
      pointerX < 0 ? pointerX * leftStrength : pointerX * rightStrength;

    const introRotationOffsetYValue =
      localIntroRotationOffsetRef.current?.y ?? 0;

    const liveScrollOffset =
      scrollOffset == null
        ? null
        : typeof scrollOffset === "number"
          ? scrollOffset
          : scrollOffset?.current ?? 0;

    group.rotation.y =
      rotation[1] +
      (liveScrollOffset == null
        ? scrollRotationYRef.current
        : liveScrollOffset * scrollRotateY) +
      yRotationFromMouse +
      introRotationOffsetYValue;

    group.rotation.x =
      rotation[0] - pointerY * cursorRotationStrength * cursorRotationXStrength;
    group.rotation.z = rotation[2];

    group.position.x = position[0] + pointerX * cursorPositionStrength;
    group.position.y =
      position[1] +
      scrollOffsetRef.current +
      pointerY * cursorPositionStrength * 0.35;
    group.position.z = position[2];
  });

  return (
    <>
      {/* <Environment preset="city" /> */}

      <Float speed={1} floatIntensity={0.12} rotationIntensity={0.08}>
        <group
          ref={groupRef}
          position={position}
          rotation={rotation}
          scale={[scale, scale, scale * thickness]}
        >
          <Center>
            <Clone
              object={scene}
              inject={
                <MeshTransmissionMaterial
                  buffer={transmissionBuffer || undefined}
                  color={glassColor}
                  reflectivity={reflectivity}
                  transmission={transmission}
                  thickness={glassThickness}
                  roughness={roughness}
                  ior={ior}
                  chromaticAberration={chromaticAberration}
                  anisotropy={anisotropy}
                  distortion={distortion}
                  distortionScale={distortionScale}
                  temporalDistortion={temporalDistortion}
                  backside={backside}
                  samples={8}
                  resolution={512}
                  transparent
                  depthWrite={false}
                />
              }
            />
          </Center>
        </group>
      </Float>
    </>
  );
}

type HyperiuxGlassHeroSceneProps = {
  modelSrc?: string;
  videoSrc?: string;
  modelScale?: number;
  modelThickness?: number;
  modelPosition?: Vec3;
  modelRotation?: Vec3;
  modelGroupRef?: RefObject<THREE.Group | null> | null;
  parentModelGroupRef?: RefObject<THREE.Group | null> | null;
  modelIntroRotationOffsetRef?: RefObject<{ y: number } | null> | null;
};

type ScrollModelProps = {
  modelProps: HyperiuxGlassHeroModelProps;
  parentModelGroupRef: RefObject<THREE.Group | null> | null;
};

function ScrollModel({ modelProps, parentModelGroupRef }: ScrollModelProps) {
  const scroll = useScroll();
  const offsetRef = useRef(0);

  useFrame(() => {
    offsetRef.current = scroll.offset;
  });

  return (
    <group ref={parentModelGroupRef} {...PARENT_GROUP_PROPS}>
      <HyperiuxGlassHeroModel
        {...modelProps}
        scrollOffset={offsetRef}
        enableScrollMove={false}
      />
      <ambientLight intensity={4.25} />
    </group>
  );
}

export default function HyperiuxGlassHeroScene({
  modelSrc = DEFAULT_MODEL_SRC,
  videoSrc = DEFAULT_VIDEO_SRC,
  modelScale = 0.1,
  modelThickness = 0.45,
  modelPosition = [0, 0, 1.4],
  modelRotation = [0, 0, 0],
  modelGroupRef = null,
  parentModelGroupRef = null,
  modelIntroRotationOffsetRef = null,
}: HyperiuxGlassHeroSceneProps) {
  const modelProps: HyperiuxGlassHeroModelProps = {
    src: modelSrc,
    scale: modelScale,
    thickness: modelThickness,
    position: modelPosition,
    rotation: modelRotation,
    transmission: 1,
    glassThickness: 1.5,
    roughness: 0,
    ior: 1,
    cursorFollow: false,
    enableScrollMove: false,
    chromaticAberration: 1.5,
    distortion: 1.4,
    temporalDistortion: 0,
    externalGroupRef: modelGroupRef,
    introRotationOffsetRef: modelIntroRotationOffsetRef,
    introRotationOffsetY: -4,
  };

  return (
    <section className="absolute h-screen w-full overflow-hidden bg-black">
      <Canvas camera={CAMERA} gl={GL_CONFIG} dpr={[1, 1]}>
        <ScrollControls pages={4} damping={0.45}>
          <Suspense fallback={null}>
            <HyperiuxGlassHeroVideoBackground src={videoSrc} />
          </Suspense>

          <Suspense fallback={null}>
            <ScrollModel
              modelProps={modelProps}
              parentModelGroupRef={parentModelGroupRef}
            />
          </Suspense>
        </ScrollControls>
      </Canvas>
    </section>
  );
}

useGLTF.preload(DEFAULT_MODEL_SRC);


export { HyperiuxGlassHeroVideoBackground, HyperiuxGlassHeroModel };
