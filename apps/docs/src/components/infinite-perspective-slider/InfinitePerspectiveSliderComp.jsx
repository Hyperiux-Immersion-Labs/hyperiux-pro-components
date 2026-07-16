"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const DEFAULT_CARD_WIDTH = 320;
const DEFAULT_CARD_GAP = 24;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1025;
const MOBILE_CARD_WIDTH = 240;
const MOBILE_CARD_GAP = 16;
const TABLET_CARD_WIDTH = 380;
const TABLET_CARD_GAP = 20;

const ACTIVE_CONTENT_CLEAR_DELTA = 2;

const TEXT_LEAVE_STAGGER = 0.04;

const getItemData = (item) => (typeof item === "string" ? { src: item } : item);

export function InfinitePerspectiveSliderComp({
  images = [],
  cardWidth = DEFAULT_CARD_WIDTH,
  cardGap = DEFAULT_CARD_GAP,
  perspective = 2200,
  scrollSpeed = 1.0,
  scrollLerp = 0.1,
  velocityLerp = 0.09,
  rotationSensitivity = 0.025,
  rotationDamp = 0.1,
  rotationLerp = 0.12,
  maxRotation = 80,
  scrollStopDelay = 180,
  textEnterDuration = 0.35,
  textLeaveDuration = 0.35,
  textStagger = 0.06,
}) {
  const stripRef = useRef(null);
  const settersRef = useRef([]);
  const cardRefs = useRef([]);
  const imageRefs = useRef([]);
  const numberRefs = useRef([]);
  const titleRefs = useRef([]);
  const descriptionRefs = useRef([]);

  const activeHoverIndexRef = useRef(null);
  const hoveredIndexRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollStopTimerRef = useRef(null);

  const leaveHandlersRef = useRef({});
  const enterHandlersRef = useRef({});

  const [viewportWidth, setViewportWidth] = useState(DEFAULT_CARD_WIDTH * 4);

  const isMobileViewport = viewportWidth < MOBILE_BREAKPOINT;
  const isTabletViewport =
    viewportWidth >= MOBILE_BREAKPOINT && viewportWidth < TABLET_BREAKPOINT;

  const resolvedCardWidth = isMobileViewport
    ? MOBILE_CARD_WIDTH
    : isTabletViewport
      ? TABLET_CARD_WIDTH
      : cardWidth;

  const resolvedCardGap = isMobileViewport
    ? MOBILE_CARD_GAP
    : isTabletViewport
      ? TABLET_CARD_GAP
      : cardGap;

  const cardStep = resolvedCardWidth + resolvedCardGap;

  const cardHeight = isMobileViewport
    ? "calc(40vh + 72px)"
    : isTabletViewport
      ? "calc(45vh + 84px)"
      : "calc(50vh + 96px)";

  // Read by the rAF loop and the pointer handlers so prop changes apply on the
  // next frame instead of tearing down the loop and snapping back to offset 0.
  const configRef = useRef(null);

  configRef.current = {
    cardStep,
    cardWidth: resolvedCardWidth,
    isMobileViewport,
    isTabletViewport,
    scrollSpeed,
    scrollLerp,
    velocityLerp,
    rotationSensitivity,
    rotationDamp,
    rotationLerp,
    maxRotation,
    scrollStopDelay,
    textEnterDuration,
    textLeaveDuration,
    textStagger,
  };

  const stateRef = useRef({
    current: 0,
    target: 0,
    raf: null,
    velocity: 0,
    smoothVelocity: 0,
    rotationVelocity: 0,
    currentRotation: 0,
    prevDirection: 0,
    isDragging: false,
    lastX: 0,
  });

  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const clearActiveContent = useCallback(() => {
    const activeIndex = activeHoverIndexRef.current;

    if (activeIndex === null) return;

    const leaveHandler = leaveHandlersRef.current[activeIndex];

    if (leaveHandler) {
      leaveHandler();
    }

    activeHoverIndexRef.current = null;
  }, []);

  const markScrolling = useCallback(() => {
    isScrollingRef.current = true;
    clearActiveContent();

    if (scrollStopTimerRef.current) {
      window.clearTimeout(scrollStopTimerRef.current);
    }

    scrollStopTimerRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollStopTimerRef.current = null;

      const hoveredIndex = hoveredIndexRef.current;

      if (hoveredIndex === null) return;

      const enterHandler = enterHandlersRef.current[hoveredIndex];

      if (enterHandler) {
        enterHandler();
      }
    }, configRef.current.scrollStopDelay);
  }, [clearActiveContent]);

  const initSetters = () => {
    if (!stripRef.current) return;

    settersRef.current = Array.from(stripRef.current.children).map((element) => ({
      x: gsap.quickSetter(element, "x", "px"),
      rotateY: gsap.quickSetter(element, "rotateY", "deg"),
    }));
  };

  const positionCards = useCallback(
    (offset, rotation) => {
      const strip = stripRef.current;

      if (!strip || !images.length) return;

      const { cardStep: step, cardWidth: width } = configRef.current;

      const cards = strip.children;
      const setters = settersRef.current;

      const count = images.length;
      const loopWidth = count * step;

      const viewW = window.innerWidth;
      const centerX = viewW / 2;
      const centreOffset = centerX - width / 2;

      for (let index = 0; index < cards.length; index += 1) {
        let x = index * step - offset + centreOffset;

        x = ((x % loopWidth) + loopWidth) % loopWidth;

        if (x > loopWidth - step) {
          x -= loopWidth;
        }

        setters[index]?.x(x);
        setters[index]?.rotateY(rotation);
      }
    },
    [images]
  );

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!images.length) return;

    const state = stateRef.current;

    initSetters();

    const tick = () => {
      const config = configRef.current;
      const loopWidth = images.length * config.cardStep;

      state.current = lerp(state.current, state.target, config.scrollLerp);
      state.velocity = state.target - state.current;

      state.smoothVelocity = lerp(
        state.smoothVelocity,
        state.velocity,
        config.velocityLerp
      );

      state.rotationVelocity = lerp(
        state.rotationVelocity,
        state.velocity,
        config.rotationDamp
      );

      const absVel = Math.abs(state.rotationVelocity);
      const sign = Math.sign(state.rotationVelocity);
      const targetRotation = sign * absVel * config.rotationSensitivity;

      state.currentRotation = lerp(
        state.currentRotation,
        targetRotation,
        config.rotationLerp
      );

      const finalRotation = clamp(
        state.currentRotation,
        -config.maxRotation,
        config.maxRotation
      );

      if (Math.abs(state.current - state.target) < 0.05) {
        const shift = Math.round(state.current / loopWidth) * loopWidth;

        state.current -= shift;
        state.target -= shift;
      }

      positionCards(state.current, finalRotation);

      state.raf = requestAnimationFrame(tick);
    };

    const onWheel = (event) => {
      const config = configRef.current;

      if (config.isMobileViewport || config.isTabletViewport) return;

      const delta = event.deltaY;

      if (Math.abs(delta) >= ACTIVE_CONTENT_CLEAR_DELTA) {
        markScrolling();
      }

      state.target += delta * config.scrollSpeed;
    };

    const onDown = (clientX) => {
      state.isDragging = true;
      state.lastX = clientX;
      markScrolling();
    };

    const onMove = (clientX) => {
      if (!state.isDragging) return;

      const delta = clientX - state.lastX;

      state.lastX = clientX;

      if (Math.abs(delta) >= ACTIVE_CONTENT_CLEAR_DELTA) {
        markScrolling();
      }

      state.target += -delta * configRef.current.scrollSpeed;
    };

    const onUp = () => {
      state.isDragging = false;
    };

    const handleMouseDown = (event) => onDown(event.clientX);
    const handleMouseMove = (event) => onMove(event.clientX);
    const handleMouseUp = () => onUp();

    const handleTouchStart = (event) => onDown(event.touches[0].clientX);
    const handleTouchMove = (event) => onMove(event.touches[0].clientX);
    const handleTouchEnd = () => onUp();

    const onResize = () => {
      markScrolling();
      initSetters();
      positionCards(state.current, state.currentRotation);
    };

    state.current = 0;
    state.target = 0;
    state.velocity = 0;
    state.smoothVelocity = 0;
    state.rotationVelocity = 0;
    state.currentRotation = 0;
    state.prevDirection = 0;

    activeHoverIndexRef.current = null;
    hoveredIndexRef.current = null;
    isScrollingRef.current = false;

    positionCards(0, 0);
    gsap.set(cardRefs.current, { opacity: 1 });

    state.raf = requestAnimationFrame(tick);

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      cancelAnimationFrame(state.raf);

      if (scrollStopTimerRef.current) {
        window.clearTimeout(scrollStopTimerRef.current);
      }

      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);

      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [images, positionCards, markScrolling]);

  useEffect(() => {
    if (!images.length) return;

    const animations = [];

    leaveHandlersRef.current = {};
    enterHandlersRef.current = {};
    activeHoverIndexRef.current = null;
    hoveredIndexRef.current = null;

    cardRefs.current.forEach((card, index) => {
      const image = imageRefs.current[index];
      const number = numberRefs.current[index];
      const title = titleRefs.current[index];
      const description = descriptionRefs.current[index];

      if (!card || !image || !number || !title || !description) return;

      const numberSplit = SplitText.create(number, {
        type: "lines",
        mask: "lines",
      });

      const titleSplit = SplitText.create(title, {
        type: "lines",
        mask: "lines",
      });

      const descriptionSplit = SplitText.create(description, {
        type: "lines",
        mask: "lines",
      });

      const numberLines = numberSplit.lines;
      const titleLines = titleSplit.lines;
      const descriptionLines = descriptionSplit.lines;

      const allLines = [...numberLines, ...titleLines, ...descriptionLines];

      gsap.set([number, title, description], {
        autoAlpha: 0,
      });

      gsap.set(allLines, {
        yPercent: 100,
      });

      const enter = () => {
        if (isScrollingRef.current) return;

        if (
          activeHoverIndexRef.current !== null &&
          activeHoverIndexRef.current !== index
        ) {
          const previousLeave =
            leaveHandlersRef.current[activeHoverIndexRef.current];

          if (previousLeave) {
            previousLeave();
          }
        }

        activeHoverIndexRef.current = index;

        const { textEnterDuration: duration, textStagger: stagger } =
          configRef.current;

        gsap.killTweensOf(allLines);
        gsap.killTweensOf([number, title, description]);

        gsap
          .timeline({
            defaults: {
              ease: "power3.out",
              overwrite: "auto",
            },
          })
          .set([number, title, description], { autoAlpha: 1 })
          .to(
            numberLines,
            {
              yPercent: 0,
              duration,
              stagger,
            },
            0
          )
          .to(
            [titleLines, descriptionLines],
            {
              yPercent: 0,
              duration,
              stagger,
            },
            0.05
          );
      };

      const leave = () => {
        if (activeHoverIndexRef.current === index) {
          activeHoverIndexRef.current = null;
        }

        const { textLeaveDuration: duration } = configRef.current;

        gsap.killTweensOf(allLines);
        gsap.killTweensOf([number, title, description]);

        gsap
          .timeline({
            defaults: {
              ease: "power3.in",
              overwrite: "auto",
            },
          })
          .to(
            [titleLines, descriptionLines],
            {
              yPercent: 100,
              duration,
              stagger: TEXT_LEAVE_STAGGER,
            },
            0
          )
          .to(
            numberLines,
            {
              yPercent: 100,
              duration,
              stagger: TEXT_LEAVE_STAGGER,
            },
            0.04
          )
          .set([number, title, description], { autoAlpha: 0 });
      };

      const handleImageEnter = () => {
        hoveredIndexRef.current = index;

        if (isScrollingRef.current) return;

        enter();
      };

      const handleImageLeave = () => {
        if (hoveredIndexRef.current === index) {
          hoveredIndexRef.current = null;
        }

        leave();
      };

      enterHandlersRef.current[index] = enter;
      leaveHandlersRef.current[index] = leave;

      image.addEventListener("mouseenter", handleImageEnter);
      image.addEventListener("mouseleave", handleImageLeave);

      animations.push({
        image,
        handleImageEnter,
        handleImageLeave,
        numberSplit,
        titleSplit,
        descriptionSplit,
      });
    });

    return () => {
      animations.forEach(
        ({
          image,
          handleImageEnter,
          handleImageLeave,
          numberSplit,
          titleSplit,
          descriptionSplit,
        }) => {
          image.removeEventListener("mouseenter", handleImageEnter);
          image.removeEventListener("mouseleave", handleImageLeave);

          numberSplit.revert();
          titleSplit.revert();
          descriptionSplit.revert();
        }
      );

      leaveHandlersRef.current = {};
      enterHandlersRef.current = {};
      activeHoverIndexRef.current = null;
      hoveredIndexRef.current = null;
    };
  }, [images]);

  return (
    <div className="h-fit w-screen overflow-hidden">
      <div
        className="pointer-events-none relative flex h-full items-center overflow-hidden max-md:items-center"
        style={{ perspective: `${perspective}px` }}
      >
        <div
          ref={stripRef}
          className="transform-3d relative w-full"
          style={{ height: cardHeight }}
        >
          {images.map((item, index) => {
            const { src, number, title, desc, description } = getItemData(item);

            return (
              <div
                key={index}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="pointer-events-auto absolute left-0 top-0 opacity-0 will-change-transform"
                style={{
                  width: resolvedCardWidth,
                  height: cardHeight,
                  transformOrigin: "center center",
                  transform: "translateZ(1px)",
                }}
              >
                <div
                  ref={(element) => {
                    numberRefs.current[index] = element;
                  }}
                  className="mb-2 text-2xl leading-none tracking-tight text-black opacity-0 max-md:text-xl max-sm:mb-1 max-sm:text-lg"
                >
                  {number}
                </div>

                <div
                  ref={(element) => {
                    imageRefs.current[index] = element;
                  }}
                  className="relative h-[50vh] w-full overflow-hidden bg-white max-md:h-[45vh] max-sm:h-[40vh]"
                >
                  <img
                    src={src}
                    alt={`slide-${index}`}
                    className="object-cover h-full w-full absolute inset-0"
                    draggable={false}
                  />
                </div>

                <div className="mt-2 space-y-1">
                  <div
                    ref={(element) => {
                      titleRefs.current[index] = element;
                    }}
                    className="text-xl uppercase leading-none tracking-[0.04em] text-black opacity-0 max-md:text-lg max-sm:text-base"
                  >
                    {title}
                  </div>

                  <div
                    ref={(element) => {
                      descriptionRefs.current[index] = element;
                    }}
                    className="text-sm leading-none text-black/70 opacity-0 max-md:text-xs max-sm:text-xs"
                  >
                    {desc || description || ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
