// Built using Hyperiux Vault: https://vault.hyperiux.com

export type SoundName =
  | "hover"
  | "click"
  | "open"
  | "close"
  | "leave"
  | "arrive"
  | "found"
  | "tick"
  | "toggle";

const STORAGE_KEY = "mpx-sound";
const BPM = 84;
const SWING = 0.58;
const SIXTEENTH = 60 / BPM / 4;

const CHORDS = [
  { bass: 38, notes: [53, 57, 60, 64] },
  { bass: 43, notes: [53, 59, 64, 69] },
  { bass: 36, notes: [52, 55, 59, 62] },
  { bass: 45, notes: [55, 60, 64, 71] },
];
const LEAD = [74, 77, 79, 81, 84, 86];
const UP = [74, 79, 81, 86, 89, 93];

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

let ctx: AudioContext | null = null;
let master: GainNode;
let music: GainNode;
let fx: GainNode;
let crackle: AudioBufferSourceNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let timer = 0;
let enabled = false;
let step = 0;
let nextAt = 0;
const listeners = new Set<(on: boolean) => void>();

const noise = () => {
  if (noiseBuffer || !ctx) return noiseBuffer as AudioBuffer;
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
};

const init = () => {
  if (ctx) return;
  const AudioCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  ctx = new AudioCtor();

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.ratio.value = 3.5;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.2;
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(compressor).connect(ctx.destination);

  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 6500;
  warm.Q.value = 0.3;
  music = ctx.createGain();
  music.gain.value = 0.55;
  music.connect(warm).connect(master);

  fx = ctx.createGain();
  fx.gain.value = 0.85;
  const delay = ctx.createDelay();
  delay.delayTime.value = SIXTEENTH * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.22;
  const wet = ctx.createGain();
  wet.gain.value = 0.18;
  fx.connect(master);
  fx.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
};

const startCrackle = () => {
  if (crackle || !ctx) return;
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.012;
  }
  crackle = ctx.createBufferSource();
  crackle.buffer = buffer;
  crackle.loop = true;
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 1200;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  crackle.connect(highpass).connect(gain).connect(music);
  crackle.start();
};

const rhodes = (midi: number, t: number, len: number, vel = 0.06) => {
  if (!ctx) return;
  const f = mtof(midi);
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();
  carrier.frequency.value = f;
  modulator.frequency.value = f;
  modGain.gain.setValueAtTime(f * 2.4, t);
  modGain.gain.exponentialRampToValueAtTime(f * 0.25, t + 0.9);
  modulator.connect(modGain).connect(carrier.frequency);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vel, t + 0.008);
  amp.gain.exponentialRampToValueAtTime(vel * 0.45, t + 0.6);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + len);
  const tremolo = ctx.createOscillator();
  const tremoloGain = ctx.createGain();
  tremolo.frequency.value = 4.2;
  tremoloGain.gain.value = vel * 0.18;
  tremolo.connect(tremoloGain).connect(amp.gain);
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2600;
  carrier.connect(amp).connect(lowpass).connect(music);
  [carrier, modulator, tremolo].forEach((osc) => {
    osc.start(t);
    osc.stop(t + len + 0.05);
  });
};

const bass = (midi: number, t: number, len: number) => {
  if (!ctx) return;
  const sine = ctx.createOscillator();
  const triangle = ctx.createOscillator();
  const gain = ctx.createGain();
  const lowpass = ctx.createBiquadFilter();
  triangle.type = "triangle";
  sine.frequency.value = mtof(midi);
  triangle.frequency.value = mtof(midi);
  lowpass.type = "lowpass";
  lowpass.frequency.value = 320;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  const triangleGain = ctx.createGain();
  triangleGain.gain.value = 0.25;
  sine.connect(gain);
  triangle.connect(triangleGain).connect(gain);
  gain.connect(lowpass).connect(music);
  sine.start(t);
  triangle.start(t);
  sine.stop(t + len + 0.05);
  triangle.stop(t + len + 0.05);
};

const kick = (t: number, vel = 0.7) => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  gain.gain.setValueAtTime(vel, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
  osc.connect(gain).connect(music);
  osc.start(t);
  osc.stop(t + 0.4);
};

const snare = (t: number, vel = 0.22) => {
  if (!ctx) return;
  const source = ctx.createBufferSource();
  source.buffer = noise();
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1700;
  bandpass.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vel, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  source.connect(bandpass).connect(gain).connect(music);
  source.start(t);
  source.stop(t + 0.22);
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.frequency.value = 185;
  bodyGain.gain.setValueAtTime(vel * 0.5, t);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  body.connect(bodyGain).connect(music);
  body.start(t);
  body.stop(t + 0.1);
};

const hat = (t: number, vel = 0.06, open = false) => {
  if (!ctx) return;
  const source = ctx.createBufferSource();
  source.buffer = noise();
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 7200;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vel, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.22 : 0.045));
  source.connect(highpass).connect(gain).connect(music);
  source.start(t);
  source.stop(t + 0.25);
};

