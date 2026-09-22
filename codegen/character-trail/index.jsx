// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
function usePrefersReducedMotion() {
    return useSyncExternalStore((callback) => {
        if (typeof window === "undefined")
            return () => { };
        const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
        mediaQueryList.addEventListener("change", callback);
        return () => mediaQueryList.removeEventListener("change", callback);
    }, () => (typeof window === "undefined" ? false : window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false), () => false);
}
const DEFAULT_ROOT_MARGIN = "256px";
function resolveElement(root) {
    if (!root)
        return null;
    if (typeof root === "function")
        return root() ?? null;
    if (typeof root === "object" && "current" in root)
        return root.current ?? null;
    return root;
}
function createVisibilityGate({ root = null, rootMargin = DEFAULT_ROOT_MARGIN, threshold = 0, observeTab = true, observeOffscreen = true, onChange, } = {}) {
    let tabVisible = typeof document === "undefined" ? true : !document.hidden;
    // Match border-beam: assume onscreen until the observer reports otherwise.
    let onscreen = true;
    let destroyed = false;
    let observer = null;
    const isActive = () => {
        if (destroyed)
            return false;
        if (observeTab && !tabVisible)
            return false;
        if (observeOffscreen && resolveElement(root) && !onscreen)
            return false;
        return true;
    };
    let lastActive = isActive();
    const emit = () => {
        if (destroyed)
            return;
        const next = isActive();
        if (next === lastActive)
            return;
        lastActive = next;
        onChange?.(next);
    };
    const onVisibilityChange = () => {
        tabVisible = !document.hidden;
        emit();
    };
    if (observeTab && typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisibilityChange);
    }
    const bindObserver = () => {
        if (!observeOffscreen || typeof IntersectionObserver === "undefined") {
            return;
        }
        const el = resolveElement(root);
        if (!el)
            return;
        observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                onscreen = entry.isIntersecting;
            }
            emit();
        }, { rootMargin, threshold });
        observer.observe(el);
    };
    bindObserver();
    return {
        /** Whether the animation should currently run. */
        get isActive() {
            return isActive();
        },
        /**
         * Re-bind IntersectionObserver after the root element mounts late
         * (e.g. ref not ready on first call). Safe to call multiple times.
         */
        observe(nextRoot) {
            if (destroyed)
                return;
            if (nextRoot != null)
                root = nextRoot;
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            onscreen = true;
            bindObserver();
            emit();
        },
        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            if (observeTab && typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", onVisibilityChange);
            }
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        },
    };
}
/**
 * Owns a requestAnimationFrame loop that auto-pauses when the tab is hidden
 * or the root element is offscreen.
 */
