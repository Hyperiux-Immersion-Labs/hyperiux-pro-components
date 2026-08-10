"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const SONGS = {
  "here-for-you": [
    66, 69, 74, 78,
    64, 69, 73, 76,
    66, 71, 74, 78,
    67, 71, 74, 79,
    78, 76, 74, 69,
    76, 73, 69, 64,
    78, 74, 71, 66,
    79, 74, 71, 67,
  ],
  "fur-elise": [
    76, 75, 76, 75, 76, 71, 74, 72, 69,
    60, 64, 69, 71,
    64, 68, 71, 72,
    64, 76, 75, 76, 75, 76, 71, 74, 72, 69,
    60, 64, 69, 71,
    64, 72, 71, 69,
  ],
};

const REST_OPACITY = 1;
const TROUGH_OPACITY = 0.06;
const WAVE_PERIOD = 1.2;
const WAVE_STAGGER = 0.04;
const WAVE_MIN = 0;
const WAVE_YIELD = 0.16;
const WAVE_RESUME = 0.32;
const FALLOFF = 8;
const POSITION_SMOOTHING = 0.07;
const SMOOTHING = 0.05;
const SPEED_REFERENCE = 190;
const SPEED_WIDEN = 1.1;
const NOTE_MIN_GAP_MS = 55;
const MAX_VOICES = 9;
const RESUME_RETRY_MS = 1000;
const GLYPHS = ["♪", "♫", "♩", "♬"];
const GLYPH_POOL = 14;
const GLYPH_RISE = 1.0;
const GLYPH_DRIFT = 0.12;
const GLYPH_DURATION = 1.15;
const PARTIALS = [
  [1, 0.5, "triangle"],
  [2, 0.16, "sine"],
  [3, 0.06, "sine"],
  [4, 0.03, "sine"],
];

const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const waveAt = (index, seconds) => {
  const elapsed = seconds - index * WAVE_STAGGER;
  if (elapsed <= 0) return REST_OPACITY;
  const phase = (elapsed / WAVE_PERIOD) % 2;
  return (
    WAVE_MIN + (REST_OPACITY - WAVE_MIN) * 0.5 * (1 + Math.cos(Math.PI * phase))
  );
};

class PianoSynth {
  constructor() {
    this.ctx = null;
    this.bus = null;
    this.voices = 0;
    this.lastNoteAt = 0;
    this.lastResumeAt = -Infinity;
  }

  ensure() {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;

      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);

      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 5200;
      tone.connect(master);

      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.19;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.24;
      const wet = ctx.createGain();
      wet.gain.value = 0.18;
      tone.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);

      this.ctx = ctx;
      this.bus = tone;
    }

    if (this.ctx.state === "suspended") {
      const now = performance.now();
      if (now - this.lastResumeAt >= RESUME_RETRY_MS) {
        this.lastResumeAt = now;
        this.ctx.resume().catch(() => {});
      }
    }
    return this.ctx.state === "running" ? this.ctx : null;
  }

  play(midi) {
    const now = performance.now();
    if (now - this.lastNoteAt < NOTE_MIN_GAP_MS) return false;
    if (this.voices >= MAX_VOICES) return false;

    const ctx = this.ensure();
    if (!ctx) return false;
    this.lastNoteAt = now;

    const start = ctx.currentTime + 0.001;
    const freq = midiToFreq(midi);
    const decay = 1.2 + (76 - midi) * 0.03;

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(0.9, start + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + decay);
    amp.connect(this.bus);

    let last = null;
    PARTIALS.forEach(([multiplier, level, type]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * multiplier;
      osc.detune.value = Math.random() * 6 - 3;

      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain);
      gain.connect(amp);

      osc.start(start);
      osc.stop(start + decay + 0.05);
      last = osc;
    });

    this.voices += 1;
    if (last) {
      last.onended = () => {
        this.voices -= 1;
        try {
          amp.disconnect();
        } catch {}
      };
    }

    return true;
  }

  dispose() {
    if (!this.ctx) return;
    this.ctx.close().catch(() => {});
    this.ctx = null;
    this.bus = null;
  }
}

