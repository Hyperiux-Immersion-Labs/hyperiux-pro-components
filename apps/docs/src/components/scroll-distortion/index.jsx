"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

const ImageDistortionVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ImageDistortionFragment = `
  uniform sampler2D u_texture0;
  uniform sampler2D u_texture1;
  uniform sampler2D u_displacement;
  uniform float u_progress;
  uniform float u_strength;
  uniform float u_rgbShift;
  uniform float u_scale;
  uniform vec2 u_resolution;
  uniform vec2 u_textureResolution0;
  uniform vec2 u_textureResolution1;

  varying vec2 vUv;

  vec2 coverUV(vec2 uv, vec2 planeRes, vec2 texRes) {
    float scale = max(planeRes.x / texRes.x, planeRes.y / texRes.y);
    vec2 newSize = texRes * scale;
    return uv * (planeRes / newSize) + (newSize - planeRes) / 2.0 / newSize;
  }

  void main() {
    float disp = texture2D(u_displacement, vUv).r;

    disp = mix(
      disp,
      disp * (sin(vUv.y * 10.0 + u_progress * 6.28) * 0.5 + 0.5),
      0.3
    );

    vec2 uv0 = coverUV(vUv, u_resolution, u_textureResolution0);
    vec2 uv1 = coverUV(vUv, u_resolution, u_textureResolution1);

    float scaleEffect = 1.0 + u_progress * (1.0 - u_progress) * u_scale;
    vec2 center = vec2(0.5);

    vec2 distortedUV0 =
      (uv0 - center) / scaleEffect +
      center +
      u_progress * disp * u_strength * vec2(1.0, 0.5);

    vec2 distortedUV1 =
      (uv1 - center) * scaleEffect +
      center -
      (1.0 - u_progress) * disp * u_strength * vec2(1.0, 0.5);

    float rgbOffset = u_progress * (1.0 - u_progress) * u_rgbShift;

    vec4 tex0 = vec4(
      texture2D(u_texture0, distortedUV0 + vec2(rgbOffset, 0.0)).r,
      texture2D(u_texture0, distortedUV0).g,
      texture2D(u_texture0, distortedUV0 - vec2(rgbOffset, 0.0)).b,
      texture2D(u_texture0, distortedUV0).a
    );

    vec4 tex1 = vec4(
      texture2D(u_texture1, distortedUV1 + vec2(rgbOffset, 0.0)).r,
      texture2D(u_texture1, distortedUV1).g,
      texture2D(u_texture1, distortedUV1 - vec2(rgbOffset, 0.0)).b,
      texture2D(u_texture1, distortedUV1).a
    );

    gl_FragColor = mix(tex0, tex1, smoothstep(0.0, 1.0, u_progress));
  }
`;

const DEFAULT_SECTIONS = [
  {
    text: "SHADOW",
    src: "/assets/img/image01.webp",
  },
  {
    text: "FLOWER",
    src: "/assets/img/image02.webp",
  },
  {
    text: "RUN!!",
    src: "/assets/img/image03.webp",
  },
];

const DEFAULT_SHADER_CONFIG = {
  strength: 0.8,
  rgbShift: 0.05,
  scale: 0.15,
  transitionDuration: 1.25,
  transitionEase: "power3.inOut",
};

const MAX_PIXEL_RATIO = 2;
const WHEEL_THRESHOLD = 75;
const TOUCH_THRESHOLD = 45;
const TEXT_STAGGER = 0.035;
const TEXT_DURATION = 0.7;

