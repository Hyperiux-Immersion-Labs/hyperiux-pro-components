// Built using Hyperiux Vault: https://vault.hyperiux.com
import React, { useCallback, useEffect, useRef, useState } from "react";
// ---- utils.ts ----
export class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
}
export function lerpAngle(current, target, ease) {
    let delta = target - current;
    while (delta > Math.PI)
        delta -= 2 * Math.PI;
    while (delta < -Math.PI)
        delta += 2 * Math.PI;
    return current + delta * ease;
}
// ---- createSuspendedRaf.ts ----
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
// ---- arrows.tsx ----
class Arrow {
    pos;
    arrowsRef;
    dx;
    dy;
    angle;
    isHovered;
    originalPos;
    targetPos;
    constructor(position, arrowsRef) {
        this.pos = position;
        this.arrowsRef = arrowsRef;
        this.dx = 0;
        this.dy = 0;
        this.angle = 0;
        this.isHovered = false;
        this.originalPos = { ...position };
        this.targetPos = { ...position };
    }
    update(mouseX, mouseY, reactionRadius, angleSmoothing, positionSmoothing, allowSpacing) {
        this.dx = mouseX - this.pos.x;
        this.dy = mouseY - this.pos.y;
        const targetAngle = Math.atan2(this.dy, this.dx) * 0.95;
        this.angle = lerpAngle(this.angle, targetAngle, angleSmoothing);
        // Check if mouse is near this arrow
        const distance = Math.sqrt(Math.pow(mouseX - this.pos.x, 2) +
            Math.pow(mouseY - this.pos.y, 2));
        const wasHovered = this.isHovered;
        this.isHovered = distance < reactionRadius;
        // Handle spacing animation
        if (this.isHovered !== wasHovered && allowSpacing) {
            if (this.isHovered) {
                // Push surrounding arrows away
                this.arrowsRef.current.forEach(otherArrow => {
                    if (otherArrow !== this) {
                        const dx = otherArrow.pos.x - this.pos.x;
                        const dy = otherArrow.pos.y - this.pos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const pushRadius = reactionRadius * (70 / 30);
                        if (dist < pushRadius) {
                            const pushForce = (pushRadius - dist) / pushRadius;
                            otherArrow.targetPos = {
                                x: otherArrow.originalPos.x + (dx / dist) * 20 * pushForce,
                                y: otherArrow.originalPos.y + (dy / dist) * 20 * pushForce
                            };
                        }
                    }
                });
            }
            else {
                // Reset surrounding arrows
                this.arrowsRef.current.forEach(arrow => {
                    arrow.targetPos = { ...arrow.originalPos };
                });
            }
        }
        // Smooth position transition
        this.pos.x += (this.targetPos.x - this.pos.x) * positionSmoothing;
        this.pos.y += (this.targetPos.y - this.pos.y) * positionSmoothing;
    }
    draw(ctx, arrowColor, activeColor) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-20, 0);
        ctx.moveTo(20, 0);
        ctx.lineTo(5, -15);
        ctx.moveTo(20, 0);
        ctx.lineTo(5, 15);
        ctx.lineWidth = this.isHovered ? 3 : 2;
        ctx.strokeStyle = this.isHovered ? activeColor : arrowColor;
        ctx.stroke();
        ctx.restore();
    }
}
const Arrows = ({ arrowCount = 50, arrowColor = "black", activeColor = "black", reactionRadius = 30, smoothing = 0.15, }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const arrowsRef = useRef([]);
    const controlsRef = useRef({ arrowColor, activeColor, reactionRadius, smoothing });
    const lastReactionRadiusRef = useRef(reactionRadius);
    const suppressSpacingFramesRef = useRef(0);
    useEffect(() => {
        if (lastReactionRadiusRef.current !== reactionRadius) {
            lastReactionRadiusRef.current = reactionRadius;
            suppressSpacingFramesRef.current = 8;
            arrowsRef.current.forEach((arrow) => {
                arrow.targetPos = { ...arrow.originalPos };
            });
        }
        controlsRef.current = { arrowColor, activeColor, reactionRadius, smoothing };
    }, [activeColor, arrowColor, reactionRadius, smoothing]);
    const initializeArrows = useCallback((canvas) => {
        const arrows = [];
        const count = Math.max(1, Number(arrowCount) || 50);
        const spacing = 50 * Math.sqrt(50 / count);
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);
        const xPadding = (canvas.width - (cols * spacing)) / 2;
        const yPadding = (canvas.height - (rows * spacing)) / 2;
        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= cols; x++) {
                arrows.push(new Arrow(new Point(x * spacing + xPadding, y * spacing + yPadding), arrowsRef));
            }
        }
        return arrows;
    }, [arrowCount]);
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            arrowsRef.current = initializeArrows(canvas);
        }
    }, [initializeArrows]);
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouseRef.current = {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        }
    }, []);
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        const arrows = arrowsRef.current;
        const mouse = mouseRef.current;
        const controls = controlsRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const resolvedSmoothing = controls.smoothing === 0.12 ? 0.15 : controls.smoothing;
        const allowSpacing = suppressSpacingFramesRef.current <= 0;
        arrows.forEach(arrow => {
            arrow.update(mouse.x, mouse.y, controls.reactionRadius, resolvedSmoothing, resolvedSmoothing * (0.1 / 0.15), allowSpacing);
            arrow.draw(ctx, controls.arrowColor, controls.activeColor);
        });
        if (suppressSpacingFramesRef.current > 0) {
            suppressSpacingFramesRef.current -= 1;
        }
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        arrowsRef.current = initializeArrows(canvas);
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        const loop = createSuspendedRaf({
            root: canvas,
            onFrame: drawFrame,
        });
        loop.start();
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            loop.destroy();
        };
    }, [drawFrame, handleMouseMove, handleResize, initializeArrows]);
    return (
    // <div className="w-full h-full bg-white">
    <canvas ref={canvasRef} className="w-full h-full"/>
    // </div>
    );
};
// ---- ArrowsOpacity.tsx ----
class OpacityArrow {
    pos;
    dx;
    dy;
    angle;
    dist;
    constructor(position) {
        this.pos = position;
        this.dx = 0;
        this.dy = 0;
        this.angle = 0;
        this.dist = 0;
    }
    update(mx, my, smoothing) {
        this.dx = mx - this.pos.x;
        this.dy = my - this.pos.y;
        this.dist = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        const targetAngle = Math.atan2(this.dy, this.dx);
        this.angle += (targetAngle - this.angle) * smoothing;
    }
    draw(ctx, arrowColor, activeColor, reactionRadius) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(-30, 0);
        ctx.moveTo(30, 0);
        ctx.lineTo(5, -30);
        ctx.moveTo(30, 0);
        ctx.lineTo(5, 30);
        ctx.lineWidth = 5;
        const alpha = 1 - (this.dist / 300);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.strokeStyle = this.dist < reactionRadius ? activeColor : arrowColor;
        ctx.stroke();
        ctx.restore();
    }
}
const ArrowsOpacity = ({ arrowCount = 50, arrowColor = "black", activeColor = "black", reactionRadius = 30, smoothing = 0.12, }) => {
    const canvasRef = useRef(null);
    const arrowArrRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    useEffect(() => {
        const initializeArrows = (canvas) => {
            arrowArrRef.current = [];
            const count = Math.max(1, Number(arrowCount) || 50);
            const spacing = 75 * Math.sqrt(50 / count);
            for (let y = 0; y < canvas.height / 20; y++) {
                for (let x = 0; x < canvas.width / 50; x++) {
                    const arr = new OpacityArrow(new Point(x * spacing, y * spacing));
                    arrowArrRef.current.push(arr);
                }
            }
        };
        const handleResize = () => {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initializeArrows(canvas);
        };
        const handleMouseMove = (e) => {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
                mouseRef.current = { x: mouseX, y: mouseY };
            }
        };
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initializeArrows(canvas);
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        const loop = createSuspendedRaf({
            root: canvas,
            onFrame: () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const { x: mx, y: my } = mouseRef.current;
                for (let y = 0; y < canvas.height / 20; y++) {
                    for (let x = 0; x < canvas.width / 50; x++) {
                        const arrow = arrowArrRef.current[y * 10 + x];
                        if (arrow) {
                            arrow.update(mx, my, smoothing === 0.12 ? 1 : smoothing);
                            arrow.draw(ctx, arrowColor, activeColor, reactionRadius);
                        }
                    }
                }
            },
        });
        loop.start();
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            loop.destroy();
        };
    }, [activeColor, arrowColor, arrowCount, reactionRadius, smoothing]);
    return (<canvas ref={canvasRef} className="w-full h-full pointer-events-auto"/>);
};
// ---- ArrowsLimit.tsx ----
class LimitArrow {
    pos;
    dx;
    dy;
    angle;
    ease;
    constructor(position) {
        this.pos = position;
        this.dx = 0;
        this.dy = 0;
        this.angle = 0;
        this.ease = 0.1;
    }
    update(mouseX, mouseY, smoothing) {
        const targetDx = mouseX - this.pos.x;
        const targetDy = mouseY - this.pos.y;
        this.dx += (targetDx - this.dx) * smoothing;
        this.dy += (targetDy - this.dy) * smoothing;
        this.angle = Math.atan2(this.dy, this.dx);
    }
    draw(ctx, arrowColor, activeColor, mouseX, mouseY, reactionRadius) {
        const isActive = Math.hypot(mouseX - this.pos.x, mouseY - this.pos.y) < reactionRadius;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(-50, 0);
        ctx.moveTo(50, 0);
        ctx.lineTo(10, -40);
        ctx.moveTo(50, 0);
        ctx.lineTo(10, 40);
        ctx.lineWidth = 2;
        ctx.strokeStyle = isActive ? activeColor : arrowColor;
        ctx.stroke();
        ctx.restore();
    }
}
const ArrowsLimit = ({ rows = 5, columns = 10, arrowCount = 50, arrowColor = "black", activeColor = "black", reactionRadius = 30, smoothing = 0.035, }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const arrowsRef = useRef([]);
    const initializeArrows = useCallback((canvas) => {
        const arrows = [];
        const count = Math.max(1, Number(arrowCount) || 50);
        const scale = Math.sqrt(count / 50);
        const resolvedColumns = Math.max(1, Math.round(columns * scale));
        const resolvedRows = Math.max(1, Math.round(rows * scale));
        const spacingX = canvas.width / (resolvedColumns + 1);
        const spacingY = canvas.height / (resolvedRows + 1);
        for (let y = 1; y <= resolvedRows; y++) {
            for (let x = 1; x <= resolvedColumns; x++) {
                arrows.push(new LimitArrow(new Point(x * spacingX, y * spacingY)));
            }
        }
        return arrows;
    }, [arrowCount, columns, rows]);
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            arrowsRef.current = initializeArrows(canvas);
        }
    }, [initializeArrows]);
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        if (e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom) {
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    }, []);
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        const arrows = arrowsRef.current;
        const mouse = mouseRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const resolvedSmoothing = smoothing === 0.12 ? 0.035 : smoothing;
        arrows.forEach(arrow => {
            arrow.update(mouse.x, mouse.y, resolvedSmoothing);
            arrow.draw(ctx, arrowColor, activeColor, mouse.x, mouse.y, reactionRadius);
        });
    }, [activeColor, arrowColor, reactionRadius, smoothing]);
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        arrowsRef.current = initializeArrows(canvas);
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        const loop = createSuspendedRaf({
            root: canvas,
            onFrame: drawFrame,
        });
        loop.start();
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            loop.destroy();
        };
    }, [drawFrame, handleMouseMove, handleResize, initializeArrows]);
    return (<div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full "/>
    </div>);
};
// ---- ArrowsPlay.tsx ----
class PlayArrow {
    pos;
    dx;
    dy;
    angle;
    rotationEase;
    constructor(position) {
        this.pos = position;
        this.dx = 0;
        this.dy = 0;
        this.angle = 0;
        this.rotationEase = 0.12;
    }
    update(mouseX, mouseY, smoothing) {
        this.dx = mouseX - this.pos.x;
        this.dy = mouseY - this.pos.y;
        const targetAngle = Math.atan2(this.dy, this.dx);
        this.angle = lerpAngle(this.angle, targetAngle, smoothing);
    }
    draw(ctx, arrowColor, activeColor, mouseX, mouseY, reactionRadius) {
        const isActive = Math.hypot(mouseX - this.pos.x, mouseY - this.pos.y) < reactionRadius;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(-30, 0);
        ctx.moveTo(30, 0);
        ctx.lineTo(10, -20);
        ctx.moveTo(30, 0);
        ctx.lineTo(10, 20);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isActive ? activeColor : arrowColor;
        ctx.stroke();
        ctx.restore();
    }
}
const ArrowsPlay = ({ arrowCount = 50, arrowColor = "black", activeColor = "black", reactionRadius = 30, smoothing = 0.12, }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const arrowsRef = useRef([]);
    const divRef = useRef(null); // For the center div with text
    const initializeArrows = useCallback((canvas) => {
        const arrows = [];
        const count = Math.max(1, Number(arrowCount) || 50);
        const spacing = 120 * Math.sqrt(50 / count);
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);
        const xPadding = (canvas.width - (cols * spacing)) / 2;
        const yPadding = (canvas.height - (rows * spacing)) / 2;
        // Get div position relative to canvas
        const divRect = divRef.current.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const divLeft = divRect.left - canvasRect.left;
        const divRight = divRect.right - canvasRect.left;
        const divTop = divRect.top - canvasRect.top;
        const divBottom = divRect.bottom - canvasRect.top;
        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= cols; x++) {
                const arrowPos = new Point(x * spacing + xPadding, y * spacing + yPadding);
                if (arrowPos.x >= divLeft &&
                    arrowPos.x <= divRight &&
                    arrowPos.y > divTop + spacing &&
                    arrowPos.y < divBottom - spacing) {
                    continue;
                }
                arrows.push(new PlayArrow(arrowPos));
            }
        }
        return arrows;
    }, [arrowCount]);
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            arrowsRef.current = initializeArrows(canvas);
        }
    }, [initializeArrows]);
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        if (e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom) {
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    }, []);
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        const arrows = arrowsRef.current;
        const mouse = mouseRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        arrows.forEach(arrow => {
            arrow.update(mouse.x, mouse.y, smoothing);
            arrow.draw(ctx, arrowColor, activeColor, mouse.x, mouse.y, reactionRadius);
        });
    }, [activeColor, arrowColor, reactionRadius, smoothing]);
    useEffect(() => {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        mouseRef.current = {
            x: width / 2,
            y: height / 2,
        };
        arrowsRef.current = initializeArrows(canvas);
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        const loop = createSuspendedRaf({
            root: canvas,
            onFrame: drawFrame,
        });
        loop.start();
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            loop.destroy();
        };
    }, [drawFrame, handleMouseMove, handleResize, initializeArrows]);
    return (<div className="relative w-full h-full ">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer"/>
      <div ref={divRef} className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center cursor-pointer h-[25vw] w-[32vw] bg-transparent">
        <h1 className='text-center text-[15vw] leading-none transition-all duration-500 ease' style={{ color: arrowColor }}>
          Play
        </h1>
      </div>
    </div>);
};
// ---- lines.tsx ----
class LinePoint {
    x;
    y;
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    draw(ctx, mouseX, mouseY, lineLength, arrowColor, activeColor, reactionRadius) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const lineEndX = this.x + unitX * lineLength;
        const lineEndY = this.y + unitY * lineLength;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.strokeStyle = distance < reactionRadius ? activeColor : arrowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}
