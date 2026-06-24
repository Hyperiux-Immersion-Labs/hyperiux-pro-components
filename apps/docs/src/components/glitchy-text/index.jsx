"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

const GlitchyText = ({
  runOnScroll = false,
  triggerId = "glitch-section",
  start = "top 70%",
  end = "bottom 30%",
  once = true,
  markers = false,
  initialDelay = 2.5,
  replayDelay = 0.2,
  text = "Motion crafted differently",
}) => {
  const rootRef = useRef(null);
  const splitRef = useRef({});
  const scrollTriggerRef = useRef(null);
  const animationTimelineRef = useRef(null);

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const text4Ref = useRef(null);

  const [isDisabled, setIsDisabled] = useState(false);

  const runAnimation = useCallback((delay = 0.2) => {
    const { splitText, split2, split3, split4 } = splitRef.current;

    if (!splitText || !split2 || !split3 || !split4) return;

    animationTimelineRef.current?.kill();

    gsap.killTweensOf([
      ...splitText.chars,
      ...split2.chars,
      ...split3.chars,
      ...split4.chars,
    ]);

    gsap.set(split2.chars, { yPercent: 100 });
    gsap.set(split4.chars, { yPercent: 100 });
    gsap.set(splitText.chars, { yPercent: 0 });
    gsap.set(split3.chars, { yPercent: 0 });

    const tl = gsap.timeline({
      delay,
      defaults: {
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.025,
      },
    });

    animationTimelineRef.current = tl;

    tl.to(
      splitText.chars,
      {
        yPercent: -100,
      },
      0
    );

    tl.to(
      split3.chars,
      {
        yPercent: -100,
      },
      0.03
    );

    tl.to(
      split2.chars,
      {
        yPercent: 0,
      },
      0.2
    );

    tl.to(
      split4.chars,
      {
        yPercent: 0,
      },
      0.23
    );
  }, []);

  const handleReplay = () => {
    if (isDisabled) return;

    runAnimation(replayDelay);

    setIsDisabled(true);

    window.setTimeout(() => {
      setIsDisabled(false);
    }, 1800);
  };

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const splitText = new SplitText(text1Ref.current, {
      type: "chars,lines",
      linesClass: "lines",
    });

    const split2 = new SplitText(text2Ref.current, {
      type: "chars,lines",
      linesClass: "lines",
    });

    const split3 = new SplitText(text3Ref.current, {
      type: "chars,lines",
      linesClass: "lines",
    });

    const split4 = new SplitText(text4Ref.current, {
      type: "chars,lines",
      linesClass: "lines",
    });

    splitRef.current = {
      splitText,
      split2,
      split3,
      split4,
    };

    gsap.set(split2.chars, { yPercent: 100 });
    gsap.set(split4.chars, { yPercent: 100 });
    gsap.set(splitText.chars, { yPercent: 0 });
    gsap.set(split3.chars, { yPercent: 0 });

    if (runOnScroll) {
      const triggerElement = document.getElementById(triggerId) || root;

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: triggerElement,
        start,
        end,
        markers,
        once,
        onEnter: () => {
          runAnimation(0);
        },
        onEnterBack: () => {
          if (!once) {
            runAnimation(0);
          }
        },
      });
    } else {
      runAnimation(initialDelay);
    }

    return () => {
      animationTimelineRef.current?.kill();
      scrollTriggerRef.current?.kill();

      splitText.revert();
      split2.revert();
      split3.revert();
      split4.revert();

      splitRef.current = {};
      animationTimelineRef.current = null;
      scrollTriggerRef.current = null;
    };
  }, [
    runAnimation,
    runOnScroll,
    triggerId,
    start,
    end,
    once,
    markers,
    initialDelay,
    text,
  ]);

  return (
    <div
      id={triggerId}
      ref={rootRef}
      className="flex h-screen w-screen flex-col items-center justify-center bg-[#111111]"
    >
      <div className="relative h-[8.2vw] w-full overflow-hidden pl-[0.5vw] text-white">
        <div className="relative h-[6vw] w-full overflow-hidden">
          <p className="absolute left-[2vw] top-0 z-4 text-nowrap text-[6.5vw] italic uppercase leading-none tracking-tighter">
            <span ref={text1Ref} className="block">
              {text}
            </span>
          </p>

          <p className="absolute left-[2vw] top-0 z-2 text-nowrap text-[6.5vw] italic uppercase leading-none tracking-tighter text-yellow-500">
            <span ref={text3Ref} className="block">
              {text}
            </span>
          </p>

          <p className="absolute left-[2vw] top-0 z-8 text-nowrap text-[6.5vw] italic uppercase leading-none tracking-tighter">
            <span ref={text2Ref} className="block">
              {text}
            </span>
          </p>

          <p className="absolute left-[2vw] top-0 z-6 text-nowrap text-[6.5vw] italic uppercase leading-none tracking-tighter text-yellow-500">
            <span ref={text4Ref} className="block">
              {text}
            </span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleReplay}
        disabled={isDisabled}
        className={`mt-10 rounded-lg px-6 py-3 font-bold transition-all duration-300 ease-linear hover:scale-[0.95] ${
          isDisabled
            ? "cursor-not-allowed bg-gray-500 text-gray-300"
            : "bg-yellow-500 text-black"
        }`}
      >
        {isDisabled ? "Please wait..." : "Replay Animation"}
      </button>
    </div>
  );
};

export default GlitchyText;