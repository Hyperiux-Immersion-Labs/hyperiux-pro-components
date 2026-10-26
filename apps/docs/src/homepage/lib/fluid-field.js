/**
 * Fluid Field - a small incompressible fluid (advection + pressure projection) on the CPU,
 * rendered as soft glowing orange ink, with a dot grid floating on top that the flow pushes around.
 *
 * Two canvases:
 *   ink  : the fluid, drawn at grid resolution and blurred up by CSS (see SiteBackground.jsx)
 *   dots : the dot grid, drawn at full resolution
 *
 * The simulation and drawing (fluid-core.js) run in a worker on OffscreenCanvases where the
 * browser supports it, so they never hold up scrolling or the page's own animations; this file
 * is the page side (pointer, scroll, size, visibility) and the public API. Without
 * OffscreenCanvas they run here, as before.
 *
 *   import { createFluidField } from './fluid-field.js';
 *   const fluid = createFluidField({ ink: inkCanvas, dots: dotsCanvas });
 *   fluid.start();
 */
import { createFluidCore } from './fluid-core';

const DEFAULTS = {
  cell: null,              // px per simulation cell (default 16 desktop, 22 small screens). Bigger = cheaper, softer
  iterations: 14,          // pressure solver iterations
  dyeDecay: 0.984,         // how quickly ink fades (per frame)
  velocityDamping: 0.988,
  dotSpacing: 28,          // px between grid dots
  dotColor: 'rgba(244,244,244,.20)',
  dotHotColor: [255, 190, 140], // dot colour where ink is present (rgb)
  pointerForce: 0.55,      // how hard pointer movement pushes the fluid
  pointerInk: 0.018,       // ink per px of pointer movement
  scrollDrift: true,       // scrolling drags the fluid vertically
  getScroll: null,         // () => number. Default: window.scrollY, as of the last scroll event. Pass () => lenis.scroll with Lenis
  pauseOffscreen: true,
  respectReducedMotion: true, // reduced motion: static dot grid, no simulation
  interactive: null,       // false: static dot grid, no ink and no frame loop. Default: off on touch-first devices (nobody drags a finger across the page to stir it)
};

/* Canvases already handed to a worker: a canvas can be transferred only once, and React's
   StrictMode (dev) unmounts and remounts straight away, so the remount picks its worker back up */
const workers = new WeakMap();
const canTransfer = (canvas) => typeof Worker !== 'undefined' && typeof canvas.transferControlToOffscreen === 'function';

/* The fluid here on the main thread */
function mainThreadEngine(options, ink, dots) {
  const core = createFluidCore(options, ink, dots);
  return {
    resize(...size) { core.resize(...size); core.draw(); },
    pointer: core.pointer,
    frame(scrollY, wake, done) { done(core.frame(scrollY, wake)); },
    splash: core.splash, burst: core.burst, setVortex: core.setVortex,
    clear: core.clear,
    dispose() {},
  };
}

/* The fluid in a worker: the same calls, as messages */
function workerEngine(options, ink, dots) {
  let entry = workers.get(dots);
  if (entry) clearTimeout(entry.terminateTimer);
  else {
    const worker = new Worker(new URL('./fluid-worker.js', import.meta.url));
    const offInk = ink.transferControlToOffscreen(), offDots = dots.transferControlToOffscreen();
    worker.postMessage({ type: 'init', options, ink: offInk, dots: offDots }, [offInk, offDots]);
    entry = { worker, terminateTimer: 0 };
    workers.set(dots, entry);
  }
  const { worker } = entry;
  let onDone = null;
  worker.onmessage = ({ data }) => { if (data.type === 'done') { const done = onDone; onDone = null; done?.(data.calm); } };
  const post = (msg) => worker.postMessage(msg);
  return {
    resize(width, height, pixelRatio, viewportHeight) { post({ type: 'resize', width, height, pixelRatio, viewportHeight }); },
    pointer(x, y) { post({ type: 'pointer', x, y }); },
    frame(scrollY, wake, done) { onDone = done; post({ type: 'frame', scrollY, wake }); },
    splash(x, y) { post({ type: 'splash', x, y }); },
    burst(x, y, power) { post({ type: 'burst', x, y, power }); },
    setVortex(x, y, a) { post({ type: 'vortex', x, y, a }); },
    clear() { post({ type: 'clear' }); },
    dispose() {
      worker.onmessage = null;
      entry.terminateTimer = setTimeout(() => { worker.terminate(); workers.delete(dots); }, 1000);
    },
  };
}

