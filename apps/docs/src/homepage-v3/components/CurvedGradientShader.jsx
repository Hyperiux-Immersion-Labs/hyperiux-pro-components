"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Raw WebGL rather than three/r3f: this is one fullscreen fragment shader with
 * four uniforms, so a renderer would only add weight to the homepage bundle.
 */
const VERTEX_SHADER = /* glsl */ `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
/** 0 when the section enters the viewport, 1 when it leaves the top. */
uniform float uProgress;
/** Smoothed scroll velocity, roughly -1..1. Drives the extra deformation. */
uniform float uDeform;
/** 1.0 = fade edges into BG, 0.0 = no edge fade. */
uniform float uEdgeFade;

const vec3 BG      = vec3(0.0196);                // #050505 – page background
const vec3 PRIMARY = vec3(1.0, 0.373, 0.0);       // #ff5f00 – primary brand color

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float x = (uv.x - 0.5) * aspect;

  // ── Travel: the band sweeps from below to above the viewport ──
  float travel = mix(-0.55, 1.55, uProgress);

  // ── Curvature: convex dome → flat → concave bowl ──
  float baseCurvature = mix(1.25, -0.85, uProgress);
  float curvature = baseCurvature + uDeform * 0.55;

  // ── Circular-arc shape for semicircle / rainbow contour ──
  float radius = 1.4 + abs(uDeform) * 0.3;
  float r2 = radius * radius;
  float xClamped = clamp(x * x, 0.0, r2 - 0.001);
  float arcBlend = smoothstep(0.15, 0.85, abs(curvature) / 1.3);
  float parabolic = curvature * x * x;
  float circular  = sign(curvature) * (radius - sqrt(r2 - xClamped));
  float arcOffset = mix(parabolic, circular, arcBlend * 0.7);

  float centre = travel - arcOffset;

  // ── Wide band: much broader spread, grows further with scroll speed ──
  float width = 0.48;
  width *= 1.0 + abs(uDeform) * 0.7;

  // ── Single wide Gaussian – naturally fades to zero at edges ──
  float d    = (uv.y - centre) / width;
  float glow = exp(-d * d * 0.8);   // very wide, soft falloff
  float core = exp(-d * d * 3.5);   // brighter centre region

  // ── Color: just BG → PRIMARY, the Gaussian does the mixing ──
  float intensity = glow * glow;                      // softer rolloff
  float brightness = mix(0.15, 1.0, core / max(glow, 0.001));
  brightness = clamp(brightness, 0.0, 1.0);

  // ── Edge fade: dissolve into BG near top & bottom so no hard clip ──
  float eFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);
  float fadeMul = mix(1.0, eFade, uEdgeFade);

  vec3 col = BG + PRIMARY * intensity * brightness * fadeMul;

  // Dither to prevent 8-bit banding on the soft gradient.
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

const CONTEXT_OPTIONS = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: "low-power",
};

const MAX_PIXEL_RATIO = 1.5;

/**
 * Fullscreen curved gradient that arcs, rises and deforms as the section
 * scrolls past. Renders nothing but the page background if WebGL is
 * unavailable, so the section degrades to flat black.
 */
export default function CurvedGradientShader({ className = "", edgeFade = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    progress: 0,
    targetProgress: 0,
    deform: 0,
    targetDeform: 0,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;

    if (!wrap || !canvas) return;

    const reduced = prefersReducedMotion();
    const startedAt = performance.now();

    let gl = null;
    let program = null;
    let buffer = null;
    let uniforms = null;
    let frame = 0;
    let visible = false;

    function compile(type, source) {
      const shader = gl.createShader(type);

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function build() {
      gl =
        canvas.getContext("webgl2", CONTEXT_OPTIONS) ||
        canvas.getContext("webgl", CONTEXT_OPTIONS);

      if (!gl) return false;

      const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

      if (!vertex || !fragment) return false;

      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;

      gl.useProgram(program);

      // Single oversized triangle covering the clip volume.
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );

      const position = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      uniforms = {
        resolution: gl.getUniformLocation(program, "uResolution"),
        time: gl.getUniformLocation(program, "uTime"),
        progress: gl.getUniformLocation(program, "uProgress"),
        deform: gl.getUniformLocation(program, "uDeform"),
        edgeFade: gl.getUniformLocation(program, "uEdgeFade"),
      };

      resize();
      return true;
    }

    function resize() {
      if (!gl) return;

      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const width = Math.max(1, Math.round(wrap.clientWidth * ratio));
      const height = Math.max(1, Math.round(wrap.clientHeight * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.resolution, width, height);
    }

    function draw(elapsed) {
      const state = stateRef.current;

      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.progress, state.progress);
      gl.uniform1f(uniforms.deform, state.deform);
      gl.uniform1f(uniforms.edgeFade, edgeFade ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      frame = requestAnimationFrame(loop);

      const state = stateRef.current;

      state.progress += (state.targetProgress - state.progress) * 0.12;
      state.deform += (state.targetDeform - state.deform) * 0.14;
      state.targetDeform *= 0.88;

      draw((now - startedAt) / 1000);
    }

    function start() {
      if (frame || reduced) return;
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function drawStillFrame() {
      // Reduced motion: one static arc, no scroll link and no time evolution.
      const state = stateRef.current;

      state.progress = 0.5;
      state.deform = 0;
      draw(0);
    }

    if (!build()) return;

    if (reduced) {
      drawStillFrame();
    }

    function handleContextLost(event) {
      event.preventDefault();
      stop();
    }

    function handleContextRestored() {
      if (!build()) return;
      if (reduced) drawStillFrame();
      else if (visible) start();
    }

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) drawStillFrame();
    });
    resizeObserver.observe(wrap);

    // Only burn frames while the section is actually on screen.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "10% 0px" },
    );
    intersectionObserver.observe(wrap);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);

      if (gl) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const state = stateRef.current;

          state.targetProgress = self.progress;
          state.targetDeform = gsap.utils.clamp(
            -1.5,
            1.5,
            self.getVelocity() / 2000,
          );
        },
      });
    },
    { scope: wrapRef },
  );

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-background ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
