"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Button from "@/components/WebsiteComps/Button";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { useFadeUp } from "../Animations/gsapAnimations";

const SHIMMER_ANGLE = -45;
const SHIMMER_BASE_COLOR = "#272727";
const SHIMMER_COLOR = "#ffffff";

function NotFoundShimmerText({ children, className = "" }) {
  const shimmerRef = useRef(null);
  useFadeUp()

  useLayoutEffect(() => {
    const shimmerEl = shimmerRef.current;
    if (!shimmerEl) return;

    gsap.set(shimmerEl, {
      color: "transparent",
      backgroundImage: `linear-gradient(${SHIMMER_ANGLE}deg, ${SHIMMER_BASE_COLOR} 0%, ${SHIMMER_BASE_COLOR} 30%, ${SHIMMER_COLOR} 50%, ${SHIMMER_BASE_COLOR} 70%, ${SHIMMER_BASE_COLOR} 100%)`,
      backgroundSize: "250% 100%",
      backgroundPosition: "250% 0%",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      willChange: "background-position",
    });

    const shimmerTimeline = gsap.timeline({ repeat: -1 });

    shimmerTimeline
      .set(shimmerEl, { backgroundPosition: "130% 0%" })
      .to(shimmerEl, { backgroundPosition: "-30% 0%", duration: 4, ease: "none" })
      .to({}, { duration: 1 });

    return () => {
      shimmerTimeline.kill();
      gsap.set(shimmerEl, {
        clearProps: "color,backgroundImage,backgroundSize,backgroundPosition,backgroundClip,WebkitBackgroundClip,WebkitTextFillColor,willChange",
      });
    };
  }, []);

  return (
    <span ref={shimmerRef} className={className}>
      {children}
    </span>
  );
}

export default function NotFoundContent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <NotFoundShimmerText className="text-[15vw] uppercase font-medium font-laygrotesk leading-none max-sm:text-[30vw] max-md:text-[22vw] fadeup">
          404
        </NotFoundShimmerText>
        <SplitLine>
        <h1 className="mt-4 text-2xl font-medium">Page not found</h1>
        </SplitLine>
        <SplitLine>
        <p className="mt-4 text-foreground/70">
          The page you requested does not exist or may have moved.
        </p>
        </SplitLine>
        <div className="mt-8 mx-auto w-fit fadeup">
          <Button
            href="/"
            text="Return home"
            className="w-fit"
          />

        </div>
      </div>
    </main>
  );
}
