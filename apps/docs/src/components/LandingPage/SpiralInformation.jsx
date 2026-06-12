import { useRef, useEffect } from "react";
import Button from "../Reusable/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function SpiralInformation() {
  const textRef = useRef(null);
  const buttonWrapperRef = useRef(null);
  const textRef2 = useRef(null);

  useEffect(() => {
    // Split main paragraph into lines
    const splittedParagraph = SplitText.create(textRef.current, {
      type: "lines",
      mask: "lines",
    });

    // Split textRef2 (the large h2) into chars for animation
    let splittedText2 = null;

    if (textRef2.current) {
      splittedText2 = SplitText.create(textRef2.current, {
        type: 'chars',
        charsClass: 'char',
      });
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#spiral-images",
          start: "47% center",
          end: "80% center",
          scrub: true,
          markers: false,
        },
      });

      // --- 1. Reveal main paragraph lines ---
      tl.fromTo(
        splittedParagraph.lines,
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          ease: "power2.out",
          stagger: 0.04,
          duration: 1,
        }
      );

      // --- 2. Button appears ---
      tl.fromTo(
        buttonWrapperRef.current,
        {
          opacity: 0,
          yPercent: 100,
        },
        {
          opacity: 1,
          ease: "power2.out",
          yPercent: 0,
          duration: 0.8,
        },
        "-=0.3"
      );

      // --- 3. Main paragraph exists up and fades ---
      tl.to(
        splittedParagraph.lines,
        {
          yPercent: -130,
          opacity: 0,
          ease: "power2.in",
          stagger: 0.02,
          duration: 1,
        },
        "+=0.5"
      ); // hold/delay before exit

      tl.to(
        buttonWrapperRef.current,
        {
          opacity: 0,
          ease: "power2.in",
          duration: 0.8,
        },
        "<"
      );

      // --- 4. Animate large h2 ("Not another static component kit.") with blur, after previous exit ---
      if (splittedText2 && splittedText2.chars) {
        tl.fromTo(
          splittedText2.chars,
          {
            opacity: 0,
            filter: 'blur(10px)',
          },
          {
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.03,
            ease: 'none',
            duration: 1,
          },
          "+=0.3"
        );
      }
    });

    return () => {
      ctx.revert();
      splittedParagraph.revert();
      if (splittedText2) splittedText2.revert();
    };
  }, []);

  return (
    <div className="w-full flex items-center gap-[3.5vw] flex-col self-padd justify-center h-screen mt-[-100vh] sticky top-0">
      <h2
        ref={textRef}
        className="text34 w-[45vw] mt-[5vw] leading-[1.6]! text-center"
      >
        Explore 100+ scroll effects, cursor systems, text animations, page
        transitions, WebGL scenes, navigation patterns, and creative UI
        components built for React, Next.js, Tailwind, GSAP, Motion, Three.js,
        and WebGL.
      </h2>
      <h2 ref={textRef2} className="text140 absolute left-1/2 -translate-x-1/2 w-[60vw] text-center">
        Not another static component kit.
      </h2>
      <div
        ref={buttonWrapperRef}
        className="flex items-center justify-center gap-[2vw]"
      >
        <Button text="Install CLI" />
        <Button text="Work with Hyperiux" variant="white" />
      </div>
    </div>
  );
}