function createSuspendedRaf({ onFrame, root = null, rootMargin = DEFAULT_ROOT_MARGIN, threshold = 0, observeTab = true, observeOffscreen = true, }) {
    if (typeof onFrame !== "function") {
        throw new TypeError("createSuspendedRaf: onFrame is required");
    }
    let rafId = null;
    let running = false;
    let destroyed = false;
    const stopRaf = () => {
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };
    const tick = (time) => {
        rafId = null;
        if (destroyed || !running || !gate.isActive)
            return;
        onFrame(time);
        if (!destroyed && running && gate.isActive) {
            rafId = requestAnimationFrame(tick);
        }
    };
    const sync = () => {
        if (destroyed)
            return;
        if (running && gate.isActive) {
            if (rafId == null) {
                rafId = requestAnimationFrame(tick);
            }
        }
        else {
            stopRaf();
        }
    };
    const gate = createVisibilityGate({
        root,
        rootMargin,
        threshold,
        observeTab,
        observeOffscreen,
        onChange: sync,
    });
    return {
        /** Start (or resume) the loop when visibility allows. */
        start() {
            if (destroyed)
                return;
            running = true;
            sync();
        },
        /** Stop requesting frames (visibility listeners stay attached until destroy). */
        stop() {
            running = false;
            stopRaf();
        },
        /** Whether the caller has started the loop (may still be paused by visibility). */
        get isRunning() {
            return running;
        },
        /** Whether a frame is currently allowed to schedule. */
        get isActive() {
            return gate.isActive;
        },
        /** Re-attach offscreen observer to a (new) root element. */
        observe(nextRoot) {
            gate.observe(nextRoot);
            sync();
        },
        /** Tear down listeners and cancel any pending frame. */
        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            running = false;
            stopRaf();
            gate.destroy();
        },
    };
}
export { createSuspendedRaf, createVisibilityGate, DEFAULT_ROOT_MARGIN, };
const CELL_SIZE = 50;
const IDLE_TIMEOUT = 120;
const SPAWN_ANIMATION = 180;
const TURN_CELLS = 2;
const MOUSE_LERP = 0.09;
const COLORS = [
    { bg: "#1a1a2e", text: "#ffffff" },
    { bg: "#c8f752", text: "#1a1a2e" },
    { bg: "#7D4E57", text: "#ffffff" },
    { bg: "#5c3d8f", text: "#ffffff" },
    { bg: "#2d2d2d", text: "#ffffff" },
    { bg: "#c3dfe0", text: "#1a1a2e" },
];
function CharacterTrailComp({ children, characters = "HYPERIUX", trailLength = 24, fontSize = 18, textColor, fadeDuration = 0.8, }) {
    const [trail, setTrail] = useState([]);
    const [fading, setFading] = useState(false);
    const resolvedCharacters = characters?.trim() || "HYPERIUX";
    const resolvedTrailLength = Math.max(0, Math.round(Number(trailLength) || 0));
    const resolvedFontSize = Math.max(0, Number(fontSize) || 0);
    const fadeDurationMs = Math.max(0, Number(fadeDuration) || 0) * 1000;
    const lastCell = useRef(null);
    const activeAxis = useRef(null);
    const charIndexRef = useRef(0);
    const colorIndexRef = useRef(0);
    const idleTimer = useRef(undefined);
    const clearTimer = useRef(undefined);
    const fadingRef = useRef(false);
    const mouseTarget = useRef(null);
    const mouseFollower = useRef(null);
    const getNextTrailCell = useCallback((col, row) => {
        const char = resolvedCharacters[charIndexRef.current % resolvedCharacters.length];
        const paletteColor = COLORS[colorIndexRef.current % COLORS.length];
        const color = {
            ...paletteColor,
            text: textColor || paletteColor.text,
        };
        charIndexRef.current++;
        colorIndexRef.current++;
        return {
            id: `${Date.now()}-${charIndexRef.current}-${col}-${row}`,
            cellKey: `${col}:${row}`,
            col,
            row,
            char,
            color,
        };
    }, [resolvedCharacters, textColor]);
    const getLineCells = useCallback((from, to, axis, limit = Infinity) => {
        const cells = [];
        const delta = axis === "x" ? to.col - from.col : to.row - from.row;
        const direction = Math.sign(delta);
        const count = Math.min(Math.abs(delta), limit);
        for (let index = 1; index <= count; index++) {
            const col = axis === "x" ? from.col + direction * index : from.col;
            const row = axis === "y" ? from.row + direction * index : from.row;
            cells.push({ col, row });
        }
        return cells;
    }, []);
    const appendCells = useCallback((cells) => {
        if (resolvedTrailLength <= 0)
            return;
        if (!cells.length)
            return;
        const nextCells = cells.map(({ col, row }) => getNextTrailCell(col, row));
        const activatedKeys = new Set(nextCells.map((cell) => cell.cellKey));
        setTrail((prev) => {
            const withoutDuplicates = prev.filter((cell) => !activatedKeys.has(cell.cellKey));
            return [...withoutDuplicates, ...nextCells].slice(-resolvedTrailLength);
        });
    }, [getNextTrailCell, resolvedTrailLength]);
    useEffect(() => {
        fadingRef.current = fading;
    }, [fading]);
    const updateTrailPosition = useCallback((mx, my) => {
        if (fadingRef.current) {
            fadingRef.current = false;
            setFading(false);
            setTrail([]);
            charIndexRef.current = 0;
            colorIndexRef.current = 0;
            lastCell.current = null;
            activeAxis.current = null;
        }
        clearTimeout(idleTimer.current);
        clearTimeout(clearTimer.current);
        idleTimer.current = setTimeout(() => {
            setFading(true);
            fadingRef.current = true;
            clearTimer.current = setTimeout(() => {
                setTrail([]);
                setFading(false);
                fadingRef.current = false;
                charIndexRef.current = 0;
                colorIndexRef.current = 0;
                lastCell.current = null;
                activeAxis.current = null;
            }, fadeDurationMs);
        }, IDLE_TIMEOUT);
        const target = {
            col: Math.floor(mx / CELL_SIZE),
            row: Math.floor(my / CELL_SIZE),
        };
        if (!lastCell.current) {
            lastCell.current = target;
            appendCells([target]);
            return;
        }
        const current = lastCell.current;
        const colDelta = target.col - current.col;
        const rowDelta = target.row - current.row;
        if (colDelta === 0 && rowDelta === 0)
            return;
        const dominantAxis = Math.abs(colDelta) >= Math.abs(rowDelta) ? "x" : "y";
        const targetAxis = colDelta === 0 ? "y" : rowDelta === 0 ? "x" : dominantAxis;
        const axis = activeAxis.current ?? targetAxis;
        const cells = [];
        let cursor = current;
        const pushCells = (lineCells) => {
            if (!lineCells.length)
                return;
            cells.push(...lineCells);
            cursor = lineCells[lineCells.length - 1];
        };
        if (axis === "x" && colDelta !== 0) {
            pushCells(getLineCells(cursor, { col: target.col, row: cursor.row }, "x"));
            if (target.row !== cursor.row) {
                pushCells(getLineCells(cursor, { col: cursor.col, row: target.row }, "y", TURN_CELLS));
                activeAxis.current = "y";
            }
            else {
                activeAxis.current = "x";
            }
        }
        else if (axis === "y" && rowDelta !== 0) {
            pushCells(getLineCells(cursor, { col: cursor.col, row: target.row }, "y"));
            if (target.col !== cursor.col) {
                pushCells(getLineCells(cursor, { col: target.col, row: cursor.row }, "x", TURN_CELLS));
                activeAxis.current = "x";
            }
            else {
                activeAxis.current = "y";
            }
        }
        else {
            pushCells(getLineCells(cursor, target, targetAxis, TURN_CELLS));
            activeAxis.current = targetAxis;
        }
        if (!cells.length)
            return;
        lastCell.current = cursor;
        appendCells(cells);
    }, [appendCells, fadeDurationMs, getLineCells]);
    const updateMouseFollower = useCallback(() => {
        if (!mouseTarget.current || !mouseFollower.current)
            return;
        const dx = Math.abs(mouseTarget.current.x - mouseFollower.current.x);
        const dy = Math.abs(mouseTarget.current.y - mouseFollower.current.y);
        if (dx <= 0.5 && dy <= 0.5) {
            mouseFollower.current = { ...mouseTarget.current };
            return;
        }
        mouseFollower.current.x += (mouseTarget.current.x - mouseFollower.current.x) * MOUSE_LERP;
        mouseFollower.current.y += (mouseTarget.current.y - mouseFollower.current.y) * MOUSE_LERP;
        updateTrailPosition(mouseFollower.current.x, mouseFollower.current.y);
    }, [updateTrailPosition]);
    const handleMouseMove = useCallback((e) => {
        mouseTarget.current = { x: e.clientX, y: e.clientY };
        if (!mouseFollower.current) {
            mouseFollower.current = { ...mouseTarget.current };
            updateTrailPosition(mouseFollower.current.x, mouseFollower.current.y);
        }
    }, [updateTrailPosition]);
    useEffect(() => {
        const loop = createSuspendedRaf({
            root: null,
            observeOffscreen: false,
            onFrame: updateMouseFollower,
        });
        loop.start();
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(idleTimer.current);
            clearTimeout(clearTimer.current);
            loop.destroy();
        };
    }, [handleMouseMove, updateMouseFollower]);
    return (<div className="relative w-full min-h-screen">

 {trail.map((dot, index) => {
            const total = trail.length;
            // stagger delay - oldest cells (index 0) fade first
            const staggerDelay = fading
                ? index * (fadeDurationMs / Math.max(total, 1))
                : 0;
            const opacity = fading ? 0 : 1;
            return (<div key={dot.id} className="fixed pointer-events-none rounded-full flex items-center justify-center select-none font-extrabold z-9999 scale-100" style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: dot.col * CELL_SIZE,
                    top: dot.row * CELL_SIZE,
                    backgroundColor: dot.color.bg,
                    color: dot.color.text,
                    fontSize: resolvedFontSize,
                    opacity,
                    animation: fading
                        ? "none"
                        : `charTrailPop ${SPAWN_ANIMATION}ms cubic-bezier(0.2,0.8,0.2,1)`,
                    transition: fading
                        ? `opacity ${fadeDurationMs * 0.5}ms cubic-bezier(0.4,0,0.2,1) ${staggerDelay}ms`
                        : "none",
                    willChange: "opacity, transform",
                }}>
 {dot.char}
 </div>);
        })}

 {children}

 <style>{`
 @keyframes charTrailPop {
 from {
 transform: scale(0);
 }
 to {
 transform: scale(1);
 }
 }
 `}</style>
 </div>);
}
const Content = () => (<main className="relative min-h-screen max-md:h-screen w-full overflow-hidden bg-[#f4f4f1] text-black">

    <div className="absolute max-md:bottom-30 max-[1025px]:bottom-30 max-[1025px]:left-1/2 max-[1025px]:-translate-x-1/2  hidden  max-md:w-full max-[1025px]:w-[50%] mx-auto  max-[1025px]:flex h-fit w-[90%] px-6 text-center text-white">
      <p className="rounded-full bg-black/10 px-5 py-3 leading-[1.2] max-md:text-base max-[1025px]:text-xl text-black backdrop-blur-sm">
        Not just something to watch, something to move. Open on desktop
      </p>
    </div>

    {/* content */}
    <section className="flex min-h-screen items-center justify-center px-8 pb-8">
      <div>
        <h1 className="font-mono text-[12vh] max-[1025px]:text-[13vw] max-md:w-full max-[1025px]:w-[90%] max-md:text-[15vw] leading-[1.2]  font-black uppercase">
          Snake Cursor Trail
        </h1>

        <p className="mt-6 font-mono text-sm max-md:text-xs max-[1025px]:text-sm text-center uppercase tracking-[0.25em] text-black/40">
          Sequential · Reactive · Grid Based
        </p>
      </div>
    </section>

    <p className="absolute bottom-8 right-8 max-w-105 text-right font-mono text-sm leading-relaxed text-black/55 max-[1025px]:hidden">
      Wake the grid with your cursor. Draw slow corners, quick turns,
      little loops - the letters will stitch your path into a living trail.
    </p>

  </main>);
const CharacterTrail = (props) => {
    const [isMobile, setIsMobile] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 1025);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return (<>
     {isMobile ? (<Content />) : (<CharacterTrailComp {...props}>
          <Content />
        </CharacterTrailComp>)}
      {!isMobile && prefersReducedMotion && (<div aria-live="polite" className="pointer-events-none fixed top-25 right-8 z-50000 w-fit max-w-65 rounded-md border bg-white/10 border-black/10 backdrop-blur-sm  p-3 text-center max-[1025px]:hidden">
          <h2 className="text-sm leading-none text-[#111111]">
            The characters keep trailing.
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/65">
            Character Trail redraws letters along your cursor&apos;s path in real
            time. The animation can&apos;t be reduced without removing the effect.
          </p>
        </div>)}
    </>);
};
export default CharacterTrail;
