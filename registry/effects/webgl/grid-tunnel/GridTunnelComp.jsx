"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image, Preload } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

const TUNNEL_DEPTH = 90;
const TUNNEL_WIDTH = 18;
const TUNNEL_HEIGHT = 11;

const GRID_X = 8;
const GRID_Y = 5;
const GRID_Z = 36;

const VISIBLE_CHUNKS = 9;
const IMAGE_COUNT_PER_CHUNK = 50;

const CAMERA_START_Z = 18;
const TUNNEL_START_Z = 17;

const SCROLL_SPEED = 0.012;
const CAMERA_SMOOTHING = 0.08;
const SCROLL_DAMPING = 7; // higher = stops sooner
const CAMERA_FOLLOW = 10; // higher = follows target more tightly
const MAX_SCROLL_VELOCITY = 2.0;

function seededRandom(seed) {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function Line({ points }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(points.map((p) => new THREE.Vector3(...p)));
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#e5e5e5"
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </line>
  );
}

function GridChunkContent() {
  const lines = useMemo(() => {
    const items = [];

    const halfW = TUNNEL_WIDTH / 2;
    const halfH = TUNNEL_HEIGHT / 2;

    const cellW = TUNNEL_WIDTH / GRID_X;
    const cellH = TUNNEL_HEIGHT / GRID_Y;
    const cellD = TUNNEL_DEPTH / GRID_Z;

    for (let zi = 0; zi <= GRID_Z; zi++) {
      const z = -zi * cellD;

      items.push(
        { points: [[-halfW, halfH, z], [halfW, halfH, z]] },
        { points: [[-halfW, -halfH, z], [halfW, -halfH, z]] },
        { points: [[-halfW, -halfH, z], [-halfW, halfH, z]] },
        { points: [[halfW, -halfH, z], [halfW, halfH, z]] }
      );
    }

    for (let xi = 0; xi <= GRID_X; xi++) {
      const x = -halfW + xi * cellW;

      items.push(
        { points: [[x, halfH, 0], [x, halfH, -TUNNEL_DEPTH]] },
        { points: [[x, -halfH, 0], [x, -halfH, -TUNNEL_DEPTH]] }
      );
    }

    for (let yi = 0; yi <= GRID_Y; yi++) {
      const y = -halfH + yi * cellH;

      items.push(
        { points: [[-halfW, y, 0], [-halfW, y, -TUNNEL_DEPTH]] },
        { points: [[halfW, y, 0], [halfW, y, -TUNNEL_DEPTH]] }
      );
    }

    return items;
  }, []);

  return (
    <>
      {lines.map((line, index) => (
        <Line key={index} points={line.points} />
      ))}
    </>
  );
}

