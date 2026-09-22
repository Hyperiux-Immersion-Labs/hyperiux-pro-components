// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";
import gsap from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, } from "react";
function glideDamp(from, to, lambda, deltaTime) {
    return from + (to - from) * (1 - Math.exp(-lambda * deltaTime));
}
function centeredMod(value, base) {
    let m = value % base;
    if (Math.abs(m) > base / 2) {
        m = m > 0 ? m - base : m + base;
    }
    return m;
}
const GLIDE_EVENT = "glidescroll";
let glideSupport;
function readGlideSupport() {
    return {
        hasWheelEvent: "onwheel" in document,
        hasMouseWheelEvent: "onmousewheel" in document,
        hasTouch: "ontouchstart" in document,
        isFirefox: navigator.userAgent.indexOf("Firefox") > -1,
    };
}
class GlideInput {
    #options;
    #el;
    #handlers = [];
    #event;
    #touchStart;
    listenerOptions;
    constructor(options = {}) {
        this.#el = options.el ?? window;
        if (!glideSupport)
            glideSupport = readGlideSupport();
        this.#options = {
            mouseMultiplier: options.mouseMultiplier ?? 1,
            touchMultiplier: options.touchMultiplier ?? 2,
            firefoxMultiplier: options.firefoxMultiplier ?? 15,
            useTouch: options.useTouch ?? true,
            passive: options.passive,
        };
        this.#event = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            originalEvent: new Event(GLIDE_EVENT),
        };
        this.#touchStart = { x: 0, y: 0 };
        if (this.#options.passive !== undefined) {
            this.listenerOptions = { passive: this.#options.passive };
        }
    }
    #notify(e) {
        const evt = this.#event;
        evt.x += evt.deltaX;
        evt.y += evt.deltaY;
        const payload = {
            x: evt.x,
            y: evt.y,
            deltaX: evt.deltaX,
            deltaY: evt.deltaY,
            originalEvent: e,
        };
        for (const handler of this.#handlers.slice())
            handler(payload);
    }
    #onWheel = (e) => {
        const evt = this.#event;
        const legacy = e;
        evt.deltaX = legacy.wheelDeltaX || e.deltaX * -1;
        evt.deltaY = legacy.wheelDeltaY || e.deltaY * -1;
        if (glideSupport.isFirefox && e.deltaMode === 1) {
            evt.deltaX *= this.#options.firefoxMultiplier;
            evt.deltaY *= this.#options.firefoxMultiplier;
        }
        evt.deltaX *= this.#options.mouseMultiplier;
        evt.deltaY *= this.#options.mouseMultiplier;
        this.#notify(e);
    };
    #onMouseWheel = (e) => {
        const evt = this.#event;
        const legacy = e;
        evt.deltaX = legacy.wheelDeltaX ? legacy.wheelDeltaX : 0;
        evt.deltaY = legacy.wheelDeltaY
            ? legacy.wheelDeltaY
            : (legacy.wheelDelta ?? 0);
        this.#notify(e);
    };
    #onTouchStart = (e) => {
        const t = e.targetTouches ? e.targetTouches[0] : e;
        this.#touchStart.x = t.pageX;
        this.#touchStart.y = t.pageY;
    };
    #onTouchMove = (e) => {
        const evt = this.#event;
        const t = e.targetTouches ? e.targetTouches[0] : e;
        evt.deltaX = (t.pageX - this.#touchStart.x) * this.#options.touchMultiplier;
        evt.deltaY = (t.pageY - this.#touchStart.y) * this.#options.touchMultiplier;
        this.#touchStart.x = t.pageX;
        this.#touchStart.y = t.pageY;
        this.#notify(e);
    };
    #bind() {
        if (glideSupport.hasWheelEvent) {
            this.#el.addEventListener("wheel", this.#onWheel, this.listenerOptions);
        }
        if (glideSupport.hasMouseWheelEvent) {
            this.#el.addEventListener("mousewheel", this.#onMouseWheel, this.listenerOptions);
        }
        if (glideSupport.hasTouch && this.#options.useTouch) {
            this.#el.addEventListener("touchstart", this.#onTouchStart, this.listenerOptions);
            this.#el.addEventListener("touchmove", this.#onTouchMove, this.listenerOptions);
        }
    }
    #unbind() {
        this.#el.removeEventListener("wheel", this.#onWheel);
        this.#el.removeEventListener("mousewheel", this.#onMouseWheel);
        this.#el.removeEventListener("touchstart", this.#onTouchStart);
        this.#el.removeEventListener("touchmove", this.#onTouchMove);
    }
    on(cb) {
        this.#handlers.push(cb);
        if (this.#handlers.length === 1)
            this.#bind();
    }
    destroy() {
        this.#handlers = [];
        this.#unbind();
    }
}
const GLIDE_TRACK_DEFAULTS = {
    infinite: true,
    snap: true,
    dragSensitivity: 0.005,
    lerpFactor: 0.12,
    scrollSensitivity: 1,
    snapStrength: 0.1,
    speedDecay: 0.85,
    bounceLimit: 1,
    scrollInput: false,
    endInset: 0.03,
    tiltStrength: 4.2,
};
const GLIDE_MAX_TILT = 5;
const GLIDE_AXIS_THRESHOLD = 5;
class GlideTrack {
    config;
    wrapper;
    items;
    viewport = { itemWidth: 0, wrapperWidth: 0, totalWidth: 0 };
    current = 0;
    target = 0;
    speed = 0;
    maxScroll = 0;
    deltaTime = 0;
    isDragging = false;
    isTouching = false;
    isVisible = false;
    #dragStart = 0;
    #dragStartTarget = 0;
    #touchStartX = 0;
    #touchStartY = 0;
    #touchPreviousX;
    #dragAxis;
    #previousTime = 0;
    #isActive = true;
    #isPaused = false;
    #isSettled = false;
    #currentSlide = 0;
    #previousSlide = 0;
    #currentTilt = 0;
    #hadActiveTilt = false;
    #resizeTimeout;
    #resizeObserver;
    #observer;
    #glideInput;
    #tickerFn;
    constructor(wrapper, config = {}) {
        this.config = { ...GLIDE_TRACK_DEFAULTS, ...config };
        this.wrapper = wrapper;
        this.items = [...wrapper.children];
        this.#measure();
        this.#watchVisibility();
        this.#addEventListeners();
        this.#setupGlideInput();
        this.wrapper.style.cursor = "grab";
        this.#tickerFn = this.update.bind(this);
        gsap.ticker.add(this.#tickerFn);
    }
    #measure() {
        const itemWidths = this.items.map((item) => item.getBoundingClientRect().width);
        const totalWidth = itemWidths.reduce((sum, width) => sum + width, 0);
        const itemWidth = itemWidths[0] ?? 0;
        this.viewport = {
            itemWidth,
            wrapperWidth: this.wrapper.clientWidth,
            totalWidth,
        };
        const endInset = this.config.endInset * this.wrapper.clientWidth;
        const trailing = this.config.infinite
            ? itemWidth
            : Math.max(0, Math.min(this.wrapper.clientWidth, totalWidth) - endInset);
        this.maxScroll = -(totalWidth - trailing) / (itemWidth || 1);
    }
    #watchVisibility() {
        this.#observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                this.isVisible = entry.isIntersecting;
            });
        }, { root: null, rootMargin: "50px", threshold: 0 });
        this.#observer.observe(this.wrapper);
    }
    #handleMouseDown = (e) => this.#dragBegin(e);
    #handleMouseMove = (e) => this.#dragMove(e);
    #handleMouseUp = () => this.#dragEnd();
    #handleTouchStart = (e) => {
        const touch = e.touches[0];
        this.#touchStartX = touch.clientX;
        this.#touchStartY = touch.clientY;
        this.#touchPreviousX = touch.clientX;
        this.#dragAxis = undefined;
        this.isTouching = true;
        this.#dragBegin(touch);
    };
    #handleTouchMove = (e) => {
        if (!this.isTouching || this.#isPaused)
            return;
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.#touchStartX);
        const deltaY = Math.abs(touch.clientY - this.#touchStartY);
        if (!this.#dragAxis &&
            (deltaX > GLIDE_AXIS_THRESHOLD || deltaY > GLIDE_AXIS_THRESHOLD)) {
            this.#dragAxis = deltaX > deltaY ? "horizontal" : "vertical";
        }
        if (this.#dragAxis !== "horizontal")
            return;
        e.preventDefault();
        this.#dragMove(touch);
        this.#touchPreviousX = touch.clientX;
    };
    #handleTouchEnd = () => {
        this.isTouching = false;
        this.#dragAxis = undefined;
        this.#touchPreviousX = undefined;
        this.#dragEnd();
    };
    #addEventListeners() {
        this.wrapper.addEventListener("mousedown", this.#handleMouseDown);
        window.addEventListener("mousemove", this.#handleMouseMove);
        window.addEventListener("mouseup", this.#handleMouseUp);
        this.wrapper.addEventListener("touchstart", this.#handleTouchStart);
        window.addEventListener("touchmove", this.#handleTouchMove, {
            passive: false,
        });
        window.addEventListener("touchend", this.#handleTouchEnd);
        this.#resizeObserver = new ResizeObserver(() => {
            if (this.#resizeTimeout)
                clearTimeout(this.#resizeTimeout);
            this.#resizeTimeout = setTimeout(() => this.resize(), 10);
        });
        this.#resizeObserver.observe(this.wrapper);
    }
    #setupGlideInput() {
        this.#glideInput = new GlideInput({
            el: this.wrapper,
            mouseMultiplier: 0.5,
            touchMultiplier: 2,
            firefoxMultiplier: 30,
            passive: true,
        });
        this.#glideInput.on((event) => {
            if (this.isDragging || this.#isPaused)
                return;
            if (event.touchDevice) {
                const deltaY = Math.abs(event.deltaY);
                const deltaX = Math.abs(event.deltaX);
                if (deltaY < GLIDE_AXIS_THRESHOLD && deltaX < GLIDE_AXIS_THRESHOLD)
                    return;
                if (deltaY > deltaX)
                    return;
            }
            const delta = !this.config.scrollInput
                ? event.deltaX
                : Math.abs(event.deltaX) > Math.abs(event.deltaY)
                    ? event.deltaX
                    : event.deltaY;
            const deltaValue = delta * this.config.scrollSensitivity * 0.001;
            let newTarget = this.target + deltaValue;
            if (!this.config.infinite) {
                newTarget = Math.min(0, Math.max(this.maxScroll, newTarget));
            }
            this.target = this.#clampToBounds(newTarget);
            this.speed = -deltaValue * 10;
        });
    }
    #clampToBounds(newTarget) {
        if (this.config.infinite)
            return newTarget;
        const bounce = this.config.bounceLimit;
        if (newTarget > bounce)
            return bounce;
        if (newTarget < this.maxScroll - bounce)
            return this.maxScroll - bounce;
        return newTarget;
    }
    #dragBegin(event) {
        if (this.#isPaused)
            return;
        this.isDragging = true;
        this.#dragStart = event.clientX;
        this.#dragStartTarget = this.target;
        this.wrapper.style.cursor = "grabbing";
    }
    #dragMove(event) {
        if (!this.isDragging || this.#isPaused)
            return;
        const delta = event.clientX - this.#dragStart;
        this.target = this.#clampToBounds(this.#dragStartTarget + delta * this.config.dragSensitivity);
        if ("movementX" in event) {
            this.speed += event.movementX * 0.01;
        }
        else {
            const previous = this.#touchPreviousX ?? event.clientX;
            this.speed += (event.clientX - previous) * 0.01;
        }
    }
    #dragEnd() {
        this.isDragging = false;
        this.wrapper.style.cursor = "grab";
        if (!this.config.infinite) {
            if (this.target > 0) {
                this.target = 0;
            }
            else if (this.target < this.maxScroll) {
                this.target = this.maxScroll;
            }
            else if (this.config.snap) {
                const snapped = Math.round(this.target);
                this.target =
                    this.target <= this.maxScroll + 0.5
                        ? this.maxScroll
                        : Math.min(0, Math.max(this.maxScroll, snapped));
            }
        }
        else if (this.config.snap) {
            this.target = Math.round(this.target);
        }
    }
    update() {
        if (!this.isVisible || !this.#isActive)
            return;
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.#previousTime) / 1000;
        this.#previousTime = currentTime;
        const isMoving = Math.abs(this.target - this.current) > 0.0001 ||
            this.isDragging ||
            this.isTouching ||
            Math.abs(this.speed) > 0.001;
        if (!isMoving) {
            if (this.#isSettled)
                return;
            this.current = this.target;
            this.#isSettled = true;
        }
        else {
            this.#isSettled = false;
        }
        if (this.config.snap && !this.isDragging) {
            let snapped = Math.round(this.target);
            if (!this.config.infinite) {
                snapped = snapped <= this.maxScroll ? this.maxScroll : Math.min(0, snapped);
                if (this.target <= this.maxScroll + 0.5)
                    snapped = this.maxScroll;
            }
            this.target += (snapped - this.target) * this.config.snapStrength;
        }
        if (isMoving) {
            this.current = glideDamp(this.current, this.target, 1 / this.config.lerpFactor, this.deltaTime);
        }
        const count = this.items.length;
        if (this.config.infinite) {
            const rawIndex = Math.round(-this.current);
            this.#setCurrentSlide(((rawIndex % count) + count) % count);
            this.#renderInfinite();
        }
        else {
            this.#setCurrentSlide(Math.round(Math.abs(this.current)));
            this.#renderFinite();
        }
        this.speed *= this.config.speedDecay;
        this.#renderTilt();
    }
    #renderInfinite() {
        const count = this.items.length;
        const itemWidth = this.viewport.itemWidth;
        for (let i = 0; i < count; i++) {
            const x = centeredMod(this.current + i, count) - i;
            this.items[i].style.transform = `translateX(${x * itemWidth}px)`;
        }
    }
    #renderFinite() {
        const translate = this.current * this.viewport.itemWidth;
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].style.transform = `translateX(${translate}px)`;
        }
    }
    #renderTilt() {
        if (!this.items.length || !this.config.tiltStrength)
            return;
        const diff = this.target - this.current;
        const targetTilt = Math.max(-GLIDE_MAX_TILT, Math.min(GLIDE_MAX_TILT, diff * this.config.tiltStrength));
        const dt = this.deltaTime ? Math.min(this.deltaTime, 0.05) : 0.016;
        this.#currentTilt = glideDamp(this.#currentTilt, targetTilt, 14, dt);
        const tilt = Math.abs(this.#currentTilt) > 0.01 ? this.#currentTilt : 0;
        if (tilt === 0 && Math.abs(targetTilt) < 0.001) {
            if (this.#hadActiveTilt) {
                this.#hadActiveTilt = false;
                this.#clearTilt();
            }
            return;
        }
        this.#hadActiveTilt = true;
        const tiltStr = `rotate(${tilt.toFixed(2)}deg)`;
        for (let i = 0; i < this.items.length; i++) {
            const card = (this.items[i].firstElementChild ||
                this.items[i]);
            card.style.transform = tiltStr;
            card.style.transformOrigin = "center bottom";
            card.style.willChange = "transform";
        }
    }
    #clearTilt() {
        for (let i = 0; i < this.items.length; i++) {
            const card = (this.items[i].firstElementChild ||
                this.items[i]);
            card.style.transform = "";
            card.style.willChange = "";
        }
    }
    goToNext() {
        this.target = this.config.infinite
            ? Math.round(this.target - 1)
            : Math.max(this.maxScroll, Math.round(this.target - 1));
    }
    goToPrev() {
        this.target = this.config.infinite
            ? Math.round(this.target + 1)
            : Math.min(0, Math.round(this.target + 1));
    }
    goToIndex(index) {
        if (!this.config.infinite) {
            this.target = -Math.min(Math.max(index, 0), this.items.length - 1);
            return;
        }
        const count = this.items.length;
        const currentIndex = ((Math.round(-this.target) % count) + count) % count;
        let step = index - currentIndex;
        if (Math.abs(step) > count / 2)
            step += step > 0 ? -count : count;
        this.target = Math.round(this.target) - step;
    }
    get currentSlide() {
        return this.#currentSlide;
    }
    #setCurrentSlide(newSlide) {
        if (this.#currentSlide === newSlide)
            return;
        this.#previousSlide = this.#currentSlide;
        this.#currentSlide = newSlide;
        this.config.onSlideChange?.(this.#currentSlide, this.#previousSlide);
    }
    set paused(value) {
        this.#isPaused = value;
    }
    get paused() {
        return this.#isPaused;
    }
    resize() {
        this.#measure();
        const wasActive = this.#isActive;
        const wasVisible = this.isVisible;
        this.#isActive = true;
        this.isVisible = true;
        this.#isSettled = false;
        this.update();
        this.#isActive = wasActive;
        this.isVisible = wasVisible;
    }
    destroy() {
        this.#isActive = false;
        gsap.ticker.remove(this.#tickerFn);
        this.wrapper.removeEventListener("mousedown", this.#handleMouseDown);
        window.removeEventListener("mousemove", this.#handleMouseMove);
        window.removeEventListener("mouseup", this.#handleMouseUp);
        this.wrapper.removeEventListener("touchstart", this.#handleTouchStart);
        window.removeEventListener("touchmove", this.#handleTouchMove);
        window.removeEventListener("touchend", this.#handleTouchEnd);
        if (this.#resizeTimeout)
            clearTimeout(this.#resizeTimeout);
        this.#resizeObserver?.disconnect();
        this.#observer?.disconnect();
        this.#glideInput?.destroy();
        this.#clearTilt();
        this.items.forEach((item) => {
            item.style.transform = "";
        });
        this.wrapper.style.cursor = "";
    }
}
const prefersReducedMotion = () => typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
const GlideCarousel = forwardRef(function GlideCarousel({ children, config, className = "", wrapperClassName = "", itemClassName = "", onSlideChange, }, ref) {
    const wrapperRef = useRef(null);
    const trackRef = useRef(null);
    const slideChangeRef = useRef(onSlideChange);
    useEffect(() => {
        slideChangeRef.current = onSlideChange;
    }, [onSlideChange]);
    const childArray = React.Children.toArray(children).filter(Boolean);
    const childCount = childArray.length;
    const configKey = JSON.stringify(config ?? {});
    useImperativeHandle(ref, () => ({
        goToNext: () => trackRef.current?.goToNext(),
        goToPrev: () => trackRef.current?.goToPrev(),
        goToIndex: (index) => trackRef.current?.goToIndex(index),
        getTrack: () => trackRef.current,
    }), []);
    useEffect(() => {
        if (!wrapperRef.current || childCount === 0)
            return;
        const track = new GlideTrack(wrapperRef.current, {
            ...JSON.parse(configKey),
            onSlideChange: (current) => slideChangeRef.current?.(current),
        });
        trackRef.current = track;
        return () => {
            track.destroy();
            trackRef.current = null;
        };
    }, [childCount, configKey]);
    return (<div className={`w-full overflow-hidden ${className}`}>
        <div ref={wrapperRef} className={`flex w-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${wrapperClassName}`}>
          {childArray.map((child, idx) => (<div key={idx} className={`shrink-0 ${itemClassName}`}>
              {child}
            </div>))}
        </div>
      </div>);
});
function GlideCard({ card }) {
    return (<div className="h-full w-full">
      <div className={`flex h-[var(--glide-card-height)] w-full flex-col gap-[1.2vw] overflow-hidden rounded-[1.2vw] border border-black/20 p-[2vw] select-none will-change-transform max-[1025px]:gap-[2vw] max-[1025px]:p-[3vw] max-md:w-full max-md:gap-[4vw] max-md:rounded-none max-md:px-6 max-md:py-10 ${card.themeClassName}`}>
        <div className="flex h-full flex-col gap-5">
          <span className="inline-flex w-fit items-center rounded-full border border-current px-4 py-2 text-[0.75rem] font-bold tracking-[0.12em] uppercase max-md:text-[0.68rem]">
            {card.subtitle}
          </span>

          <h2 className="m-0 text-5xl leading-[0.92] tracking-tighter max-[1025px]:text-[1.75rem] max-md:text-[1.45rem]">
            {card.title}
          </h2>

          <p className="m-0 max-w-[92%] text-[1.05rem] leading-[1.45] max-[1025px]:max-w-full max-[1025px]:text-[0.92rem] max-md:text-[0.88rem]">
            {card.description}
          </p>

          <div className="mt-auto flex flex-col gap-3.5">
            {card.points.map((point, pointIndex) => (<p key={pointIndex} className="m-0 border-t border-current py-3.5 text-[0.96rem] leading-[1.45] max-[1025px]:text-[0.92rem] max-md:text-[0.88rem]">
                {point}
              </p>))}
          </div>
        </div>
      </div>
    </div>);
}
const DEFAULT_CARDS = [
    {
        id: 1,
        title: "Luxury Residences",
        subtitle: "Dubai Marina",
        description: "Experience premium waterfront living with unmatched skyline views, private amenities, and a location built for modern luxury.",
        themeClassName: "bg-[#111844] text-white",
        points: [
            "Private infinity pool, spa, and concierge access.",
            "Floor-to-ceiling glass with panoramic marina views.",
            "Designed for buyers who want prestige and convenience.",
        ],
    },
    {
        id: 2,
        title: "Commercial Spaces",
        subtitle: "Downtown Business Bay",
        description: "High-performance office environments crafted for ambitious brands, fast-growing teams, and companies that want presence.",
        themeClassName: "bg-[#EAE0CF] text-[#111111]",
        points: [
            "Flexible layouts for studios, offices, and hybrid teams.",
            "Prime location close to transport, hotels, and retail.",
            "Ideal for startups, agencies, and enterprise hubs.",
        ],
    },
    {
        id: 3,
        title: "Beachfront Villas",
        subtitle: "Palm Jumeirah",
        description: "Escape into private coastal living with architectural elegance, serene surroundings, and direct beach access.",
        themeClassName: "bg-[#4B5694] text-[#ffffff]",
        points: [
            "Private beach entry and landscaped outdoor decks.",
            "Large family spaces with premium interior finishes.",
            "Created for a calmer, more exclusive lifestyle.",
        ],
    },
    {
        id: 4,
        title: "Skyline Penthouses",
        subtitle: "Jumeirah Lake Towers",
        description: "Elevated urban living for buyers who want privacy, prestige, and dramatic city views from every level.",
        themeClassName: "bg-[#8CC0EB] text-[#ffffff]",
        points: [
            "Expansive terraces with lounge and dining zones.",
            "Premium finishes and double-height living spaces.",
            "Perfect for statement living in the heart of the city.",
        ],
    },
    {
        id: 5,
        title: "Retail Boutiques",
        subtitle: "Dubai Hills",
        description: "Commercial retail environments positioned for visibility, high-value footfall, and strong brand presence.",
        themeClassName: "bg-[#2C5EAD] text-[#FFFFFF]",
        points: [
            "High-traffic locations inside premium districts.",
            "Flexible layouts for flagship retail experiences.",
            "Built for visibility, conversion, and long-term value.",
        ],
    },
    {
        id: 6,
        title: "Family Townhomes",
        subtitle: "Arabian Ranches",
        description: "Well-planned residential communities designed for spacious family living, convenience, and long-term comfort.",
        themeClassName: "bg-[#E8DDB4] text-[#111111]",
        points: [
            "Community parks, schools, and lifestyle amenities.",
            "Spacious interiors with practical modern layouts.",
            "A balanced choice for comfort and investment.",
        ],
    },
];
function buildLoopCards(cards, infinite) {
    if (cards.length === 0)
        return [];
    if (!infinite)
        return cards;
    return cards.length >= 8 ? cards : [...cards, ...cards];
}
export default function InfiniteCarousel({ cards = DEFAULT_CARDS, infinite = true, snap = true, draggable = true, autoPlay = false, autoPlayInterval = 3000, lerpFactor = 0.12, dragSensitivity = 0.005, snapStrength = 0.1, tiltOnScroll = false, tiltStrength = 4.2, showNav = true, cardWidth = 33.8, cardHeight = 60, gap = 1.9, bgColor = "#f4f0ea", }) {
    const carouselRef = useRef(null);
    const isHoveredRef = useRef(false);
    const scopeId = useId().replace(/:/g, "");
    const [activeIndex, setActiveIndex] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);
    const sourceCards = cards.length ? cards : DEFAULT_CARDS;
    const loopCards = useMemo(() => buildLoopCards(sourceCards, infinite), [sourceCards, infinite]);
    const resolvedCardWidth = Math.max(10, Number(cardWidth) || 33.8);
    const resolvedCardHeight = Math.max(20, Number(cardHeight) || 60);
    const resolvedGap = Math.max(0, Number(gap) || 0);
    const halfGap = Math.round((resolvedGap / 2) * 10) / 10;
    const slideCount = sourceCards.length;
    const activeCard = slideCount ? sourceCards[activeIndex % slideCount] : null;
    const slideAnnouncement = slideCount
        ? `${activeCard?.title.replace(/\n/g, " ") ?? "Slide"}, slide ${(activeIndex % slideCount) + 1} of ${slideCount}`
        : "";
    useEffect(() => {
        const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mediaQuery)
            return;
        const sync = (event) => {
            setReduceMotion("matches" in event ? event.matches : prefersReducedMotion());
        };
        sync(mediaQuery);
        mediaQuery.addEventListener("change", sync);
        return () => mediaQuery.removeEventListener("change", sync);
    }, []);
    const trackConfig = useMemo(() => ({
        infinite,
        snap,
        lerpFactor: reduceMotion ? 0.01 : Math.max(0.01, Number(lerpFactor) || 0.12),
        dragSensitivity: draggable ? Math.max(0, Number(dragSensitivity) || 0) : 0,
        snapStrength: reduceMotion ? 1 : Math.max(0, Number(snapStrength) || 0.1),
        tiltStrength: reduceMotion || !tiltOnScroll ? 0 : Math.max(0, Number(tiltStrength) || 0),
    }), [
        infinite,
        snap,
        reduceMotion,
        lerpFactor,
        draggable,
        dragSensitivity,
        snapStrength,
        tiltOnScroll,
        tiltStrength,
    ]);
    const handleNext = () => carouselRef.current?.goToNext();
    const handlePrev = () => carouselRef.current?.goToPrev();
    useEffect(() => {
        if (!autoPlay || reduceMotion || slideCount <= 1)
            return;
        const intervalMs = Math.max(200, Number(autoPlayInterval) || 3000);
        const id = window.setInterval(() => {
            if (isHoveredRef.current)
                return;
            carouselRef.current?.goToNext();
        }, intervalMs);
        return () => window.clearInterval(id);
    }, [autoPlay, autoPlayInterval, reduceMotion, slideCount]);
    return (<section data-glide-scope={scopeId} className="relative z-10 flex h-fit min-h-0 w-full flex-col gap-8 overflow-hidden px-0 py-4 max-[1025px]:gap-6 max-[1025px]:py-6 max-md:h-auto max-md:gap-4 bg-[var(--glide-bg-color)]" onPointerEnter={() => {
            isHoveredRef.current = true;
        }} onPointerLeave={() => {
            isHoveredRef.current = false;
        }}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {slideAnnouncement}
      </div>

      {showNav && (<div className="flex w-full items-center justify-center gap-4 px-[3vw] max-[1025px]:px-3 max-md:gap-3 max-md:px-2">
          <button type="button" onClick={handlePrev} aria-label="Previous slide" className="flex size-14 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-900 bg-transparent text-neutral-900 transition-colors duration-200 ease-in-out hover:bg-neutral-900 hover:text-white max-[1025px]:size-14 max-md:size-14">
            <ArrowLeft className="size-5"/>
          </button>

          <button type="button" onClick={handleNext} aria-label="Next slide" className="flex size-14 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-900 bg-transparent text-neutral-900 transition-colors duration-200 ease-in-out hover:bg-neutral-900 hover:text-white max-[1025px]:size-14 max-md:size-14">
            <ArrowRight className="size-5"/>
          </button>
        </div>)}

      <GlideCarousel ref={carouselRef} config={trackConfig} onSlideChange={setActiveIndex} wrapperClassName="py-[2vw]" itemClassName="box-border px-[var(--glide-item-pad)] max-md:w-screen max-md:px-[3vw]">
        {loopCards.map((card, idx) => (<div key={`${card.id}-${idx}`} aria-hidden={idx >= sourceCards.length} className="w-[var(--glide-card-width)] max-[1025px]:w-[52vw] max-md:w-full">
            <GlideCard card={card}/>
          </div>))}
      </GlideCarousel>

      <style>{`
        [data-glide-scope="${scopeId}"] {
          --glide-card-width: ${resolvedCardWidth}vw;
          --glide-card-height: ${resolvedCardHeight}vh;
          --glide-item-pad: ${halfGap}vw;
          --glide-bg-color: ${bgColor};
        }
      `}</style>
    </section>);
}
