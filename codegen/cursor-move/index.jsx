// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client';
import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { Inter } from "next/font/google";
function usePrefersReducedMotion() {
    return useSyncExternalStore((callback) => {
        if (typeof window === "undefined")
            return () => { };
        const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
        mediaQueryList.addEventListener("change", callback);
        return () => mediaQueryList.removeEventListener("change", callback);
    }, () => (typeof window === "undefined" ? false : window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false), () => false);
}
// Inter is a variable font exposing a `wght` axis, which the cursor-driven
// weight morph below animates. It's loaded here so the component is fully
// self-contained - no font setup is required in layout.js, globals.css, or
// the page that renders it.
const cursorMoveFont = Inter({ subsets: ["latin"], display: "swap" });
const DESKTOP_CURSOR_MOVE_QUERY = "(min-width: 1025px) and (pointer: fine)";
function mapRange(value, inMin, inMax, outMin, outMax) {
    const clamped = Math.min(Math.max(value, inMin), inMax);
    return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}
function clampNumber(value, min, max, fallback) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, numericValue));
}
function useMousePosition(containerRef, lerp = 0.2) {
    const [pos, setPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isDesktop, setIsDesktop] = useState(false);
    const targetRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const safeLerp = clampNumber(lerp, 0.01, 1, 0.2);
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const mediaQuery = window.matchMedia(DESKTOP_CURSOR_MOVE_QUERY);
        const updateIsDesktop = () => {
            setIsDesktop(mediaQuery.matches);
        };
        updateIsDesktop();
        mediaQuery.addEventListener?.("change", updateIsDesktop);
        return () => {
            mediaQuery.removeEventListener?.("change", updateIsDesktop);
        };
    }, []);
    useEffect(() => {
        const el = containerRef?.current;
        if (!el)
            return;
        const rect = el.getBoundingClientRect();
        const centeredPosition = {
            x: rect.width / 2,
            y: rect.height / 2,
            width: rect.width,
            height: rect.height,
        };
        targetRef.current = centeredPosition;
        setPos((prev) => ({
            x: isDesktop ? prev.x : rect.width / 2,
            y: isDesktop ? prev.y : rect.height / 2,
            width: rect.width,
            height: rect.height,
        }));
        if (!isDesktop) {
            return;
        }
        // Coalesce mousemove bursts to one state update (and one rect read)
        // per animation frame instead of re-rendering on every raw event.
        let frameId = null;
        let smoothingFrameId = null;
        let lastClientX = 0;
        let lastClientY = 0;
        const onMove = (e) => {
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            if (frameId !== null)
                return;
            frameId = requestAnimationFrame(() => {
                frameId = null;
                const nextRect = el.getBoundingClientRect();
                targetRef.current = {
                    x: lastClientX - nextRect.left,
                    y: lastClientY - nextRect.top,
                    width: nextRect.width,
                    height: nextRect.height,
                };
            });
        };
        const smoothToTarget = () => {
            const target = targetRef.current;
            setPos((prev) => {
                const nextX = prev.x + (target.x - prev.x) * safeLerp;
                const nextY = prev.y + (target.y - prev.y) * safeLerp;
                const shouldSnap = Math.abs(target.x - nextX) < 0.05 && Math.abs(target.y - nextY) < 0.05;
                const resolvedX = shouldSnap ? target.x : nextX;
                const resolvedY = shouldSnap ? target.y : nextY;
                if (prev.x === resolvedX &&
                    prev.y === resolvedY &&
                    prev.width === target.width &&
                    prev.height === target.height) {
                    return prev;
                }
                return {
                    x: resolvedX,
                    y: resolvedY,
                    width: target.width,
                    height: target.height,
                };
            });
            smoothingFrameId = requestAnimationFrame(smoothToTarget);
        };
        smoothingFrameId = requestAnimationFrame(smoothToTarget);
        let ro;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(() => {
                const nextRect = el.getBoundingClientRect();
                targetRef.current = {
                    ...targetRef.current,
                    width: nextRect.width,
                    height: nextRect.height,
                };
                setPos((prev) => ({
                    x: prev.x,
                    y: prev.y,
                    width: nextRect.width,
                    height: nextRect.height,
                }));
            });
            ro.observe(el);
        }
        el.addEventListener("mousemove", onMove);
        return () => {
            el.removeEventListener("mousemove", onMove);
            if (frameId !== null)
                cancelAnimationFrame(frameId);
            if (smoothingFrameId !== null)
                cancelAnimationFrame(smoothingFrameId);
            ro?.disconnect?.();
        };
    }, [containerRef, isDesktop, safeLerp]);
    return { ...pos, isDesktop };
}
function VariableFontAndCursor({ children, containerRef, fontVariationMapping = {
    y: { name: "wght", min: 100, max: 900 },
}, className = "", as: Tag = "span", transition = "transform 0.05s linear", transformOrigin = "bottom", skewXRange = { min: 0, max: -20 }, lerp = 0.2, color, }) {
    const { x, y, width, height, isDesktop } = useMousePosition(containerRef, lerp);
    let fontVariationSettings = '"wght" 400';
    let skewX = 0;
    if (isDesktop && width > 0 && height > 0) {
        const { y: yAxis } = fontVariationMapping;
        const yVal = mapRange(y, 0, height, yAxis.min, yAxis.max);
        fontVariationSettings = `"${yAxis.name}" ${yVal.toFixed(1)}`;
        skewX = mapRange(x, 0, width, skewXRange.min, skewXRange.max);
    }
    // Tag is a dynamic element type - a generic ElementType cast here produces
    // a "union type too complex to represent" error, so fall back to any.
    const Component = Tag;
    return (<Component className={className} style={{
            fontVariationSettings,
            transform: `skewX(${skewX}deg)`,
            transition,
            transformOrigin,
            display: "inline-block",
            ...(color ? { color } : {}),
        }}>
      {children}
    </Component>);
}
export default function CursorMove({ interClassName = "", containerClassName = "", backgroundClassName = "bg-zinc-950", paddingClassName = "p-24", showCrosshair = true, crosshairVariant = "solid", // "solid" | "dotted" | "dashed"
crosshairClassName = "bg-white/20", crosshairDottedColor = "rgba(255,255,255,0.2)", crosshairDottedDotLength = 2, crosshairDottedGap = 10, crosshairDashedColor = "rgba(255,255,255,0.2)", crosshairDashedDashLength = 10, crosshairDashedGap = 10, crosshairVerticalThicknessClassName = "w-px", crosshairHorizontalThicknessClassName = "h-px", crosshairVerticalClassName = "", crosshairHorizontalClassName = "", showCursorDot = true, cursorDotClassName = "w-3 h-3 bg-orange-500 rounded-sm", cursorDotStyle = {}, text = "hello!", textWrapperClassName = "flex items-center justify-center w-full h-full", textClassName = "text-9xl max-[1025px]:text-6xl max-md:text-5xl text-orange-500 select-none leading-none", textAs = "span", fontVariationMapping = {
    y: { name: "wght", min: 100, max: 900 },
}, variableTextTransition = "transform 0.05s linear", variableTextTransformOrigin = "bottom", skewXRange = { min: 0, max: -20 }, lerp = 0.2, showCoordinates = true, coordinatesClassName = "absolute bottom-8 left-8 flex flex-col font-mono", coordinatesTextClassName = "text-xs max-[1025px]:text-sm text-white/40 tabular-nums", textColor, crosshairColor, cursorDotColor, }) {
    const containerRef = useRef(null);
    const { x, y, isDesktop } = useMousePosition(containerRef, lerp);
    const prefersReducedMotion = usePrefersReducedMotion();
    const isPatternCrosshair = crosshairVariant === "dotted" || crosshairVariant === "dashed";
    const patternLength = crosshairVariant === "dashed"
        ? Math.max(0, Number(crosshairDashedDashLength) || 0)
        : Math.max(0, Number(crosshairDottedDotLength) || 0);
    const patternGap = crosshairVariant === "dashed"
        ? Math.max(0, Number(crosshairDashedGap) || 0)
        : Math.max(0, Number(crosshairDottedGap) || 0);
    const patternPeriod = patternLength + patternGap;
    // crosshairColor (a hex) overrides the class/variant colors; it is drawn at
    // 20% strength to keep the same subtle look as the defaults.
    const crosshairTint = crosshairColor
        ? `color-mix(in srgb, ${crosshairColor} 20%, transparent)`
        : undefined;
    const patternColor = crosshairTint ||
        (crosshairVariant === "dashed" ? crosshairDashedColor : crosshairDottedColor) ||
        "rgba(255,255,255,0.2)";
    return (<div ref={containerRef} className={`relative w-screen h-screen overflow-hidden cursor-none flex items-center justify-center ${backgroundClassName} ${paddingClassName} ${containerClassName} ${interClassName}`}>
      {showCrosshair && isDesktop ? (<>
          <div className={isPatternCrosshair
                ? `absolute top-0 h-full pointer-events-none ${crosshairVerticalThicknessClassName} ${crosshairVerticalClassName}`
                : `absolute top-0 h-full pointer-events-none ${crosshairVerticalThicknessClassName} ${crosshairClassName} ${crosshairVerticalClassName}`} style={{
                left: x,
                transform: "translateX(-50%)",
                backgroundImage: isPatternCrosshair
                    ? `repeating-linear-gradient(to bottom, ${patternColor} 0, ${patternColor} ${patternLength}px, transparent ${patternLength}px, transparent ${patternPeriod}px)`
                    : undefined,
                ...(!isPatternCrosshair && crosshairTint ? { backgroundColor: crosshairTint } : {}),
            }}/>
          <div className={isPatternCrosshair
                ? `absolute left-0 w-full pointer-events-none ${crosshairHorizontalThicknessClassName} ${crosshairHorizontalClassName}`
                : `absolute left-0 w-full pointer-events-none ${crosshairHorizontalThicknessClassName} ${crosshairClassName} ${crosshairHorizontalClassName}`} style={{
                top: y,
                transform: "translateY(-50%)",
                backgroundImage: isPatternCrosshair
                    ? `repeating-linear-gradient(to right, ${patternColor} 0, ${patternColor} ${patternLength}px, transparent ${patternLength}px, transparent ${patternPeriod}px)`
                    : undefined,
                ...(!isPatternCrosshair && crosshairTint ? { backgroundColor: crosshairTint } : {}),
            }}/>
        </>) : null}

      {showCursorDot && isDesktop ? (<div className={`absolute pointer-events-none z-20 ${cursorDotClassName}`} style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                ...(cursorDotColor ? { backgroundColor: cursorDotColor } : {}),
                ...cursorDotStyle,
            }}/>) : null}

      <div className={textWrapperClassName}>
        <VariableFontAndCursor containerRef={containerRef} fontVariationMapping={fontVariationMapping} className={`${cursorMoveFont.className} ${textClassName}`} as={textAs} transition={variableTextTransition} transformOrigin={variableTextTransformOrigin} skewXRange={skewXRange} lerp={lerp} color={textColor}>
          {text}
        </VariableFontAndCursor>
      </div>

      {showCoordinates && isDesktop ? (<div className={coordinatesClassName}>
          <span className={coordinatesTextClassName}>x: {Math.round(x)}</span>
          <span className={coordinatesTextClassName}>y: {Math.round(y)}</span>
        </div>) : null}

      {prefersReducedMotion && (<div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-[1025px]:hidden">
          <h2 className="text-sm leading-none text-white">
            The letters keep bending.
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/65">
            Cursor Move warps text and tracks coordinates live as you move
            the cursor. The animation is the interaction itself, so it
            can&apos;t be reduced.
          </p>
        </div>)}
    </div>);
}
