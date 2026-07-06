"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldSkipSidebarDocsAnimation } from "@/lib/sidebar-navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => {};

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      ref.current = node;
    });
  };
}

export default function HeadAnim({
  children,
  animateOnScroll = true,
  delay = 0,
  animationKey = "",
}) {
  const containerRef = useRef(null);
  const splitRefs = useRef([]);
  const tweenRef = useRef(null);
  const triggerRef = useRef(null);
  const runIdRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const runId = ++runIdRef.current;

    tweenRef.current?.kill();
    triggerRef.current?.kill();

    splitRefs.current.forEach((split) => {
      split?.revert();
    });

    splitRefs.current = [];

    if (shouldSkipSidebarDocsAnimation()) {
      gsap.set(container, {
        opacity: 1,
        clearProps: "opacity,transform",
      });
      return;
    }

    let isKilled = false;

    gsap.set(container, {
      opacity: 0,
    });

    const elements = container.hasAttribute("data-copy-wrapper")
      ? Array.from(container.children)
      : [container];

    const run = async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {}
      }

      if (isKilled || runId !== runIdRef.current || !containerRef.current) {
        return;
      }

      const allChars = [];

      elements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines,words,chars",
          mask: "chars",
          wordsClass: "word++",
          charsClass: "char++",
          reduceWhiteSpace: false,
        });

        splitRefs.current.push(split);

        gsap.set(split.words, {
          display: "inline-block",
          whiteSpace: "nowrap",
        });

        allChars.push(...split.chars);
      });

      if (!allChars.length) {
        gsap.set(container, {
          opacity: 1,
          clearProps: "opacity",
        });
        return;
      }

      gsap.set(allChars, {
        yPercent: 100,
        rotate: 8,
        willChange: "transform",
      });

      gsap.set(container, {
        opacity: 1,
      });

      const animationProps = {
        yPercent: 0,
        rotate: 0,
        duration: 0.5,
        stagger: 0.02,
        ease: "power3.out",
        delay,
        onComplete: () => {
          gsap.set(allChars, {
            clearProps: "willChange",
          });

          ScrollTrigger.refresh(true);
        },
      };

      if (animateOnScroll) {
        tweenRef.current = gsap.to(allChars, {
          ...animationProps,
          scrollTrigger: {
            trigger: container,
            start: "top 70%",
            end: "bottom 50%",
            once: true,
          },
        });

        triggerRef.current = tweenRef.current.scrollTrigger;
      } else {
        tweenRef.current = gsap.to(allChars, animationProps);
      }
    };

    run();

    return () => {
      isKilled = true;

      tweenRef.current?.kill();
      triggerRef.current?.kill();

      splitRefs.current.forEach((split) => {
        split?.revert();
      });

      splitRefs.current = [];

      if (container) {
        gsap.set(container, {
          clearProps: "visibility,opacity,transform",
        });
      }
    };
  }, [animateOnScroll, delay, animationKey]);

  const child =
    React.Children.count(children) === 1
      ? React.Children.toArray(children)[0]
      : null;

  if (child && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ref: mergeRefs(child.ref, containerRef),
      style: {
        ...child.props.style,
        opacity: 0,
      },
    });
  }

  return (
    <div
      ref={containerRef}
      data-copy-wrapper="true"
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
}