const chip = (midi: number, t: number, len = 0.12, vel = 0.035, dest?: AudioNode) => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lowpass = ctx.createBiquadFilter();
  osc.type = "square";
  osc.frequency.value = mtof(midi);
  lowpass.type = "lowpass";
  lowpass.frequency.value = 3200;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vel, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  osc.connect(lowpass).connect(gain).connect(dest || music);
  osc.start(t);
  osc.stop(t + len + 0.02);
};

const pop = (t: number, from = 900, to = 320, vel = 0.08) => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + 0.06);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vel, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(gain).connect(fx);
  osc.start(t);
  osc.stop(t + 0.12);
};

const sweep = (t: number, up: boolean) => {
  if (!ctx) return;
  const source = ctx.createBufferSource();
  source.buffer = noise();
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 2;
  bandpass.frequency.setValueAtTime(up ? 500 : 3500, t);
  bandpass.frequency.exponentialRampToValueAtTime(up ? 3500 : 500, t + 0.45);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.05, t + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  source.connect(bandpass).connect(gain).connect(fx);
  source.start(t);
  source.stop(t + 0.55);
};

const scheduleStep = (s: number, t: number) => {
  const bar = Math.floor(s / 16);
  const i = s % 16;
  const chord = CHORDS[bar % CHORDS.length];
  if (i === 0 || i === 10 || (i === 7 && Math.random() < 0.3)) kick(t, i === 0 ? 0.75 : 0.55);
  if (i === 4 || i === 12) snare(t);
  if (i % 2 === 0) hat(t, i % 4 === 0 ? 0.05 : 0.035, i === 14 && Math.random() < 0.4);
  else if (Math.random() < 0.2) hat(t, 0.02);
  if (i === 0) bass(chord.bass, t, SIXTEENTH * 6);
  if (i === 9) bass(chord.bass + (Math.random() < 0.5 ? 7 : 12), t, SIXTEENTH * 3);
  if (i === 0) chord.notes.forEach((m, k) => rhodes(m, t + k * 0.012, SIXTEENTH * 14, 0.05));
  if (i === 6 && Math.random() < 0.7) chord.notes.slice(1).forEach((m) => rhodes(m, t, SIXTEENTH * 6, 0.028));
  if (bar % 4 >= 2 && i % 2 === 0 && Math.random() < 0.22) chip(pick(LEAD), t, 0.14, 0.022);
};

const sequence = () => {
  if (!ctx || !enabled) return;
  while (nextAt < ctx.currentTime + 0.25) {
    const swingOffset = step % 2 === 1 ? (SWING - 0.5) * 2 * SIXTEENTH : 0;
    scheduleStep(step, nextAt + swingOffset);
    nextAt += SIXTEENTH;
    step++;
  }
};

const SOUNDS: Record<SoundName, (t: number) => void> = {
  hover: (t) => chip(pick([86, 88, 91, 93]), t, 0.05, 0.016, fx),
  click: (t) => {
    chip(86, t, 0.05, 0.035, fx);
    chip(93, t + 0.045, 0.08, 0.035, fx);
    pop(t, 1100, 420, 0.05);
  },
  open: (t) => [74, 79, 83, 86].forEach((m, k) => chip(m, t + k * 0.045, 0.09, 0.03, fx)),
  close: (t) => [86, 83, 79, 74].forEach((m, k) => chip(m, t + k * 0.04, 0.08, 0.028, fx)),
  leave: (t) => {
    sweep(t, true);
    UP.forEach((m, k) => chip(m, t + k * 0.05, 0.06, 0.022, fx));
  },
  arrive: (t) => {
    sweep(t, false);
    [...UP].reverse().forEach((m, k) => chip(m, t + k * 0.04, 0.05, 0.018, fx));
  },
  found: (t) => {
    [74, 78, 81, 86, 90, 93, 98].forEach((m, k) => chip(m, t + k * 0.06, 0.18, 0.03, fx));
    pop(t + 0.42, 1400, 600, 0.06);
  },
  tick: (t) => chip(pick([93, 96, 98]), t, 0.025, 0.008, fx),
  toggle: (t) => {
    chip(81, t, 0.06, 0.03, fx);
    chip(88, t + 0.06, 0.1, 0.03, fx);
  },
};

export const playSound = (name: SoundName) => {
  if (!enabled || !ctx || ctx.state !== "running") return;
  SOUNDS[name](ctx.currentTime + 0.005);
};

export const isSoundOn = () => enabled;

export const subscribeSound = (listener: (on: boolean) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const readSoundPreference = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
};

export const setSound = (on: boolean, announce = true) => {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((listener) => listener(on));

  if (on) {
    init();
    if (!ctx) return;
    ctx.resume();
    startCrackle();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.85, t + 1.2);
    if (nextAt < t) {
      nextAt = t + 0.1;
      step = Math.ceil(step / 16) * 16;
    }
    window.clearInterval(timer);
    timer = window.setInterval(sequence, 50);
    sequence();
    if (announce) window.setTimeout(() => playSound("toggle"), 30);
  } else if (ctx) {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.6);
    window.clearInterval(timer);
  }
};

export const suspendSound = (hidden: boolean) => {
  if (!ctx) return;
  if (hidden) ctx.suspend();
  else if (enabled) ctx.resume();
};
