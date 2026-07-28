/**
 * Shared breathing driver for the Pulse effects.
 *
 * The pulse breathing (size / drift / per-quadrant opacity / height) and the
 * slow hue drift used to run as ~15 per-instance CSS `@property` keyframe
 * animations at the display refresh rate (60–120 Hz). Because each value feeds
 * the painted gradients/filters, that repainted the breathing layers 60–120×/s.
 *
 * The motion is very slow (1.6–6.4 s periods), so instead every registered
 * instance is driven from a SINGLE shared requestAnimationFrame loop throttled
 * to ~30 fps. This halves the paint frequency on 60 Hz displays and quarters it
 * on 120 Hz, with no perceptible change to the breathing.
 *
 * Each oscillator ping-pongs a CSS custom property between `a` and `b` with an
 * ease-in-out (cosine) curve over `period` seconds, offset by `delay` seconds so
 * otherwise-identical oscillators desync (matching the former CSS keyframes +
 * animation-delay).
 */

/**
 * @typedef {Object} PulseOscillator
 * @property {string} prop
 * @property {number} a
 * @property {number} b
 * @property {number} period
 * @property {number} delay
 * @property {string} unit
 */

/**
 * @typedef {Object} PulseDriverConfig
 * @property {PulseOscillator[]} oscillators
 * @property {{ prop: string, range: number, period: number, continuous: boolean } | null} hue
 */

/**
 * @typedef {Object} PulseInstance
 * @property {HTMLElement} el
 * @property {PulseDriverConfig} config
 */

/** @type {Set<PulseInstance>} */
const instances = new Set();

/** @type {number | null} */
let rafId = null;
let lastFrame = 0;

// ~30 fps. Subtract a small slack so a frame that lands a hair early still runs.
const FRAME_INTERVAL = 1000 / 30 - 2;
const TWO_PI = Math.PI * 2;

/**
 * Cosine ease-in-out factor in [0, 1]: 0 at phase 0/1, 1 at phase 0.5.
 * @param {number} phase
 * @returns {number}
 */
function pingPong(phase) {
  return (1 - Math.cos(TWO_PI * phase)) / 2;
}

/** @param {number} ts */
function frame(ts) {
  rafId = requestAnimationFrame(frame);
  if (ts - lastFrame < FRAME_INTERVAL) return;
  lastFrame = ts;

  const tSec = ts / 1000;

  instances.forEach(({ el, config }) => {
    for (const osc of config.oscillators) {
      // Match CSS animation-delay semantics: a positive delay starts later.
      const phase = (tSec - osc.delay) / osc.period;
      const value = osc.a + (osc.b - osc.a) * pingPong(phase);
      el.style.setProperty(
        osc.prop,
        osc.unit === 'px' ? `${value.toFixed(2)}px` : value.toFixed(4)
      );
    }

    if (config.hue) {
      const { prop, range, period, continuous } = config.hue;
      // `continuous` rotates a full circle (0→range, looping) so every color
      // sweeps through every edge; otherwise drift between -range and +range.
      const value = continuous
        ? ((tSec / period) % 1) * range
        : -range + 2 * range * pingPong(tSec / period);
      el.style.setProperty(prop, `${value.toFixed(2)}deg`);
    }
  });
}

function startLoop() {
  if (rafId == null) {
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }
}

function stopLoopIfIdle() {
  if (instances.size === 0 && rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Register an element to be driven by the shared pulse loop.
 *
 * @param {HTMLElement} el
 * @param {PulseDriverConfig} config - config from getPulseDriverConfig() in styles.js
 * @returns {() => void} cleanup function that unregisters the instance (and
 *          stops the shared loop once no instances remain).
 */
export function registerPulseInstance(el, config) {
  const instance = { el, config };
  instances.add(instance);
  startLoop();
  return () => {
    instances.delete(instance);
    stopLoopIfIdle();
  };
}