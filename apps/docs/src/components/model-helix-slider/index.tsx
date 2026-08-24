"use client";

import { Suspense, type RefObject, useMemo, useRef, useState } from "react";
import {
  Canvas,
  extend,
  type ThreeElement,
  type ThreeElements,
  type ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import {
  ScrollControls,
  Text,
  useScroll,
  useTexture,
  useCursor,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { Vector3 } from "three";
import "./util";
import Lights from "./Lights";
import data from "./data";
import { useRouter } from "next/navigation";
import {
  HyperiuxGlassHeroModel,
  HyperiuxGlassHeroVideoBackground,
} from "./MyModel";

const DEFAULT_VIDEO_SRC = "/assets/models/bg-video.mp4";
const DEFAULT_MODEL_SRC = "/models/hyperiux-logo.glb";
const FONT_SRC = "/assets/fonts/Aeonik-Regular.woff2";

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
export const TEXT_POSITION_ARRAYS = {
  desktop: [
    { index: 1, title: [-1.3, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 2, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 3, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 4, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 5, title: [-0.5, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 6, title: [-0.1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 7, title: [-0.8, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 8, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 9, title: [-0.8, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 10, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 11, title: [-0.7, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 12, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 13, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 14, title: [-0.8, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 15, title: [-0.8, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 16, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 17, title: [-0.8, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 18, title: [-1, 1.9, 0], id: [-2, 4.9, 0] },
    { index: 19, title: [-0.9, 1.9, 0], id: [-2, 4.9, 0] },
  ],
} as const;

type Vec3 = [number, number, number];

type TextPosition = {
  readonly index: number;
  readonly title: readonly [number, number, number];
  readonly id: readonly [number, number, number];
};

type CarouselUniforms = {
  uTime: THREE.IUniform<number>;
  uScrollSpeed: THREE.IUniform<number>;
  uScrollDirection: THREE.IUniform<number>;
  uColor: THREE.IUniform<THREE.Color>;
  uHighlight: THREE.IUniform<number>;
  uTexture: THREE.IUniform<THREE.Texture | null>;
  uHover: THREE.IUniform<number>;
  uTransition: THREE.IUniform<number>;
  uCornerRadius: THREE.IUniform<number>;
  uZoom: THREE.IUniform<number>;
  uParallax: THREE.IUniform<number>;
  uLeave: THREE.IUniform<number>;
};

const vertexShader = `
  uniform float uTime, uScrollSpeed, uScrollDirection, uHover, uTransition;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vec3 pos = position;

    float scrollWaveFreq   = 0.5;
    float scrollWaveAmp    = 2.0;
    float scrollWave       = sin(pos.y * scrollWaveFreq + uTime * 0.5) * scrollWaveAmp * uScrollSpeed;
    float scrollEase       = 1.0 - exp(-5.0 * abs(uScrollDirection));
    float smoothScrollWave = scrollWave * scrollEase * uScrollDirection;

    float curveFreq   = 0.3;
    float curveAmp    = 0.2;
    float baseCurve   = sin(pos.y * curveFreq) * uScrollSpeed * curveAmp;
    float curveMask   = smoothstep(0.0, 1.0, abs(uScrollDirection));
    float smoothCurve = baseCurve * curveMask * uScrollDirection;

    pos.x += smoothScrollWave + smoothCurve;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform vec3      uColor;
  uniform float     uHighlight, uScrollSpeed, uHover, uTransition;
  uniform sampler2D uTexture;
  uniform float     uCornerRadius;
  uniform float     uZoom;
  uniform float     uParallax;
  uniform float     uTime;
  uniform float     uLeave;

  float roundedBoxSDF(vec2 uv, float radius) {
    vec2 centered = uv - 0.5;
    centered.x   *= (4.5 / 2.5);
    vec2 q        = abs(centered) - vec2(0.5 * (4.5 / 2.5), 0.5) + radius;
    return length(max(q, 0.0)) - radius;
  }

  void main() {
    vec2 scaledUv    = (vUv - 0.5) / uZoom + 0.5;
    float halfMargin = (1.0 - 1.0 / uZoom) * 0.5;
    float shift      = uParallax * halfMargin;
    vec2  parallaxUv = scaledUv + vec2(0.0, shift);

    vec4  texColor  = texture2D(uTexture, parallaxUv);
    float grayscale = dot(texColor.rgb, vec3(0.199, 0.287, 0.214));
    vec3  bwColor   = vec3(grayscale);

    float cornerDist       = distance(vUv, vec2(0.0, 1.0));
    float transitionEdge   = smoothstep(uTransition - 0.5, uTransition + 1.1, cornerDist);
    float smoothTransition = smoothstep(0.0, 0.3, uTransition);
    transitionEdge         = mix(1.0, transitionEdge, smoothTransition);

    float distortionFactor = sin(vPosition.x * 2.0 + cornerDist) * uScrollSpeed;
    vec3  color            = uColor + distortionFactor * 0.2;
    color                 *= (1.0 - vPosition.z * 0.15);

    float sweepProgress = uTime / 6.28;
    float fastProgress  = sweepProgress * 2.0;

    // Enter: top-left → bottom-right  (diagonal = 1 - y + x, band -1.3 → 2.3)
    float diagonalEnter   = 1.0 - vUv.y + vUv.x;
    float bandCenterEnter = mix(-1.3, 2.3, clamp(fastProgress, 0.0, 1.0));

    // Leave: bottom-right → top-left  (diagonal flipped: y - x, band 2.3 → -1.3)
    float diagonalLeave   = vUv.y - vUv.x;
    float bandCenterLeave = mix(-1.3, 2.3, clamp(fastProgress, 0.0, 1.0));

    float diagonal   = mix(diagonalEnter, diagonalLeave, uLeave);
    float bandCenter = mix(bandCenterEnter, bandCenterLeave, uLeave);

    float shinePhase = diagonal - bandCenter;
    float shineBand  = exp(-shinePhase * shinePhase * 10.0);
    float phaseAlive = step(fastProgress, 1.0);

    // Enter: behind wave (shinePhase < 0) → colored
    // Leave: behind wave (shinePhase < 0) → b&w  (invert)
    float revealEdge      = smoothstep(0.15, -0.10, shinePhase);
    float revealEdgeFinal = mix(revealEdge, 1.0 - revealEdge, uLeave);

    float revealMix    = revealEdgeFinal * uTransition;
    vec3  finalTexColor = mix(bwColor, texColor.rgb, revealMix);

    float shine      = shineBand * uTransition * phaseAlive * 0.25;
    vec3  shineColor = finalTexColor * color + vec3(shine);

    float sdf   = roundedBoxSDF(vUv, uCornerRadius);
    float alpha = step(sdf, 0.0) * texColor.a;

    gl_FragColor = vec4(shineColor, alpha);
  }
`;

/* -------------------- Custom Material -------------------- */
class CarouselMaterial extends THREE.ShaderMaterial {
  declare uniforms: CarouselUniforms;

  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uScrollSpeed: { value: 0 },
        uScrollDirection: { value: 0 },
        uColor: { value: new THREE.Color("#ffffff") },
        uHighlight: { value: 0.0 },
        uTexture: { value: null },
        uHover: { value: 0.0 },
        uTransition: { value: 1.0 },
        uCornerRadius: { value: 0.06 },
        uZoom: { value: 1.25 },
        uParallax: { value: 0.0 },
        uLeave: { value: 0.0 },
      } satisfies CarouselUniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }
}

extend({ CarouselMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    carouselMaterial: ThreeElement<typeof CarouselMaterial>;
  }
}

/* -------------------- Parallax helper -------------------- */
// Viewport-trigger-based parallax:
// Each card's texture only moves while the card itself is travelling through
// the visible viewport. Cards waiting below start pinned at +PARALLAX_INTENSITY
// (texture bottom) and only start animating once they enter the screen.
//
//   cardWorldY > +visibleHalf  → not yet on screen (below) → scrubT = 0  → +PARALLAX (texture bottom)
//   cardWorldY =  0            → card centred on screen    → scrubT = 0.5 → 0        (texture centre)
//   cardWorldY < -visibleHalf  → scrolled off above        → scrubT = 1  → -PARALLAX (texture top)

// The mesh is rendered at position [0, 3.3, 0] inside the card group, so the
// visual centre of the card is cardWorldY + 3.3. Subtract that offset so that
// parallax = 0 when the card's actual face is at the viewport centre.
const MESH_Y_OFFSET = 3.3;

function computeParallax(
  cardWorldY: number,
  visibleHalf: number,
  parallaxIntensity: number,
) {
  const visualCenterY = cardWorldY + MESH_Y_OFFSET;
  const scrubT = THREE.MathUtils.clamp(
    (visibleHalf - visualCenterY) / (2 * visibleHalf),
    0,
    1,
  );
  return -(scrubT * 2 - 1) * parallaxIntensity;
}

/* -------------------- Parallax pre-seed helper -------------------- */
// Cards below the viewport at load time are pinned to +PARALLAX_INTENSITY so
// there is no pop when they first enter the screen. Card 0 is already centred.
function computeInitialParallax(cardIndex: number) {
  const FOV_DEG = 15;
  const CAM_DIST = 35;
  const VISIBLE_HALF_MULT = 1.4;
  const PARALLAX_INTENSITY = 2.5;
  const START_Y = -2.65;
  const SCROLL_FACTOR = -2.17;

  const fovRad = THREE.MathUtils.degToRad(FOV_DEG);
  const visibleHalf = Math.tan(fovRad * 0.5) * CAM_DIST * VISIBLE_HALF_MULT;

  const cardWorldY = START_Y + cardIndex * SCROLL_FACTOR;

  // Card is below the viewport at start → pin to entry value (texture at bottom)
  if (cardWorldY + MESH_Y_OFFSET < -visibleHalf) return PARALLAX_INTENSITY;

  return computeParallax(cardWorldY, visibleHalf, PARALLAX_INTENSITY);
}

/* -------------------- Rig -------------------- */
function Rig(props: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = -scroll.offset * Math.PI * 24.95 * 0.4;
    ref.current.position.y = THREE.MathUtils.lerp(0, 0.1, scroll.offset * 9.3);
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={ref} {...props} />;
}

/* -------------------- Carousel -------------------- */
function Carousel() {
  const [posy] = useState<number>(8.5);
  const [roty] = useState<number>(-12.565);
  const scroll = useScroll();
  const groupRefs = useMemo<Array<THREE.Group | null>>(() => [], []);

  const dimensions = {
    width: 4.5,
    height: 2.5,
    depth: 0,
    textSize: 0.3,
    radius: 5,
    factor: 10.5,
    scrollFactor: -2.5,
  };

  const cardWorldYRefs = useMemo<number[]>(
    () => new Array(data.length).fill(0),
    [],
  );

  useFrame(() => {
    const progress = scroll.offset;
    const startY = -2.7;
    const endY = 41.2;

    groupRefs.forEach((ref, i) => {
      if (!ref) return;
      const baseY = THREE.MathUtils.lerp(startY, endY, progress);
      ref.position.y = baseY + i * dimensions.scrollFactor;
      cardWorldYRefs[i] = ref.position.y;
    });
  });

  return data.map((plane, i) => {
    const cardPosition: Vec3 = [
      Math.sin((i / data.length) * Math.PI * dimensions.factor) *
        dimensions.radius,
      0,
      Math.cos((i / data.length) * Math.PI * dimensions.factor) *
        dimensions.radius,
    ];
    const cardRotation: Vec3 = [
      0,
      Math.PI * 2 + (i / data.length) * Math.PI * dimensions.factor,
      0,
    ];
    const cardDimensions: Vec3 = [
      dimensions.width,
      dimensions.height,
      dimensions.depth,
    ];

    return (
      <group
        key={plane.id}
        ref={(el) => {
          groupRefs[i] = el;
        }}
        rotation={[0, roty, 0]}
        position={[0, posy, 0]}
      >
        <Suspense
          fallback={
            <CardPlaceholder
              text={plane.title}
              id={i + 1}
              cardIndex={i}
              dimensions={cardDimensions}
              textSize={dimensions.textSize}
              position={cardPosition}
              rotation={cardRotation}
            />
          }
        >
          <Card
            url={plane.src}
            text={plane.title}
            link={plane.href}
            id={i + 1}
            cardIndex={i}
            dimensions={cardDimensions}
            textSize={dimensions.textSize}
            cardWorldYRef={cardWorldYRefs}
            position={cardPosition}
            rotation={cardRotation}
          />
        </Suspense>
      </group>
    );
  });
}

type CardProps = ThreeElements["group"] & {
  url: string;
  text: string;
  link?: string;
  id?: number;
  cardIndex?: number;
  dimensions?: Vec3;
  textSize?: number;
  cardWorldYRef: number[];
};

type CardPlaceholderProps = ThreeElements["group"] & {
  text: string;
  id: number;
  cardIndex: number;
  dimensions: Vec3;
  textSize: number;
};

function CardPlaceholder({
  text,
  id,
  cardIndex,
  dimensions,
  textSize,
  ...props
}: CardPlaceholderProps) {
  const deviceList = TEXT_POSITION_ARRAYS.desktop;
  const textPositions =
    cardIndex < deviceList.length
      ? deviceList[cardIndex]
      : deviceList[deviceList.length - 1];

  return (
    <group {...props}>
      <mesh position={[0, 3.3, 0.04]}>
        <planeGeometry args={[dimensions[0], dimensions[1], 1, 1]} />
        <meshBasicMaterial color="#ff5f00" side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[
          textPositions.title[0],
          textPositions.title[1],
          textPositions.title[2] + 0.08,
        ]}
        fontSize={textSize}
        color="white"
        fontWeight="bold"
        anchorX="center"
        anchorY="top"
        font={FONT_SRC}
        material-side={THREE.DoubleSide}
      >
        {text.toUpperCase()}
      </Text>
      <Text
        position={[
          textPositions.id[0],
          textPositions.id[1],
          textPositions.id[2] + 0.08,
        ]}
        fontSize={0.2}
        color="white"
        fontWeight="bold"
        anchorX="center"
        anchorY="top"
        font={FONT_SRC}
        material-side={THREE.DoubleSide}
      >
        {`[${id}]`}
      </Text>
    </group>
  );
}

function Card({
  url,
  text,
  link,
  id,
  cardIndex = 0,
  dimensions = [0.4, 3.5, 0],
  textSize = 0.2,
  cardWorldYRef,
  ...props
}: CardProps) {
  const router = useRouter();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<CarouselMaterial>(null);
  const texture = useTexture(url);

  const titleRef = useRef<THREE.Mesh>(null);
  const idRef = useRef<THREE.Mesh>(null);
  const [hovered, hover] = useState(false);
  useCursor(hovered, "pointer", "auto");

  const scroll = useScroll();
  const lastScrollOffset = useRef(0);
  const animationStartTime = useRef(0);
  // "enter" | "leave" | "idle"
  const animationPhase = useRef<"enter" | "leave" | "idle">("idle");

  const PARALLAX_INTENSITY = 2.5;

  const scrubParallax = useRef(computeInitialParallax(cardIndex));

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!link) return;
    router.push(link);
  };

  const pointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(true);
    animationStartTime.current = 0;
    animationPhase.current = "enter";
  };

  const pointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(false);
    animationStartTime.current = 0;
    animationPhase.current = "leave";
  };

  useFrame((state, delta) => {
    if (materialRef.current) {
      const currentOffset = scroll.offset;
      const scrollDelta = currentOffset - lastScrollOffset.current;
      const scrollSpeed = Math.abs(scrollDelta / Math.max(delta, 1e-4));

      const phase = animationPhase.current;

      if (phase === "enter" || phase === "leave") {
        if (animationStartTime.current < Math.PI * 2) {
          animationStartTime.current += delta * 5;
          materialRef.current.uniforms.uTime.value = animationStartTime.current;
        } else {
          animationPhase.current = "idle";
        }
      }

      if (phase === "enter") materialRef.current.uniforms.uLeave.value = 0.0;
      if (phase === "leave") materialRef.current.uniforms.uLeave.value = 1.0;

      materialRef.current.uniforms.uTexture.value = texture;
      materialRef.current.uniforms.uHover.value = hovered ? 1.0 : 0.0;

      if (phase === "leave") {
        materialRef.current.uniforms.uTransition.value = 1.0;
      } else {
        materialRef.current.uniforms.uTransition.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uTransition.value,
          1.0,
          0.1,
        );
      }

      materialRef.current.uniforms.uScrollSpeed.value = scrollSpeed;
      materialRef.current.uniforms.uScrollDirection.value =
        Math.sign(scrollDelta);

      const camera = state.camera as THREE.PerspectiveCamera;
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      const camDist = state.camera.position.z;
      const visibleHalf = Math.tan(fovRad * 0.5) * camDist * 1.4;

      const cardWorldY = cardWorldYRef[cardIndex] ?? 0;

      const parallaxTarget = computeParallax(
        cardWorldY,
        visibleHalf,
        PARALLAX_INTENSITY,
      );

      scrubParallax.current = THREE.MathUtils.lerp(
        scrubParallax.current,
        parallaxTarget,
        0.3,
      );

      materialRef.current.uniforms.uParallax.value = scrubParallax.current;

      lastScrollOffset.current = currentOffset;
    }
  });

  const getTextPosition = (): TextPosition => {
    const deviceList = TEXT_POSITION_ARRAYS.desktop;
    if (cardIndex < deviceList.length) return deviceList[cardIndex];
    return deviceList[deviceList.length - 1];
  };
  const textPositions = getTextPosition();

  return (
    <group ref={groupRef} {...props}>
      <mesh
        position={[0, 3.3, 0.04]}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[dimensions[0], dimensions[1], 1, 1]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[0, 3.3, 0]}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[dimensions[0], dimensions[1], 150, 150]} />
        <carouselMaterial ref={materialRef} />
      </mesh>

      <Text
        ref={titleRef}
        position={[
          textPositions.title[0],
          textPositions.title[1],
          textPositions.title[2] + 0.08,
        ]}
        fontSize={textSize}
        color="white"
        fontWeight="bold"
        anchorX="center"
        anchorY="top"
        font={FONT_SRC}
        material-side={THREE.DoubleSide}
      >
        {text?.toUpperCase?.() || ""}
      </Text>

      <Text
        ref={idRef}
        position={[
          textPositions.id[0],
          textPositions.id[1],
          textPositions.id[2] + 0.08,
        ]}
        fontSize={0.2}
        color="white"
        fontWeight="bold"
        anchorX="center"
        anchorY="top"
        font={FONT_SRC}
        material-side={THREE.DoubleSide}
      >
        {id != null ? `[${id}]` : ""}
      </Text>
    </group>
  );
}

type ModelHelixSliderProps = {
  modelSrc?: string;
  videoSrc?: string;
  modelScale?: number;
  modelThickness?: number;
  modelPosition?: Vec3;
  modelRotation?: Vec3;
  modelGroupRef?: RefObject<THREE.Group | null> | null;
  modelIntroRotationOffsetRef?: RefObject<{ y: number } | null> | null;
};

type ModelHelixSceneContentProps = Required<ModelHelixSliderProps>;

function ModelHelixSceneContent({
  modelSrc,
  videoSrc,
  modelScale,
  modelThickness,
  modelPosition,
  modelRotation,
  modelGroupRef,
  modelIntroRotationOffsetRef,
}: ModelHelixSceneContentProps) {
  const scroll = useScroll();
  const offsetRef = useRef(0);

  useFrame(() => {
    offsetRef.current = scroll.offset;
  });

  const modelProps = {
    src: modelSrc,
    scale: modelScale,
    thickness: modelThickness,
    position: modelPosition,
    rotation: modelRotation,
    transmission: 1,
    glassThickness: 1.5,
    roughness: 0.05,
    ior: 1.6,
    cursorFollow: false,
    enableScrollMove: false,
    chromaticAberration: 1.2,
    anisotropy: 0.5,
    distortion: 0.8,
    temporalDistortion: 0,
    externalGroupRef: modelGroupRef,
    introRotationOffsetRef: modelIntroRotationOffsetRef,
    introRotationOffsetY: -4,
  };

  return (
    <>
      <Suspense fallback={null}>
        <HyperiuxGlassHeroVideoBackground src={videoSrc} />
      </Suspense>

      <Suspense fallback={null}>
        <group {...PARENT_GROUP_PROPS}>
          <HyperiuxGlassHeroModel {...modelProps} scrollOffset={offsetRef} />
        </group>
      </Suspense>
      <ambientLight intensity={2} />
      <pointLight position={[5, 5, 5]} intensity={80} color="#ffffff" />
      <pointLight position={[-5, 3, 2]} intensity={60} color="#4488ff" />
      <pointLight position={[0, -4, 4]} intensity={40} color="#ff88ff" />
      <spotLight
        position={[0, 8, 4]}
        intensity={120}
        angle={0.4}
        penumbra={0.8}
        color="#ffffff"
      />
      <directionalLight position={[3, 5, 2]} intensity={8} color="#ffffff" />

      <Suspense fallback={null}>
        <Rig>
          <Carousel />
        </Rig>
      </Suspense>
    </>
  );
}

/* -------------------- Main Scene -------------------- */
const ModelHelixSlider = ({
  modelSrc = DEFAULT_MODEL_SRC,
  videoSrc = DEFAULT_VIDEO_SRC,
  modelScale = 0.2,
  modelThickness = 1.45,
  modelPosition = [0, 0.5, 1.4],
  modelRotation = [0, 0, 0],
  modelGroupRef = null,
  modelIntroRotationOffsetRef = null,
}: ModelHelixSliderProps) => {
  const sceneProps: ModelHelixSceneContentProps = {
    modelSrc,
    videoSrc,
    modelScale,
    modelThickness,
    modelPosition,
    modelRotation,
    modelGroupRef,
    modelIntroRotationOffsetRef,
  };

  return (
    <Canvas
      className="homescreenCanvas opacity-100 z-[10] bg-transparent"
      camera={{ position: [0, 0, 35], fov: 15 }}
      gl={GL_CONFIG}
      dpr={[1, 1]}
      style={{
        width: "100vw",
        height: "120vh",
        position: "fixed",
        top: "0",
        left: "0",
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      <ScrollControls pages={12} damping={0.45}>
        <ModelHelixSceneContent {...sceneProps} />
      </ScrollControls>

      <ambientLight intensity={4.25} />
      <Lights
        lights={{
          position: new Vector3(3.87, -3.73, 1.93),
          intensity: 10.0,
          angle: 0.22,
          distance: 20.0,
          penumbra: 1.0,
          decay: 0.0,
          color: "#000FFF",
        }}
      />
      <Environment preset="city" />
    </Canvas>
  );
};

export default ModelHelixSlider;
