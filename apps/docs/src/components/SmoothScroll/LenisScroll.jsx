"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";
import { prefersReducedMotion } from "@/lib/motion";
import { isTouchOnlyDevice } from "@/lib/viewport";

// A trackpad keeps sending wheel events for a second or so after the fingers lift
// (momentum). A link clicked mid-swipe hands the rest of that momentum to the new page,
// which then drifts from the top to somewhere in the middle. So after a page change the
// old swipe's wheel events are dropped - capture phase on window, ahead of Lenis's own
// listener there - until something that isn't the old swipe shows up: a pause in the
// events, deltas growing again (momentum only ever decays), or a mouse wheel (line-mode
// deltas, or the same full-size notch twice running - momentum never repeats a big one).
// The pause is read off the events' own timestamps, not a timer: the new page rendering
// blocks the main thread for a few hundred ms, and a timer would fire in that stall as if
// the swipe had ended. MAX_MS is only a backstop - a hard flick coasts for 2-3s, and a
// sidebar link's loader can eat most of a shorter cap before the new page even shows.
// Returns the cleanup. Also used by pages that switch in place (the effects listing's
// category chips), which don't change the route this watches.
const MOMENTUM_GAP_MS = 300; // above that render stall (~240ms seen in dev)
const MOMENTUM_MAX_MS = 4000;
const MOUSE_NOTCH_MIN = 40;
const WHEEL_OPTS = { capture: true, passive: false };

export function swallowWheelMomentum() {
  let lastAbs = Infinity;
  let lastTime = performance.now();
  const release = () => {
    window.clearTimeout(maxId);
    removeEventListener("wheel", onWheel, WHEEL_OPTS);
  };
  const onWheel = (event) => {
    const abs = Math.abs(event.deltaY) + Math.abs(event.deltaX);
    const gap = event.timeStamp - lastTime;
    const mouse = event.deltaMode !== 0 || (abs === lastAbs && abs >= MOUSE_NOTCH_MIN);
    if (gap > MOMENTUM_GAP_MS || abs > lastAbs + 4 || mouse) return release();
    lastAbs = abs;
    lastTime = event.timeStamp;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  addEventListener("wheel", onWheel, WHEEL_OPTS);
  const maxId = window.setTimeout(release, MOMENTUM_MAX_MS);
  return release;
}

const LenisSmoothScroll = ({
  duration = 1.35,
  lerp = 0.075,
  smoothWheel = true,
  wheelMultiplier = 0.8,
  touchMultiplier = .8,
  syncTouch = true,
  syncTouchLerp = 0.075,
  allowNestedScroll = false,
}) => {
  const lenisRef = useRef(null);
  // Phones and tablets scroll natively (see below)
  const enabled = !prefersReducedMotion() && !isTouchOnlyDevice();

  useEffect(() => {
    if (!enabled) return undefined;
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    // First in the frame (prioritize): Lenis sets the scroll position before other
    // animations write styles, so its scrollTo doesn't force a style recalc each frame
    gsap.ticker.add(update, false, true);
    // As on the Theremin homepage: no lag smoothing, so a slow frame never
    // makes the smoothed scroll jump, and ScrollTrigger reads every smoothed
    // position straight from Lenis.
    gsap.ticker.lagSmoothing(0);
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [enabled]);

  // A new page starts at the top, and stays there: scrollTo(0, immediate) drops whatever
  // target Lenis was still gliding to (VaultLayout resets too, but not every layout that
  // mounts this has it), and the trackpad momentum still arriving from the swipe the link
  // was clicked in is swallowed (above) - it otherwise carried the new page down to its
  // middle or footer. Back / forward is left alone: the page goes back where it was.
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const historyNavRef = useRef(false);
  useEffect(() => {
    const onPopState = () => {
      historyNavRef.current = true;
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    const historyNav = historyNavRef.current;
    historyNavRef.current = false;
    if (historyNav || window.location.hash) return;
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });
    return swallowWheelMomentum();
  }, [pathname]);

  // Reduced motion: don't mount Lenis at all - lerp tuning still routes
  // wheel/touch input through Lenis's own virtual-scroll interpolation,
  // which isn't identical to native scrolling. Rendering nothing here means
  // the page falls back to plain native scroll, exactly as if this
  // component weren't present.
  //
  // Touch-only devices get native scroll too: the browser's own momentum, and
  // its address bar / toolbars collapse as the page scrolls (syncTouch kept
  // them from ever collapsing). Pages size full-screen sections in svh / lvh,
  // not dvh, so the bars showing and hiding doesn't move the layout.
  if (!enabled) {
    return null;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: duration,
        lerp: lerp,
        smoothWheel: smoothWheel,
        syncTouch: syncTouch,
        syncTouchLerp: syncTouchLerp,
        wheelMultiplier: wheelMultiplier,
        touchMultiplier: touchMultiplier,
        // Nested overflow areas (e.g. code blocks) scroll natively while they
        // have room in the wheel direction, then hand off to Lenis for the
        // page - unlike data-lenis-prevent, which traps the wheel inside them.
        allowNestedScroll: allowNestedScroll,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
      ref={lenisRef}
    />
  );
};

export default LenisSmoothScroll;
