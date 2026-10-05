// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";
import React, { useEffect, useRef, useState } from "react";
const handlersByEl = new WeakMap();
let targets = []; // [{ el, rect }]
let hoveredTarget = null; // one of targets entries (same shape as targets[])
let needsBoundsUpdate = true;
let listenersAttached = false;
let refreshPending = false;
let mouseX = 0;
let mouseY = 0;
function toCachedRect(el) {
    const r = el.getBoundingClientRect();
    return {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
    };
}
function refreshTargets() {
    if (typeof document === 'undefined')
        return;
    const els = Array.from(document.querySelectorAll('.fx-target')).filter((el) => handlersByEl.has(el));
    targets = els.map((el) => ({
        el,
        rect: toCachedRect(el),
    }));
    // If the current hovered element disappeared, treat as leave.
    if (hoveredTarget) {
        const hoveredEl = hoveredTarget.el;
        const stillPresent = targets.find((t) => t.el === hoveredEl) || null;
        if (!stillPresent) {
            const prevEl = hoveredTarget.el;
            hoveredTarget = null;
            handlersByEl.get(prevEl)?.onLeave?.();
        }
        else {
            // Update reference to the newly cached rect.
            hoveredTarget = stillPresent;
        }
    }
    needsBoundsUpdate = false;
}
function scheduleRefreshTargets() {
    if (refreshPending)
        return;
    if (typeof window === 'undefined')
        return;
    refreshPending = true;
    window.requestAnimationFrame(() => {
        refreshPending = false;
        refreshTargets();
    });
}
function updateBoundsIfNeeded() {
    if (!needsBoundsUpdate)
        return;
    for (const t of targets)
        t.rect = toCachedRect(t.el);
    needsBoundsUpdate = false;
}
function updateHoverAndNotify() {
    if (!targets.length)
        return;
    updateBoundsIfNeeded();
    let newHoveredTarget = null;
    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (mouseX >= t.rect.left &&
            mouseX <= t.rect.right &&
            mouseY >= t.rect.top &&
            mouseY <= t.rect.bottom) {
            newHoveredTarget = t;
            break;
        }
    }
    if (newHoveredTarget !== hoveredTarget) {
        if (hoveredTarget) {
            handlersByEl.get(hoveredTarget.el)?.onLeave?.();
        }
        if (newHoveredTarget) {
            handlersByEl.get(newHoveredTarget.el)?.onEnter?.();
        }
        hoveredTarget = newHoveredTarget;
    }
    if (hoveredTarget) {
        const h = handlersByEl.get(hoveredTarget.el);
        if (h?.onMove) {
            h.onMove({
                localX: mouseX - hoveredTarget.rect.left,
                localY: mouseY - hoveredTarget.rect.top,
                mouseX,
                mouseY,
                rect: hoveredTarget.rect,
            });
        }
    }
}
function attachListenersOnce() {
    if (listenersAttached || typeof window === 'undefined')
        return;
    listenersAttached = true;
    const markNeedsUpdate = () => {
        needsBoundsUpdate = true;
    };
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateHoverAndNotify();
    }, { passive: true });
    // Cache bounds and refresh them lazily on the next mouse move.
    window.addEventListener('resize', markNeedsUpdate, { passive: true });
    window.addEventListener('scroll', markNeedsUpdate, { passive: true, capture: true });
}
export function registerFxTarget(el, handlers = {}) {
    if (!el)
        return;
    handlersByEl.set(el, handlers);
    attachListenersOnce();
    scheduleRefreshTargets();
}
export function unregisterFxTarget(el) {
    if (!el)
        return;
    handlersByEl.delete(el);
    // Hover may be stale; refresh the cached targets on the next frame.
    scheduleRefreshTargets();
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
const GRID_SIZE = 35;
const EFFECT_RADIUS = 40;
const MAX_TRAIL_LENGTH = 8;
const CELL_LIFETIME = 100;
const DEFAULT_GRID_IMAGE_URLS = Array.from({ length: 10 }, (_, i) => `https://picsum.photos/seed/pixel-bloom-${i}/400/400`);
const getCanvasSafeMediaUrl = (source) => source;
export default function PixelBloom({ src = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", type = "video", className = "h-[30vw] w-auto aspect-video", gridSize = GRID_SIZE, effectRadius = EFFECT_RADIUS, maxTrailLength = MAX_TRAIL_LENGTH, cellLifetime = CELL_LIFETIME, 
// Override to self-host the bloom tile images instead of the demo CDN.
gridImageUrls = DEFAULT_GRID_IMAGE_URLS, }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRef = useRef(null);
    const [gridImages, setGridImages] = useState([]);
    // When every tile image fails (CDN down, offline), show the media
    // directly instead of rendering an invisible component.
    const [gridLoadFailed, setGridLoadFailed] = useState(false);
    const cellImageMapRef = useRef(new Map());
    const trailRef = useRef([]);
    const sequenceRef = useRef(0);
    useEffect(() => {
        let cancelled = false;
        const images = [];
        let loadedCount = 0;
        const totalImages = gridImageUrls.length;
        if (!totalImages) {
            setGridLoadFailed(true);
            return undefined;
        }
        const finishIfDone = () => {
            if (cancelled || loadedCount !== totalImages)
                return;
            const usable = images.filter((image) => image.complete && image.naturalWidth > 0);
            if (usable.length) {
                setGridImages(usable);
                setGridLoadFailed(false);
            }
            else {
                setGridLoadFailed(true);
            }
        };
        gridImageUrls.forEach((url) => {
            const img = new window.Image();
            img.src = getCanvasSafeMediaUrl(url);
            img.onload = () => {
                loadedCount += 1;
                finishIfDone();
            };
            img.onerror = () => {
                loadedCount += 1;
                finishIfDone();
            };
            images.push(img);
        });
        return () => {
            cancelled = true;
        };
    }, [gridImageUrls]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const handlers = {
            onMove: ({ localX, localY }) => {
                const now = Date.now();
                const rand = () => Math.random() - 0.5;
                trailRef.current.unshift({
                    x: localX + rand() * 30,
                    y: localY + rand() * 30,
                    timestamp: now,
                });
                for (let i = 0; i < 2; i++) {
                    trailRef.current.unshift({
                        x: localX + rand() * 60,
                        y: localY + rand() * 60,
                        timestamp: now,
                    });
                }
                if (trailRef.current.length > maxTrailLength) {
                    trailRef.current.length = maxTrailLength;
                }
            },
            onLeave: () => { },
        };
        registerFxTarget(container, handlers);
        return () => {
            unregisterFxTarget(container);
        };
    }, [maxTrailLength]);
    useEffect(() => {
        const canvas = canvasRef.current;
        const media = mediaRef.current;
        const container = containerRef.current;
        if (!canvas || !media || !container || gridImages.length === 0)
            return;
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (!ctx)
            return;
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };
        const drawMediaCover = (mediaElement, context, canvasWidth, canvasHeight) => {
            const mediaWidth = type === "video"
                ? mediaElement.videoWidth
                : mediaElement.naturalWidth;
            const mediaHeight = type === "video"
                ? mediaElement.videoHeight
                : mediaElement.naturalHeight;
            if (!mediaWidth || !mediaHeight) {
                try {
                    context.drawImage(mediaElement, 0, 0, canvasWidth, canvasHeight);
                }
                catch {
                    return;
                }
                return;
            }
            const mediaAspect = mediaWidth / mediaHeight;
            const canvasAspect = canvasWidth / canvasHeight;
            let srcX;
            let srcY;
            let srcW;
            let srcH;
            if (mediaAspect > canvasAspect) {
                srcH = mediaHeight;
                srcW = mediaHeight * canvasAspect;
                srcX = (mediaWidth - srcW) / 2;
                srcY = 0;
            }
            else {
                srcW = mediaWidth;
                srcH = mediaWidth / canvasAspect;
                srcX = 0;
                srcY = (mediaHeight - srcH) / 2;
            }
            try {
                context.drawImage(mediaElement, srcX, srcY, srcW, srcH, 0, 0, canvasWidth, canvasHeight);
            }
            catch {
                return;
            }
        };
        const render = () => {
            const rect = container.getBoundingClientRect();
            const { width, height } = rect;
            const now = Date.now();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            drawMediaCover(media, ctx, width, height);
            trailRef.current = trailRef.current.filter((point) => now - point.timestamp < cellLifetime);
            const affectedCells = new Map();
            for (const { x: mx, y: my, timestamp } of trailRef.current) {
                if (mx < 0 || mx > width || my < 0 || my > height)
                    continue;
                const radius = effectRadius * (0.5 + Math.random() * 0.8);
                const startCol = Math.max(0, Math.floor((mx - radius) / gridSize));
                const endCol = Math.min(Math.ceil(width / gridSize), Math.ceil((mx + radius) / gridSize));
                const startRow = Math.max(0, Math.floor((my - radius) / gridSize));
                const endRow = Math.min(Math.ceil(height / gridSize), Math.ceil((my + radius) / gridSize));
                for (let row = startRow; row < endRow; row++) {
                    for (let col = startCol; col < endCol; col++) {
                        if (Math.random() > 0.7)
                            continue;
                        const cx = col * gridSize + gridSize / 2;
                        const cy = row * gridSize + gridSize / 2;
                        if (Math.hypot(cx - mx, cy - my) < radius) {
                            const key = `${col},${row}`;
                            if (!affectedCells.has(key) || timestamp > affectedCells.get(key)) {
                                affectedCells.set(key, timestamp);
                            }
                        }
                    }
                }
            }
            for (const [key, timestamp] of affectedCells) {
                const cell = cellImageMapRef.current.get(key);
                if (cell) {
                    cell.timestamp = timestamp;
                }
                else {
                    const index = sequenceRef.current % gridImages.length;
                    sequenceRef.current += 1;
                    cellImageMapRef.current.set(key, {
                        gridIndex: index,
                        timestamp,
                        randomDelay: Math.random() * 500,
                    });
                }
            }
            for (const [key, cell] of cellImageMapRef.current) {
                if (now - cell.timestamp > cellLifetime + (cell.randomDelay || 0) &&
                    Math.random() > 0.3) {
                    cellImageMapRef.current.delete(key);
                }
            }
            for (const [key, { gridIndex }] of cellImageMapRef.current) {
                const [col, row] = key.split(",").map(Number);
                const img = gridImages[gridIndex];
                if (!img?.complete)
                    continue;
                const iw = img.naturalWidth;
                const ih = img.naturalHeight;
                if (!iw || !ih)
                    continue;
                const imgAspect = iw / ih;
                let srcX;
                let srcY;
                let srcW;
                let srcH;
                if (imgAspect > 1) {
                    srcH = ih;
                    srcW = ih;
                    srcX = (iw - srcW) / 2;
                    srcY = 0;
                }
                else {
                    srcW = iw;
                    srcH = iw;
                    srcX = 0;
                    srcY = (ih - srcH) / 2;
                }
                ctx.drawImage(img, srcX, srcY, srcW, srcH, col * gridSize, row * gridSize, gridSize, gridSize);
            }
        };
        const loop = createSuspendedRaf({
            root: container,
            onFrame: render,
        });
        const startRender = () => {
            resizeCanvas();
            loop.start();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        if (type === "video") {
            media.addEventListener("loadeddata", startRender);
            media.addEventListener("play", startRender);
            if (media.readyState >= 2) {
                startRender();
            }
        }
        else {
            media.addEventListener("load", startRender);
            if (media.complete) {
                startRender();
            }
        }
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (type === "video") {
                media.removeEventListener("loadeddata", startRender);
                media.removeEventListener("play", startRender);
            }
            else {
                media.removeEventListener("load", startRender);
            }
            loop.destroy();
            cellImageMapRef.current.clear();
            trailRef.current = [];
        };
    }, [cellLifetime, effectRadius, gridImages, gridSize, src, type]);
    const defaultVideoSrc = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/draggable-video.mp4";
    return (<div ref={containerRef} className={`fx-target relative overflow-hidden rounded-2xl max-[1025px]:rounded-sm max-md:rounded-lg ${className}`}>
      {type === "video" ? (<video ref={mediaRef} src={src || defaultVideoSrc} autoPlay loop muted playsInline className={`absolute inset-0 h-full w-full object-cover ${gridLoadFailed ? "opacity-100" : "opacity-0"}`}/>) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={mediaRef} src={getCanvasSafeMediaUrl(src)} alt="asset-image" className={`absolute inset-0 h-full w-full object-cover ${gridLoadFailed ? "opacity-100" : "opacity-0"}`}/>)}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full"/>
    </div>);
}
