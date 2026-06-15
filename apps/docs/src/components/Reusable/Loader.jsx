'use client'

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

/**
 * Premium full-screen preloader with custom odometer counter.
 * Animates translation values directly via Refs and quickTo to avoid React state-render overhead.
 * Temporarily locks scroll and releases it upon completion.
 */
export default function Loader() {
  const containerRef = useRef(null);
  const counterWrapperRef = useRef(null);
  const percentRef = useRef(null);
  const hundredRef = useRef(null);
  const tenRef = useRef(null);
  const unitRef = useRef(null);
  
  const [isComplete, setIsComplete] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    // Stop Lenis scrolling on mount
    lenis?.stop();

    const counter = { value: 0 };
    const ctx = gsap.context(() => {
      const updateDigits = (value) => {
        const num = Math.min(Math.floor(value), 100);

        const hundreds = Math.min(Math.floor(num / 100), 1);
        const tens = Math.min(Math.floor(num / 10), 10);
        const units = num; // Units list is 0..100

        gsap.to(hundredRef.current, {
          y: -hundreds + "em",
          duration: 0.9,
          ease: "expo.out",
          overwrite: "auto",
        });

        gsap.to(tenRef.current, {
          y: -tens + "em",
          duration: 0.7,
          ease: "expo.out",
          overwrite: "auto",
        });

        gsap.to(unitRef.current, {
          y: -units + "em",
          duration: 0.45,
          ease: "expo.out",
          overwrite: "auto",
        });
      };

      const tl = gsap.timeline({
        onComplete: () => {
          setIsComplete(true);
          lenis?.start();
        }
      });

      // Segment 1: 0 -> 60 (very fast)
      tl.to(counter, {
        value: 60,
        duration: 1.3,
        ease: "power3.out",
        onUpdate() {
          updateDigits(counter.value);
        }
      }, 0);

      // Segment 2: 60 -> 85 (slower)
      tl.to(counter, {
        value: 85,
        duration: 1.6,
        ease: "power2.out",
        onUpdate() {
          updateDigits(counter.value);
        }
      });

      // Segment 3: 85 -> 96 (very slow)
      tl.to(counter, {
        value: 96,
        duration: 1.2,
        ease: "power1.out",
        onUpdate() {
          updateDigits(counter.value);
        }
      });

      // Segment 4: 96 -> 100 (finish)
      tl.to(counter, {
        value: 100,
        duration: 0.9,
        ease: "expo.out",
        onUpdate() {
          updateDigits(counter.value);
        }
      });

      // Exit slide up for the entire screen container
      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.4,
        ease: "expo.inOut",
      }, ">-0.1");
    });

    return () => {
      ctx.revert();
      lenis?.start(); // Safeguard to restore scroll if unmounted early
    };
  }, [lenis]);

  if (isComplete) return null;

  const hundredsDigits = [0, 1];
  const tensDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const unitsDigits = Array.from({ length: 101 }, (_, i) => i % 10);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-[9999] flex flex-col justify-between p-[4vw] max-sm:p-[8vw] select-none pointer-events-auto antialiased"
      style={{
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Header Info */}
      <div className="flex justify-between items-start w-full text-white/40 text20">
        <p>HYPERIUX VAULT</p>
        <p>INTERACTION SYSTEM</p>
      </div>

      {/* Main Counter Graphic */}
      <div className="flex items-end justify-start w-full">
        <div className="overflow-hidden flex items-end h-[1em] px-[0.08em] text-[22vw] max-sm:text-[28vw] font-semibold text-white leading-none tabular-nums">
          <div
            ref={counterWrapperRef}
            className="inline-flex items-center h-[1em]"
          >
            {/* Hundreds */}
            <div className="overflow-hidden h-[1em] w-[1ch] flex-shrink-0">
              <div 
                ref={hundredRef}
                style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
              >
                {hundredsDigits.map((n, i) => (
                  <div key={i} className="h-[1em] flex items-center justify-center leading-none">
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Tens */}
            <div className="overflow-hidden h-[1em] w-[1ch] flex-shrink-0">
              <div 
                ref={tenRef}
                style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
              >
                {tensDigits.map((n, i) => (
                  <div key={i} className="h-[1em] flex items-center justify-center leading-none">
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Units */}
            <div className="overflow-hidden h-[1em] w-[1ch] flex-shrink-0">
              <div 
                ref={unitRef}
                style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
              >
                {unitsDigits.map((n, i) => (
                  <div key={i} className="h-[1em] flex items-center justify-center leading-none">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <span
            ref={percentRef}
            className="text-[5vw] max-sm:text-[8vw] font-bold text-white/20 mb-[2.5vw] ml-[1vw] leading-none inline-block"
          >
            %
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-end w-full text-white/40 text20">
        <p>CREATIVE FRONTEND ENGINEERING</p>
        <p>© 2026</p>
      </div>
    </div>
  );
}