const Lines = ({ arrowCount = 50, arrowColor = "black", activeColor = "black", reactionRadius = 30, }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const pointsRef = useRef([]);
    const lineLength = 30;
    const initializePoints = useCallback((canvas) => {
        const points = [];
        const count = Math.max(1, Number(arrowCount) || 50);
        const spacing = 60 * Math.sqrt(50 / count);
        const cols = Math.ceil(canvas.width / spacing);
        const rows = Math.ceil(canvas.height / spacing);
        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= cols; x++) {
                points.push(new LinePoint(x * spacing, y * spacing));
            }
        }
        return points;
    }, [arrowCount]);
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            pointsRef.current = initializePoints(canvas);
        }
    }, [initializePoints]);
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pointsRef.current.forEach(point => point.draw(ctx, mouseRef.current.x, mouseRef.current.y, lineLength, arrowColor, activeColor, reactionRadius));
    }, [activeColor, arrowColor, reactionRadius]);
    useEffect(() => {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        pointsRef.current = initializePoints(canvas);
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        const loop = createSuspendedRaf({
            root: canvas,
            onFrame: drawFrame,
        });
        loop.start();
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            loop.destroy();
        };
    }, [drawFrame, handleMouseMove, handleResize, initializePoints]);
    return <canvas ref={canvasRef} className="w-full h-full cursor-pointer"/>;
};
// ---- index.tsx ----
// Built using Hyperiux Vault: https://vault.hyperiux.com
const variations = [
    {
        id: "dynamic-arrow",
        label: "Dynamic PlayArrow",
        frameClassName: "border-black/15 bg-white",
        component: Arrows,
    },
    {
        id: "dynamic-opacity",
        label: "Opacity",
        frameClassName: "border-black/15 bg-white",
        component: ArrowsOpacity,
    },
    {
        id: "smooth-response",
        label: "Smooth",
        frameClassName: "border-black/15 bg-white",
        component: ArrowsLimit,
    },
    {
        id: "vector-lines",
        label: "Lines",
        frameClassName: "border-black/15 bg-white",
        component: Lines,
    },
    {
        id: "playful-arrows",
        label: "Play",
        frameClassName: "border-black/15 bg-white",
        component: ArrowsPlay,
    },
];
function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setPrefersReducedMotion(mediaQuery.matches);
        update();
        mediaQuery.addEventListener("change", update);
        return () => mediaQuery.removeEventListener("change", update);
    }, []);
    return prefersReducedMotion;
}
const InteractiveArrows = (props) => {
    const [active, setActive] = useState(variations[0].id);
    const [isMobile, setIsMobile] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    useEffect(() => {
        // Tablet and mobile get the "Open on desktop" disclaimer instead of the effect.
        const mobileQuery = window.matchMedia("(max-width: 1025px)");
        const updateMobile = () => setIsMobile(mobileQuery.matches);
        updateMobile();
        mobileQuery.addEventListener("change", updateMobile);
        return () => mobileQuery.removeEventListener("change", updateMobile);
    }, []);
    const activeVariation = variations.find((variation) => variation.id === active) ?? variations[0];
    const ActiveComponent = activeVariation.component;
    if (isMobile) {
        return (<div className="flex min-h-screen w-full items-center justify-center bg-white px-6 text-center text-black">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Open on desktop</h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            Interactive Arrows needs a desktop pointer for the full hover response.
          </p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen w-full overflow-hidden bg-white text-black">
      <div className="flex min-h-screen flex-col px-8 py-8 max-md:px-6 max-md:py-6">
        <div className="mx-auto flex w-full max-w-350 justify-center">
          <div className="inline-flex flex-wrap  relative z-400 justify-center gap-2 rounded-full border p-2 backdrop-blur-sm border-black/10 bg-black/5">
            {variations.map((variation) => (<button key={variation.id} onClick={() => setActive(variation.id)} className={`cursor-pointer rounded-full px-5 py-2 text-sm transition-all duration-200 max-md:px-4 ${active === variation.id
                ? "bg-black text-white"
                : "bg-transparent text-black/60 hover:text-black"}`}>
                {variation.label}
              </button>))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-8 max-md:py-6">
          <div className={`h-[78vh] w-full max-w-350 overflow-hidden rounded-[28px] border transition-colors duration-300 ${activeVariation.frameClassName}`}>
            <ActiveComponent {...props}/>
          </div>
        </div>
      </div>
      {prefersReducedMotion && (<div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center">
          <h2 className="text-sm leading-none text-[#111111]">
            The arrows keep turning.
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/65">
            Each arrow reorients toward your cursor continuously. That
            motion is the entire effect, so it can&apos;t be scaled back for
            reduced motion preferences.
          </p>
        </div>)}
    </div>);
};
export default InteractiveArrows;