export default function ScrollDistortion({
  sections = DEFAULT_SECTIONS,
  shaderConfig = {},
  displacementSrc = "/assets/img/distortion.jpg",
}) {
  const containerRef = useRef(null);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);

  const currentIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const wheelDeltaRef = useRef(0);
  const touchStartYRef = useRef(null);

  const splitSections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      chars: section.text.split(""),
    }));
  }, [sections]);

  useEffect(() => {
     gsap.set(".text-container",{
        opacity: 1,
      })

    const containerElement = containerRef.current;

    if (!containerElement || sections.length === 0) {
      return undefined;
    }

    const config = {
      ...DEFAULT_SHADER_CONFIG,
      ...shaderConfig,
    };

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      -1,
      1
    );

    const geometry = new THREE.PlaneGeometry(width, height);

    const textures = imageRefs.current
      .slice(0, sections.length)
      .filter(Boolean)
      .map(createTextureFromImage);

    const displacementImage = imageRefs.current[sections.length];

    if (textures.length === 0 || !displacementImage) {
      geometry.dispose();
      renderer.dispose();
      return undefined;
    }

    const displacementTexture = createTextureFromImage(displacementImage);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

    containerElement.replaceChildren(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_texture0: {
          value: textures[0],
        },
        u_texture1: {
          value: textures[0],
        },
        u_displacement: {
          value: displacementTexture,
        },
        u_progress: {
          value: 0,
        },
        u_resolution: {
          value: new THREE.Vector2(width, height),
        },
        u_textureResolution0: {
          value: new THREE.Vector2(1, 1),
        },
        u_textureResolution1: {
          value: new THREE.Vector2(1, 1),
        },
        u_strength: {
          value: config.strength,
        },
        u_rgbShift: {
          value: config.rgbShift,
        },
        u_scale: {
          value: config.scale,
        },
      },
      vertexShader: ImageDistortionVertex,
      fragmentShader: ImageDistortionFragment,
      transparent: true,
    });

    const setTextureResolution = (uniformIndex, texture) => {
      if (!texture?.image) return;

      material.uniforms[`u_textureResolution${uniformIndex}`].value.set(
        texture.image.width,
        texture.image.height
      );
    };

    setTextureResolution(0, textures[0]);
    setTextureResolution(1, textures[0]);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    gsap.set(textRefs.current[0], {
      yPercent: 0,
      autoAlpha: 1,
    });

    textRefs.current.forEach((chars, index) => {
      if (index === 0) return;

      gsap.set(chars, {
        yPercent: 100,
        autoAlpha: 0,
      });
    });

    const animateTextTransition = (fromIndex, toIndex, direction) => {
      const fromChars = textRefs.current[fromIndex] || [];
      const toChars = textRefs.current[toIndex] || [];

      gsap.killTweensOf([...fromChars, ...toChars]);

      const outgoingY = direction > 0 ? -100 : 100;
      const incomingY = direction > 0 ? 100 : -100;

      gsap.set(toChars, {
        yPercent: incomingY,
        autoAlpha: 0,
      });
     
      const timeline = gsap.timeline();

      timeline.to(
        fromChars,
        {
          yPercent: outgoingY,
          autoAlpha: 0,
          duration: TEXT_DURATION,
          stagger: TEXT_STAGGER,
          ease: "power3.inOut",
        },
        0
      );

      timeline.to(
        toChars,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: TEXT_DURATION,
          stagger: TEXT_STAGGER,
          ease: "power3.inOut",
        },
        0.08
      );

      return timeline;
    };

    const transitionTo = (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= textures.length) {
        return;
      }

      const currentIndex = currentIndexRef.current;

      if (nextIndex === currentIndex) {
        return;
      }

      targetIndexRef.current = nextIndex;

      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;

      const direction = nextIndex > currentIndex ? 1 : -1;

      material.uniforms.u_texture0.value = textures[currentIndex];
      material.uniforms.u_texture1.value = textures[nextIndex];

      setTextureResolution(0, textures[currentIndex]);
      setTextureResolution(1, textures[nextIndex]);

      material.uniforms.u_progress.value = 0;

      animateTextTransition(currentIndex, nextIndex, direction);

      gsap.to(material.uniforms.u_progress, {
        value: 1,
        duration: config.transitionDuration,
        ease: config.transitionEase,
        overwrite: true,
        onComplete: () => {
          material.uniforms.u_texture0.value = textures[nextIndex];
          setTextureResolution(0, textures[nextIndex]);
          material.uniforms.u_progress.value = 0;

          currentIndexRef.current = nextIndex;
          isTransitioningRef.current = false;

          if (targetIndexRef.current !== currentIndexRef.current) {
            transitionTo(targetIndexRef.current);
          }
        },
      });
    };

    const goNext = () => {
      const nextIndex = Math.min(
        currentIndexRef.current + 1,
        sections.length - 1
      );

      transitionTo(nextIndex);
    };

    const goPrev = () => {
      const nextIndex = Math.max(currentIndexRef.current - 1, 0);

      transitionTo(nextIndex);
    };

    const onWheel = (event) => {
      event.preventDefault();

      wheelDeltaRef.current += event.deltaY;

      if (Math.abs(wheelDeltaRef.current) < WHEEL_THRESHOLD) {
        return;
      }

      if (wheelDeltaRef.current > 0) {
        goNext();
      } else {
        goPrev();
      }

      wheelDeltaRef.current = 0;
    };

    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches[0].clientY;
    };

    const onTouchMove = (event) => {
      if (touchStartYRef.current === null) return;

      const currentY = event.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;

      if (Math.abs(delta) < TOUCH_THRESHOLD) return;

      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }

      touchStartYRef.current = currentY;
    };

    const renderScene = () => {
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(renderScene);
    };

    let animationFrameId = 0;
    renderScene();

    const onResize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;

      renderer.setSize(nextWidth, nextHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

      camera.left = -nextWidth / 2;
      camera.right = nextWidth / 2;
      camera.top = nextHeight / 2;
      camera.bottom = -nextHeight / 2;
      camera.updateProjectionMatrix();

      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(nextWidth, nextHeight);

      material.uniforms.u_resolution.value.set(nextWidth, nextHeight);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);

      window.cancelAnimationFrame(animationFrameId);
      gsap.killTweensOf(material.uniforms.u_progress);

      textRefs.current.forEach((chars) => {
        gsap.killTweensOf(chars);
      });

      scene.remove(mesh);
      mesh.geometry.dispose();
      material.dispose();
      displacementTexture.dispose();
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      containerElement.replaceChildren();
    };
  }, [displacementSrc, sections, shaderConfig]);

  return (
    <section className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <div className="hidden">
        {sections.map((section, index) => (
          <div key={`${section.src}-${index}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(element) => {
                imageRefs.current[index] = element;
              }}
              src={section.src}
              alt=""
            />
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={(element) => {
            imageRefs.current[sections.length] = element;
          }}
          src={displacementSrc}
          alt=""
        />
      </div>

      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-0 text-container">
        {splitSections.map((section, sectionIndex) => (
          <h1
            key={`${section.text}-${sectionIndex}`}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 overflow-hidden text-[10vw] leading-none text-white"
            aria-label={section.text}
          >
            {section.chars.map((char, charIndex) => (
              <span
                key={`${section.text}-${charIndex}`}
                ref={(element) => {
                  if (!textRefs.current[sectionIndex]) {
                    textRefs.current[sectionIndex] = [];
                  }

                  textRefs.current[sectionIndex][charIndex] = element;
                }}
                className="inline-block will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        ))}
      </div>
       <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-white flex flex-col gap-[1vw] justify-center items-center">
                    scroll down
                    <svg
                        width="20"
                        height="28"
                        className="size-[1.5vw]"
                        viewBox="0 0 20 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <style>{`
                  .chev1 { animation: fadeDown 1.4s ease-in-out infinite; }
                  .chev2 { animation: fadeDown 1.4s ease-in-out 0.22s infinite; }
                  .chev3 { animation: fadeDown 1.4s ease-in-out 0.44s infinite; }
                  @keyframes fadeDown {
                    0%   { opacity: 0.08; transform: translateY(-3px); }
                    50%  { opacity: 0.55; transform: translateY(2px); }
                    100% { opacity: 0.08; transform: translateY(-3px); }
                  }
                `}</style>
                        <polyline
                            className="chev1 stroke-current"
                            points="2,2 10,9 18,2"
                            stroke="white"
                            strokeWidth="1.4"
                            fill="none"

                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <polyline
                            className="chev2 stroke-current"
                            points="2,10 10,17 18,10"
                            stroke="white"
                            strokeWidth="1.4"
                            fill="none"

                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <polyline
                            className="chev3 stroke-current"
                            points="2,18 10,25 18,18"
                            stroke="white"
                            strokeWidth="1.4"
                            fill="none"

                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
    </section>
  );
}

function createTextureFromImage(imageElement) {
  const texture = new THREE.Texture(imageElement);

  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}