"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ReactLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

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
  transitionDuration: 1.5,
  transitionEase: "power3.inOut",
};

const MAX_PIXEL_RATIO = 2;

const LENIS_OPTIONS = {
  autoRaf: true,
  duration: 2,
};

export default function ScrollDistortion({
  sections = DEFAULT_SECTIONS,
  shaderConfig = {},
  displacementSrc = "/assets/img/distortion.jpg",
}) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const imageRefs = useRef([]);

  useEffect(() => {
    const containerElement = containerRef.current;
    const wrapperElement = wrapperRef.current;

    if (!containerElement || !wrapperElement || sections.length === 0) {
      return undefined;
    }

    const config = {
      ...DEFAULT_SHADER_CONFIG,
      ...shaderConfig,
    };

    const { clientWidth, clientHeight } = containerElement;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    const camera = new THREE.OrthographicCamera(
      -clientWidth / 2,
      clientWidth / 2,
      clientHeight / 2,
      -clientHeight / 2,
      -1,
      1
    );

    const geometry = new THREE.PlaneGeometry(clientWidth, clientHeight);

    let animationFrameId = 0;
    let currentIndex = 0;
    let targetIndex = 0;
    let isTransitioning = false;

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

    renderer.setSize(clientWidth, clientHeight);
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
          value: new THREE.Vector2(clientWidth, clientHeight),
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

    const transitionTo = (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= textures.length) {
        return;
      }

      if (nextIndex === currentIndex || isTransitioning) {
        targetIndex = nextIndex;
        return;
      }

      targetIndex = nextIndex;
      isTransitioning = true;

      material.uniforms.u_texture1.value = textures[nextIndex];
      setTextureResolution(1, textures[nextIndex]);

      gsap.to(material.uniforms.u_progress, {
        value: 1,
        duration: config.transitionDuration,
        ease: config.transitionEase,
        onComplete: () => {
          material.uniforms.u_texture0.value = textures[nextIndex];
          setTextureResolution(0, textures[nextIndex]);
          material.uniforms.u_progress.value = 0;

          currentIndex = nextIndex;
          isTransitioning = false;

          if (targetIndex !== currentIndex) {
            transitionTo(targetIndex);
          }
        },
      });
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger: wrapperElement,
      start: "top top",
      end: `+=${(sections.length - 1) * 100}%`,
      scrub: true,
      onUpdate: (scrollState) => {
        const nextIndex = Math.round(
          scrollState.progress * (sections.length - 1)
        );

        transitionTo(nextIndex);
      },
    });

    const renderScene = () => {
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(renderScene);
    };

    renderScene();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      scrollTrigger.kill();
      gsap.killTweensOf(material.uniforms.u_progress);

      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      displacementTexture.dispose();
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      containerElement.replaceChildren();
    };
  }, [displacementSrc, sections, shaderConfig]);

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          height: `${sections.length * 100}vh`,
        }}
      >
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

        <div
          ref={containerRef}
          className="sticky top-0 h-screen w-full bg-black"
        />

        <div className="pointer-events-none absolute inset-0 z-10">
          {sections.map((section, index) => (
            <div
              key={`${section.text}-${index}`}
              className="flex h-screen items-center justify-center"
            >
              <h1 className="text-[10vw] text-white">{section.text}</h1>
            </div>
          ))}
        </div>
      </div>
    </ReactLenis>
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