function ImageChunkContent({ images, slotIndex }) {
  const { viewport, size } = useThree();
  const canvasWidth = size?.width ?? 0;

  const panels = useMemo(() => {
    const random = seededRandom(200 + slotIndex * 13);

    const halfW = TUNNEL_WIDTH / 2;
    const halfH = TUNNEL_HEIGHT / 2;

    const cellW = TUNNEL_WIDTH / GRID_X;
    const cellH = TUNNEL_HEIGHT / GRID_Y;
    const cellD = TUNNEL_DEPTH / GRID_Z;

    const pxToWorld = canvasWidth ? viewport.width / canvasWidth : 0.01;

    // Reduce padding on smaller screens so images read larger on mobile.
    const paddingPx = canvasWidth
      ? canvasWidth < 640
        ? 4
        : canvasWidth < 1024
          ? 8
          : 10
      : 10;
    const paddingWorld = pxToWorld * paddingPx;

    return Array.from({ length: IMAGE_COUNT_PER_CHUNK }).map((_, i) => {
      const side = Math.floor(random() * 4);
      const zi = Math.floor(random() * (GRID_Z - 2));

      let position = [0, 0, 0];
      let rotation = [0, 0, 0];
      let scale = [1, 1, 1];

      if (side === 0) {
        const yi = Math.floor(random() * GRID_Y);
        const y = -halfH + yi * cellH + cellH / 2;
        const z = -zi * cellD - cellD / 2;

        position = [-halfW + 0.035, y, z];
        rotation = [0, Math.PI / 2, 0];

        scale = [
          Math.max(cellD - paddingWorld * 2, 0.2),
          Math.max(cellH - paddingWorld * 2, 0.2),
          1,
        ];
      }

      if (side === 1) {
        const yi = Math.floor(random() * GRID_Y);
        const y = -halfH + yi * cellH + cellH / 2;
        const z = -zi * cellD - cellD / 2;

        position = [halfW - 0.035, y, z];
        rotation = [0, -Math.PI / 2, 0];

        scale = [
          Math.max(cellD - paddingWorld * 2, 0.2),
          Math.max(cellH - paddingWorld * 2, 0.2),
          1,
        ];
      }

      if (side === 2) {
        const xi = Math.floor(random() * GRID_X);
        const x = -halfW + xi * cellW + cellW / 2;
        const z = -zi * cellD - cellD / 2;

        position = [x, -halfH + 0.035, z];
        rotation = [-Math.PI / 2, 0, 0];

        scale = [
          Math.max(cellW - paddingWorld * 2, 0.2),
          Math.max(cellD - paddingWorld * 2, 0.2),
          1,
        ];
      }

      if (side === 3) {
        const xi = Math.floor(random() * GRID_X);
        const x = -halfW + xi * cellW + cellW / 2;
        const z = -zi * cellD - cellD / 2;

        position = [x, halfH - 0.035, z];
        rotation = [Math.PI / 2, 0, 0];

        scale = [
          Math.max(cellW - paddingWorld * 2, 0.2),
          Math.max(cellD - paddingWorld * 2, 0.2),
          1,
        ];
      }

      return {
        id: `${slotIndex}-${i}`,
        url: images[(slotIndex * IMAGE_COUNT_PER_CHUNK + i) % images.length],
        position,
        rotation,
        scale,
      };
    });
  }, [canvasWidth, images, slotIndex, viewport.width]);

  return (
    <>
      {panels.map((panel) => (
        <Suspense key={panel.id} fallback={null}>
          <Image
            alt="panel"
            url={panel.url}
            position={panel.position}
            rotation={panel.rotation}
            scale={panel.scale}
            toneMapped={false}
          />
        </Suspense>
      ))}
    </>
  );
}

function TunnelChunk({ images, slotIndex }) {
  const group = useRef();
  const { camera } = useThree();

  const initialZ = TUNNEL_START_Z - slotIndex * TUNNEL_DEPTH;
  const totalLoopDepth = TUNNEL_DEPTH * VISIBLE_CHUNKS;

  useFrame(() => {
    if (!group.current) return;

    const chunk = group.current;
    const cameraZ = camera.position.z;

    // Keep each chunk positioned near the camera using a stable wrap calculation.
    // This avoids visible"pops" when a chunk is recycled.
    const loops = Math.round((cameraZ - initialZ) / totalLoopDepth);
    const nextZ = initialZ + loops * totalLoopDepth;

    // Only apply when it meaningfully changes to avoid tiny float churn.
    if (Math.abs(chunk.position.z - nextZ) > 0.0001) {
      chunk.position.z = nextZ;
    }
  });

  return (
    <group ref={group} position={[0, 0, initialZ]}>
      <GridChunkContent />
      <ImageChunkContent images={images} slotIndex={slotIndex} />
    </group>
  );
}

function InfiniteTunnelWorld({ images }) {
  const chunks = useMemo(() => {
    return Array.from({ length: VISIBLE_CHUNKS }, (_, i) => i);
  }, []);

  return (
    <>
      {chunks.map((slotIndex) => (
        <TunnelChunk key={slotIndex} images={images} slotIndex={slotIndex} />
      ))}
    </>
  );
}

