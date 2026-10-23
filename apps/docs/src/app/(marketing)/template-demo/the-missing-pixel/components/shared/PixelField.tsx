// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { playSound } from "../Sound/pixelSfx";
import UnderlineLink from "../Buttons/UnderlineLink";

const VERTEX_SHADER = `
  attribute vec2 a_pos; attribute float a_kind; attribute float a_seed;
  uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_time; uniform float u_size; uniform float u_dpr;
  uniform vec4 u_ripples[6]; uniform float u_hover; uniform float u_found; uniform float u_near; uniform float u_idle; uniform float u_focus;
  varying float v_kind; varying float v_glow; varying float v_alpha; varying float v_scale; varying float v_found; varying float v_focus;
  void main() {
    vec2 p = a_pos;
    vec2 d = p - u_mouse; float dist = length(d);
    float push = exp(-dist * dist / 24200.0) * u_hover;
    p += d * push * (a_kind > 0.5 ? 0.06 : 0.14);
    p += vec2(sin(u_time * 0.55 + a_seed * 6.283), cos(u_time * 0.45 + a_seed * 6.283)) * (a_kind > 0.5 ? 0.6 : 1.4) * u_idle;
    float ring = 0.0;
    for (int i = 0; i < 6; i++) {
      vec4 r = u_ripples[i];
      float rt = u_time - r.z;
      if (rt > 0.0 && rt < 3.5) {
        vec2 rd = a_pos - r.xy; float rl = length(rd);
        float off = (rl - rt * 480.0) / 110.0;
        float wave = exp(-off * off) * exp(-rt * 1.1) * r.w;
        ring += wave;
        p += (rl > 0.001 ? rd / rl : vec2(0.0)) * wave * (a_kind > 0.5 ? 5.0 : 9.0);
      }
    }
    v_kind = a_kind; v_glow = max(push, ring * 0.5);
    v_alpha = a_kind > 1.5 ? max(u_found, u_near * (0.18 + 0.12 * sin(u_time * 6.0))) : 1.0;
    vec2 clip = (p / u_res) * 2.0 - 1.0; clip.y = -clip.y;
    gl_Position = vec4(clip, 0.0, 1.0);
    float scale = 1.0;
    if (a_kind > 1.5) scale = min(1.0 + u_found * (5.0 + 1.5 * sin(u_time * 4.0)), 60.0 / (u_size * u_dpr));
    v_scale = scale; v_found = u_found; v_focus = u_focus;
    float sz = a_kind > 1.5 ? u_size * scale : (a_kind > 0.5 ? u_size * 0.86 : u_size * 0.3);
    gl_PointSize = sz * u_dpr * (1.0 + push * (a_kind > 0.5 ? 0.02 : 0.25) + ring * (a_kind > 0.5 ? 0.04 : 0.4));
  }`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float v_kind; varying float v_glow; varying float v_alpha; varying float v_scale; varying float v_found; varying float v_focus;
  void main() {
    vec3 ink = vec3(0.94);
    vec3 coral = vec3(1.0, 0.60, 0.46);
    vec3 red = vec3(0.91, 0.28, 0.23);
    vec3 col; float a;
    if (v_kind > 1.5) {
      vec2 c = gl_PointCoord - 0.5;
      float edge = 0.5 / v_scale;
      float core = step(abs(c.x), edge) * step(abs(c.y), edge);
      float dist = length(c) * v_scale;
      float halo = exp(-dist * dist * 0.3) * v_found;
      if (core > 0.5) { col = red; a = v_alpha; }
      else { col = vec3(1.0, 0.45, 0.2); a = halo * 0.8; }
    }
    else if (v_kind > 0.5) { col = mix(ink, coral, v_glow * 0.45); a = 1.0 - 0.8 * v_focus; }
    else { col = mix(vec3(1.0), coral, v_glow); a = (0.09 + v_glow * 0.2) * (1.0 - 0.8 * v_focus); }
    gl_FragColor = vec4(col * a, a);
  }`;

const UNIFORMS = ["u_res", "u_mouse", "u_time", "u_size", "u_dpr", "u_ripples", "u_hover", "u_found", "u_near", "u_idle", "u_focus"] as const;

const DEFAULT_TITLE = "Somewhere in here, one pixel is missing.";
const DEFAULT_HINT = "Move around. Click when you find the gap.";

const PixelField = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [hint, setHint] = useState(DEFAULT_HINT);
  const [found, setFound] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: true });
    if (!gl) return;

    const reduce = prefersReducedMotion();
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type) as WebGLShader;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
    ) as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
    const buffer = gl.createBuffer();
    const attributes = {
      pos: gl.getAttribLocation(program, "a_pos"),
      kind: gl.getAttribLocation(program, "a_kind"),
      seed: gl.getAttribLocation(program, "a_seed"),
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.051, 0.051, 0.051, 1);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let size = 8;
    let count = 0;
    let missing = { x: -999, y: -999 };

    const build = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      size = Math.max(6, Math.round(width / (width < 700 ? 70 : 160)));

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;
      const family = getComputedStyle(host).fontFamily;
      const lines = ["Find the", "missing pixel."];
      let fontSize = Math.min(width * 0.14, height * 0.3);
      ctx.font = `600 ${fontSize}px ${family}`;
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
      fontSize *= Math.min(1, (width * 0.84) / widest);
      ctx.font = `600 ${fontSize}px ${family}`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const centreY = height * 0.42;
      ctx.fillText(lines[0], width / 2, centreY - fontSize * 0.52);
      ctx.fillText(lines[1], width / 2, centreY + fontSize * 0.52);

      const data = ctx.getImageData(0, 0, width, height).data;
      const points: number[] = [];
      const ink: [number, number][] = [];
      for (let y = size / 2; y < height; y += size) {
        for (let x = size / 2; x < width; x += size) {
          let hits = 0;
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const sx = Math.min(width - 1, Math.max(0, Math.floor(x + (ox * size) / 4)));
              const sy = Math.min(height - 1, Math.max(0, Math.floor(y + (oy * size) / 4)));
              if (data[(sy * width + sx) * 4 + 3] > 128) hits++;
            }
          }
          if (hits >= 3) ink.push([x, y]);
          else if ((Math.round(x / size) + Math.round(y / size)) % 2 === 0) points.push(x, y, 0, Math.random());
        }
      }
      if (!ink.length) return;

      const secondLine = lines[1];
      const letterIndex = secondLine.indexOf("pixel");
      const lineLeft = width / 2 - ctx.measureText(secondLine).width / 2;
      const glyphWidth = ctx.measureText("p").width;
      const dotX = lineLeft + ctx.measureText(secondLine.slice(0, letterIndex)).width + glyphWidth / 2;
      const dotY = centreY + fontSize * 0.45;
      let best = 0;
      let bestDistance = Infinity;
      ink.forEach(([x, y], index) => {
        const distance = Math.hypot(x - dotX, y - dotY);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      missing = { x: ink[best][0], y: ink[best][1] };
      ink.forEach(([x, y], index) => {
        if (index !== best) points.push(x, y, 1, Math.random());
      });
      points.push(missing.x, missing.y, 2, 0.5);
      count = points.length / 4;

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(attributes.pos);
      gl.vertexAttribPointer(attributes.pos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(attributes.kind);
      gl.vertexAttribPointer(attributes.kind, 1, gl.FLOAT, false, 16, 8);
      gl.enableVertexAttribArray(attributes.seed);
      gl.vertexAttribPointer(attributes.seed, 1, gl.FLOAT, false, 16, 12);
    };

    const mouse = { x: -999, y: -999, tx: -999, ty: -999, hover: 0, hoverTarget: 0 };
    const RIPPLES = 6;
    const ripples = new Float32Array(RIPPLES * 4).map((_, i) => (i % 4 === 2 ? -99 : -9999));
    let nextRipple = 0;
    const addRipple = (x: number, y: number, time: number, strength: number) => {
      ripples.set([x, y, time, strength], nextRipple * 4);
      nextRipple = (nextRipple + 1) % RIPPLES;
    };
    let foundValue = 0;
    let foundTarget = 0;
    let focusValue = 0;
    let focusTarget = 0;
    let focusTimer = 0;
    let near = 0;
    const start = performance.now();

    const local = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleMove = (event: PointerEvent) => {
      const point = local(event);
      mouse.tx = point.x;
      mouse.ty = point.y;
      mouse.hoverTarget = 1;
      if (mouse.x < -900) {
        mouse.x = point.x;
        mouse.y = point.y;
      }
    };

    const handleLeave = () => {
      mouse.hoverTarget = 0;
    };

    const handleDown = (event: PointerEvent) => {
      const point = local(event);
      const now = (performance.now() - start) / 1000;
      const distance = Math.hypot(point.x - missing.x, point.y - missing.y);
      if (!foundTarget && distance < size * 2.4) {
        foundTarget = 1;
        focusTarget = 1;
        focusTimer = window.setTimeout(() => {
          focusTarget = 0.45;
        }, 2200);
        addRipple(missing.x, missing.y, now, 2.6);
        setFound(true);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 80);
        setTitle("Found it. Now imagine what we’d find in your brand.");
        setHint("");
        playSound("found");
        return;
      }
      addRipple(point.x, point.y, now, 1);
      playSound("tick");
      if (!foundTarget) {
        setHint(
          distance < size * 8
            ? "Hot. Very hot."
            : distance < width * 0.15
              ? "Warmer."
              : distance < width * 0.35
                ? "Lukewarm."
                : "Cold. Try the second line.",
        );
      }
    };

    let running = false;
    let frameId = 0;

    const frame = () => {
      if (!running) return;
      const now = (performance.now() - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.07;
      mouse.y += (mouse.ty - mouse.y) * 0.07;
      mouse.hover += (mouse.hoverTarget - mouse.hover) * 0.05;
      foundValue += (foundTarget - foundValue) * 0.08;
      focusValue += (focusTarget - focusValue) * 0.06;
      const nearDistance = Math.hypot(mouse.x - missing.x, mouse.y - missing.y);
      near += ((nearDistance < size * 6 ? 1 : 0) - near) * 0.1;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.u_res, width, height);
      gl.uniform2f(uniforms.u_mouse, mouse.x, mouse.y);
      gl.uniform1f(uniforms.u_time, reduce ? 0 : now);
      gl.uniform1f(uniforms.u_size, size);
      gl.uniform1f(uniforms.u_dpr, dpr);
      gl.uniform4fv(uniforms.u_ripples, ripples);
      gl.uniform1f(uniforms.u_hover, mouse.hover);
      gl.uniform1f(uniforms.u_found, foundValue);
      gl.uniform1f(uniforms.u_focus, focusValue);
      gl.uniform1f(uniforms.u_near, near);
      gl.uniform1f(uniforms.u_idle, reduce ? 0 : 1);
      gl.drawArrays(gl.POINTS, 0, count);
      frameId = requestAnimationFrame(frame);
    };

    let resizeTimer = 0;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(build);
    build();

    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    });
    resizeObserver.observe(host);

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        frameId = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(frameId);
      }
    });
    visibility.observe(host);

    host.addEventListener("pointermove", handleMove);
    host.addEventListener("pointerleave", handleLeave);
    host.addEventListener("pointerdown", handleDown);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(focusTimer);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
      host.removeEventListener("pointerdown", handleDown);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="font-mpx-head relative h-[min(60vh,33vw)] w-full cursor-crosshair touch-pan-y overflow-hidden rounded-lg bg-(--mpx-ink) max-lg:h-[60vh] max-md:h-[46vh]"
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-(--mpx-white) transition-opacity ease-out ${
          flash ? "opacity-30 duration-0" : "opacity-0 duration-[1200ms]"
        }`}
      />
      <div className="pointer-events-none absolute inset-x-[2.5vw] bottom-[1.6vw] flex items-end justify-between gap-4 text-(color:--mpx-paper) max-lg:inset-x-[4vw] max-lg:bottom-[3vw] max-md:inset-x-[5vw] max-md:bottom-[5vw] max-md:flex-col max-md:items-start max-md:gap-2">
        <p
          className={`w-[40%] text-30 max-lg:w-[60%] max-md:w-full leading-[1.2] tracking-tight ${
            found ? "bg-mpx-grad bg-clip-text text-transparent" : ""
          }`}
        >
          {title}
        </p>
        {found ? (
          <UnderlineLink href="mailto:hello@themissingpixel.studio" className="font-mpx-body pointer-events-auto text-22">
            Start a project
          </UnderlineLink>
        ) : (
          <p className="font-mpx-body text-right text-14 text-(color:--mpx-white)/60 max-md:text-left">{hint}</p>
        )}
      </div>
    </div>
  );
};

export default PixelField;
