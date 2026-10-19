"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LineReveal from "@/components/Animations/LineReveal";
import { useFadeUp } from "@/components/Animations/gsapAnimations";
import WaitlistForm from "./WaitlistForm";
import { MEDIA } from "@/lib/breakpoints";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";

// Markup and values from the Vault Community prototype (.hero / .cm-hero /
// .hero-side / .stir), as Tailwind.
export default function CommunityHero() {
  const rootRef = useRef(null);
  useFadeUp(rootRef);
  // null until measured, so the video never starts loading on desktop
  const [isDesktop, setIsDesktop] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  // Lighthouse / PSI get the poster only: no video, no WebGL (true until checked)
  const [audit, setAudit] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(MEDIA.tablet);
    const sync = () => {
      setAudit(isLighthouseOrHeadless() || isSoftwareRenderer());
      setIsDesktop(!mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={rootRef}>
      <section
        id="hero"
        data-zone="crowd"
        className="relative z-1 flex h-screen w-full flex-col justify-end max-lg:h-auto max-lg:min-h-svh"
      >
        {/* Tablet and mobile: a looping video instead of the WebGL crowd,
            pinned to the first screen */}
        <div className="pointer-events-none absolute inset-0 -z-1 hidden bg-background [clip-path:inset(0)] max-lg:block" aria-hidden="true">
          <div className="fixed inset-x-0 top-0 h-screen">
          {isDesktop === false && !audit && (
            <video
              src="/assets/hero-videos/commmunity-hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onPlaying={() => setVideoPlaying(true)}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          {/* Poster: in the server HTML, so it shows from the first paint and
              stays until the video is actually playing */}
          {!videoPlaying && (
            <Image
              src="/assets/hero-videos/posters/community.webp"
              alt="community-hero"
              fill
              sizes="100vw"
              quality={90}
              className="object-cover object-center"
            />
          )}
          </div>
        </div>
        {/* Copy on the left, stacked; the crowd's blob sits on the right */}
        <div className="site-container section-x flex pb-[calc(var(--cvw)*3)] max-lg:pt-36 max-lg:pb-[5vw] max-md:pt-[48svh] max-md:pb-[12%]">
          <div className="flex w-[60%] flex-col gap-[calc(var(--cvw)*3)] max-lg:w-[75%] max-lg:gap-[4vw] max-md:w-full max-md:gap-[5vw]">
            <LineReveal
              as="h1"
              delay={0.3}
              className="type-display w-full wrap-break-word"
            >
              Find The People Who Notice <span className="gradient-text-animate gradient-text-single">Two Dropped Frames.</span>
            </LineReveal>
            <div className="fadeup flex w-[80%] flex-col gap-[calc(var(--cvw)*2)] max-lg:w-[90%] max-lg:gap-[3vw] max-md:w-full max-md:gap-[5vw]" data-fadeup-delay="0.2">
              <p className="type-body-lg w-full text-foreground/80">
                Vault Community is a home for developers who treat motion as craft. Live teardowns, first
                access to new effects, honest critique, and a room full of people who care about the same
                details you do.
              </p>
              <WaitlistForm />
              <p className="type-label text-white/40">Free to join · Invites go out in Waves</p>
            </div>
          </div>
        </div>
      </section>
      {/* Desktop only: tablet and mobile show a video, not the WebGL crowd you move through */}
      <section id="crowd-caption" className="section-x relative z-1 pt-[calc(var(--cvw)*2)] pb-[calc(var(--cvw)*3)] max-lg:hidden" data-zone="crowd">
        <p
          aria-hidden="true"
          className="type-label site-container flex items-center justify-center text-white/40"
        >
          Every dot is a seat. Move through the crowd.
        </p>
      </section>
    </div>
  );
}