function InfiniteScrollCamera() {
  const { camera } = useThree();
  const cameraRef = useRef(null);
  const targetZ = useRef(CAMERA_START_Z);
  const scrollVelocity = useRef(0);
  const touchState = useRef({
    active: false,
    lastY: 0,
  });

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useEffect(() => {
    const preventPageScroll = (event) => {
      event.preventDefault();

      // Accumulate velocity for a smoother inertial scroll feel.
      scrollVelocity.current += -event.deltaY * SCROLL_SPEED;
      scrollVelocity.current = THREE.MathUtils.clamp(
        scrollVelocity.current,
        -MAX_SCROLL_VELOCITY,
        MAX_SCROLL_VELOCITY
      );

      if (targetZ.current > CAMERA_START_Z) {
        targetZ.current = CAMERA_START_Z;
      }
    };

    const onTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      touchState.current.active = true;
      touchState.current.lastY = touch.clientY;
    };

    const onTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (!touch || !touchState.current.active) return;

      event.preventDefault();

      const deltaY = touch.clientY - touchState.current.lastY;
      touchState.current.lastY = touch.clientY;

      scrollVelocity.current += deltaY * SCROLL_SPEED;
      scrollVelocity.current = THREE.MathUtils.clamp(
        scrollVelocity.current,
        -MAX_SCROLL_VELOCITY,
        MAX_SCROLL_VELOCITY
      );

      if (targetZ.current > CAMERA_START_Z) {
        targetZ.current = CAMERA_START_Z;
      }
    };

    const onTouchEnd = () => {
      touchState.current.active = false;
    };

    window.addEventListener("wheel", preventPageScroll, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", preventPageScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  useFrame((_, delta) => {
    const cam = cameraRef.current;
    if (!cam) return;

    cam.position.x = 0;
    cam.position.y = 0;

    // Decay velocity so the tunnel eases out after scrolling stops.
    const damping = Math.exp(-SCROLL_DAMPING * delta);
    scrollVelocity.current *= damping;

    // Integrate velocity into the target.
    targetZ.current += scrollVelocity.current;

    // Clamp start (no"pulling" past the start).
    if (targetZ.current > CAMERA_START_Z) {
      targetZ.current = CAMERA_START_Z;
      scrollVelocity.current = 0;
    }

    // Frame-rate independent follow lerp.
    const follow = 1 - Math.exp(-CAMERA_FOLLOW * delta);
    cam.position.z = THREE.MathUtils.lerp(
      cam.position.z,
      targetZ.current,
      follow
    );

    cam.lookAt(0, 0, cam.position.z - 12);
  });

  return null;
}

function Scene({ images }) {
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <fog attach="fog" args={["#ffffff", 22, 92]} />

      <ambientLight intensity={2.4} />

      <InfiniteScrollCamera />
      <InfiniteTunnelWorld images={images} />
    </>
  );
}




function FooterMark() {
  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-20 text-xs font-medium text-neutral-400">
      © 2026 Hyperiux.
    </div>
  );
}

export default function GridTunnelComp({ images = [] }) {
  const fallbackImages = [
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-03.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-04.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-06.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-07.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-09.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-03.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-04.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-06.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-07.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-09.jpg",
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg",
  ];
  // Validate image URLs on the client before passing to the three.js Image loader.
  // This prevents CORS/network failures from flooding the loader with bad URLs.
  const [validatedImages, setValidatedImages] = useState([]);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    let mounted = true;
    const list = images && images.length > 0 ? images : fallbackImages;

    const validateUrl = (url) =>
      new Promise((res) => {
        try {
          const img = new window.Image();
          // Attempt anonymous CORS fetch so we can detect CORS failures.
          img.crossOrigin = "anonymous";

          let settled = false;
          const onSuccess = () => {
            if (settled) return;
            settled = true;
            cleanup();
            res({ ok: true, url });
          };
          const onFail = () => {
            if (settled) return;
            settled = true;
            cleanup();
            res({ ok: false, url });
          };

          const timeout = setTimeout(onFail, 8000);
          const cleanup = () => {
            clearTimeout(timeout);
            img.onload = null;
            img.onerror = null;
          };

          img.onload = onSuccess;
          img.onerror = onFail;
          img.src = url;
        } catch (e) {
          res({ ok: false, url });
        }
      });

    (async () => {
      try {
        const results = await Promise.allSettled(list.map((u) => validateUrl(u)));
        const valids = results
          .filter((r) => r.status === "fulfilled" && r.value && r.value.ok)
          .map((r) => r.value.url);

        if (!mounted) return;
        setValidatedImages(valids);
      } finally {
        if (mounted) setValidating(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [images]);

  const imageList = !validating && validatedImages && validatedImages.length > 0 ? validatedImages : images.length > 0 ? images : fallbackImages;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <Canvas
        aria-hidden="true"
        camera={{
          position: [0, 0, CAMERA_START_Z],
          fov: 72,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          // Avoid a black flash on reload before the scene background is applied.
          gl.setClearColor("#ffffff", 1);
        }}
      >
        <Scene images={imageList} />
        <Preload all />
      </Canvas>
       <FooterMark />
    </section>
  );
}