export function createFluidField({ ink, dots, ...options }) {
  const o = { ...DEFAULTS, ...options };
  const mq = (q) => typeof matchMedia === 'function' && matchMedia(q).matches;
  const small = mq('(max-width: 760px)') || (navigator.hardwareConcurrency || 8) <= 4;
  const reduced = o.respectReducedMotion && mq('(prefers-reduced-motion: reduce)');
  const interactive = o.interactive ?? !mq('(hover: none), (pointer: coarse)');
  /* still: the dots are drawn once (and again on resize); nothing listens or animates */
  const still = reduced || !interactive;
  /* default: the position from the last scroll event. Reading window.scrollY inside the frame,
     after other animations have written styles, forced a style recalculation every frame */
  let scrollYAtEvent = typeof window !== 'undefined' ? window.scrollY : 0;
  const getScroll = o.getScroll || (() => scrollYAtEvent);
  // What the simulation needs (plain values only: it may be posted to a worker)
  const { getScroll: _getScroll, ...coreOptions } = o;
  coreOptions.cell = o.cell || (small ? 22 : 16);

  let engine = null;
  const size = () => [dots.clientWidth || innerWidth, dots.clientHeight || innerHeight, Math.min(devicePixelRatio || 1, 2), innerHeight];
  const resize = () => engine.resize(...size());

  /* pointer, relative to the dots canvas; m mirrors the simulation's pointer for stirred() */
  const m = { x: -1, y: -1, px: -1, py: -1 };
  const onMove = (e) => {
    const r = dots.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) { m.x = m.px = -1; engine.pointer(-1, -1); return; }
    m.x = e.clientX - r.left; m.y = e.clientY - r.top;
    engine.pointer(m.x, m.y);
  };

  let raf = 0, running = false, visible = true, ro = null, io = null;
  /* calm: no ink, no flow and no input. The last frame is kept and nothing is
     simulated until the pointer, scroll or an effect (splash / burst / vortex) stirs it.
     busy: a frame is still being worked on (in the worker); the next waits for it */
  let calm = false, kicked = false, scrolled = false, vortexOn = false, busy = false, first = true;
  const onScroll = () => { scrolled = true; if (!o.getScroll) scrollYAtEvent = window.scrollY; };
  function stirred() {
    /* flags only: reading the scroll position every idle frame could force a layout */
    return kicked || vortexOn || (m.x >= 0 && (m.x !== m.px || m.y !== m.py)) || (o.scrollDrift && scrolled);
  }
  const frameDone = (isCalm) => { busy = false; calm = isCalm; };
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden || busy) return;
    /* wake (and the first frame) take the scroll position as is, not as a jump; m.px stays so
       the pointer move that woke us still pushes the ink */
    let wake = first;
    if (calm) {
      if (!stirred()) return;
      calm = kicked = scrolled = false; wake = true;
    }
    first = false;
    m.px = m.x; m.py = m.y;
    busy = true;
    engine.frame(getScroll(), wake, frameDone);
  }
  function start() {
    if (running) return api;
    running = true;
    if (still) {
      ink.style.display = 'none';
      engine = mainThreadEngine(coreOptions, ink, dots); resize();
      if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(resize); ro.observe(dots); } else addEventListener('resize', resize);
      return api;
    }
    engine = workers.has(dots) || (canTransfer(dots) && canTransfer(ink)) ? workerEngine(coreOptions, ink, dots) : mainThreadEngine(coreOptions, ink, dots);
    resize();
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(resize); ro.observe(dots); } else addEventListener('resize', resize);
    if (o.pauseOffscreen && typeof IntersectionObserver !== 'undefined') { io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }); io.observe(dots); }
    raf = requestAnimationFrame(loop);
    return api;
  }
  function stop() {
    running = false; cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); removeEventListener('resize', resize);
    ro && ro.disconnect(); io && io.disconnect(); ro = io = null;
    return api;
  }

  const api = {
    start, stop,
    destroy() { stop(); if (engine) { engine.clear(); engine.dispose(); } },
    /** drop a puff of ink at canvas coordinates (px) */
    splash(x, y) { kicked = true; engine?.splash(x, y); },
    /** radial burst of force + ink, e.g. on a big release. power ≈ 0.6–1.8 */
    burst(x, y, power = 1) { kicked = true; engine?.burst(x, y, power); },
    /** swirl around (x,y) with strength a (0..1); set a=0 to stop */
    setVortex(x, y, a) { kicked = a > 0.01; vortexOn = a > 0.01; engine?.setVortex(x, y, a); },
  };
  return api;
}