export default function Piano({
  count = 75,
  song = "here-for-you",
  className = "",
}) {
  const wrapRef = useRef(null);
  const lineRefs = useRef([]);
  const glyphLayerRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lines = lineRefs.current.filter(Boolean);
    if (!wrap || !lines.length) return;

    const melody = SONGS[song] || SONGS["here-for-you"];
    const synth = new PianoSynth();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const rect = { left: 0, top: 0, width: 0, height: 0 };
    const readRect = () => {
      const box = wrap.getBoundingClientRect();
      rect.left = box.left;
      rect.top = box.top;
      rect.width = box.width;
      rect.height = box.height;
    };
    readRect();

    const layer = glyphLayerRef.current;
    const glyphs = [];
    const glyphTimelines = [];
    let glyphCursor = 0;

    if (layer && !reduceMotion) {
      for (let i = 0; i < GLYPH_POOL; i += 1) {
        const el = document.createElement("span");
        el.className =
          "absolute bottom-0 left-0 text-foreground text-[2vw] leading-none select-none";
        el.style.opacity = "0";
        layer.appendChild(el);
        glyphs.push(el);
        glyphTimelines.push(null);
      }
    }

    const dip = new Float32Array(lines.length);
    const dipTarget = new Float32Array(lines.length);
    let pointerPos = 0;
    let troughPos = 0;
    let speed = 0;
    let waveMix = 1;
    let active = false;
    let noteIndex = -1;
    let running = false;

    const easeStep = (deltaMs, tau) =>
      1 - Math.exp(-Math.min(deltaMs, 50) / 1000 / tau);

    const tick = (time, deltaMs) => {
      readRect();

      const dt = Math.min(deltaMs, 50) / 1000;

      if (active) {
        const previous = troughPos;
        troughPos +=
          (pointerPos - troughPos) * easeStep(deltaMs, POSITION_SMOOTHING);
        const instant = dt > 0 ? Math.abs(troughPos - previous) / dt : 0;
        speed += (instant - speed) * easeStep(deltaMs, 0.09);
      }

      const falloff =
        FALLOFF *
        (1 + Math.min(speed / SPEED_REFERENCE, 1) * (active ? SPEED_WIDEN : 0));

      for (let i = 0; i < lines.length; i += 1) {
        if (!active) {
          dipTarget[i] = 0;
          continue;
        }
        const distance = (i - troughPos) / falloff;
        dipTarget[i] = Math.exp(-distance * distance);
      }

      const step = easeStep(deltaMs, SMOOTHING);
      waveMix +=
        ((active ? 0 : 1) - waveMix) *
        easeStep(deltaMs, active ? WAVE_YIELD : WAVE_RESUME);

      for (let i = 0; i < lines.length; i += 1) {
        dip[i] += (dipTarget[i] - dip[i]) * step;
        const wave =
          REST_OPACITY + (waveAt(i, time) - REST_OPACITY) * waveMix;
        lines[i].style.opacity = (wave + (TROUGH_OPACITY - wave) * dip[i])
          .toFixed(3);
      }

      if (active) playNoteAt(troughPos);
    };

    function playNoteAt(position) {
      const note = Math.min(
        melody.length - 1,
        Math.max(0, Math.floor((position / lines.length) * melody.length)),
      );
      if (note === noteIndex) return;
      noteIndex = note;
      if (synth.play(melody[note])) releaseGlyph(position, melody[note]);
    }

    function releaseGlyph(position, midi) {
      if (!glyphs.length || !rect.height) return;

      const el = glyphs[glyphCursor];
      const previous = glyphTimelines[glyphCursor];
      if (previous) previous.kill();

      el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.style.left = `${(((position + 0.5) / lines.length) * 100).toFixed(3)}%`;

      const drift = (Math.random() * 2 - 1) * rect.height * GLYPH_DRIFT;
      const scale = Math.max(0.7, 1.05 - (midi - 60) * 0.012);

      const timeline = gsap.timeline();
      timeline
        .set(el, {
          xPercent: -50,
          x: 0,
          y: 0,
          scale: scale * 0.55,
          rotation: drift > 0 ? -12 : 12,
          opacity: 0,
        })
        .to(el, { opacity: 0.8, scale, duration: 0.18, ease: "power2.out" }, 0)
        .to(
          el,
          {
            y: -rect.height * GLYPH_RISE,
            x: drift,
            rotation: 0,
            duration: GLYPH_DURATION,
            ease: "sine.out",
          },
          0,
        )
        .to(
          el,
          { opacity: 0, duration: GLYPH_DURATION * 0.6, ease: "sine.in" },
          GLYPH_DURATION * 0.4,
        );

      glyphTimelines[glyphCursor] = timeline;
      glyphCursor = (glyphCursor + 1) % glyphs.length;
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      gsap.ticker.add(tick);
    }

    function stop() {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    }

    function release() {
      if (!active) return;
      active = false;
      speed = 0;
      noteIndex = -1;
    }

    const onMove = (event) => {
      if (!running) readRect();
      if (!rect.width || !rect.height) return;

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.left + rect.width &&
        event.clientY >= rect.top &&
        event.clientY <= rect.top + rect.height;

      if (!inside) {
        release();
        return;
      }

      const ratio = (event.clientX - rect.left) / rect.width;
      pointerPos = Math.min(
        lines.length - 1,
        Math.max(0, ratio * lines.length - 0.5),
      );

      if (!active) {
        active = true;
        troughPos = pointerPos;
        speed = 0;
      }

      if (reduceMotion) playNoteAt(pointerPos);
    };

    const unlock = () => synth.ensure();

    const io = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].isIntersecting) start();
      else stop();
    });
    io.observe(wrap);
    start();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", release, { passive: true });
    window.addEventListener("blur", release);
    window.addEventListener("pointerdown", unlock, {
      passive: true,
      once: true,
    });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      io.disconnect();
      stop();
      lines.forEach((line) => {
        line.style.opacity = "";
      });
      glyphTimelines.forEach((timeline) => timeline?.kill());
      glyphs.forEach((el) => el.remove());
      synth.dispose();
    };
  }, [song]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          className="cta-line w-[1.5px] h-full bg-foreground"
        />
      ))}
      <div
        ref={glyphLayerRef}
        className="absolute inset-0  pointer-events-none"
      />
    </div>
  );
}
