"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import Button from "../WebsiteComps/Button";
import SplitLine from "../WebsiteComps/SplitLine";
import RandomBlur from "../WebsiteComps/RandomBlur";

gsap.registerPlugin(ScrollTrigger);

const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

function hasLoaderRun() {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(LOADER_STORAGE_KEY) === "true";
}

function isLoaderActive() {
  if (typeof window === "undefined") return false;

  return (
    document.body.classList.contains("loader-active") ||
    window.__HYPERIUX_LOADER_RUNNING__ === true
  );
}

const IFRAME_DESKTOP_WIDTH = 1200;

function DemoFrame({ src, title, shouldMount, category, description, href }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isExternal = src.startsWith("http");
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      setScale(w < IFRAME_DESKTOP_WIDTH ? w / IFRAME_DESKTOP_WIDTH : 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const needsScale = scale < 1;

  const handlePointerEnter = () => {
    iframeRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden rounded-md bg-[#151515]"
      onPointerEnter={handlePointerEnter}
    >
      {/* Crawlable and visually beautiful SSR / Fallback Representation */}
      <div 
        className={`absolute inset-0 z-10 flex flex-col justify-between p-8 bg-gradient-to-br from-[#181818] to-[#0c0c0c] transition-opacity duration-500 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-2xl font-semibold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-white/60 max-w-md leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Link 
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors group/btn"
          >
            <span>View Details & Code</span>
            <span className="transform transition-transform group-hover/btn:translate-x-1 font-sans">→</span>
          </Link>
          <span className="text-xs text-white/30 font-medium animate-pulse">
            Loading interactive canvas...
          </span>
        </div>
      </div>

      {shouldMount && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          tabIndex={0}
          loading="lazy"
          data-sentry-block
          onLoad={() => setIsLoaded(true)}
          className="rounded-md border-0 outline-none"
          style={{
            width: needsScale ? IFRAME_DESKTOP_WIDTH : "100%",
            height: needsScale ? `${100 / scale}%` : "100%",
            transform: needsScale ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          {...(isExternal
            ? {}
            : {
                sandbox:
                  "allow-forms allow-modals allow-popups allow-presentation allow-scripts allow-same-origin",
              })}
        />
      )}
    </div>
  );
}

export default function FeaturedEffects() {
  const sectionRef = useRef(null);
  const effect1 = useRef(null);
  const effect2 = useRef(null);

  const [loaderReady, setLoaderReady] = useState(false);
  const [sectionReady, setSectionReady] = useState(false);

  const shouldMountIframes = loaderReady && sectionReady;

  const markLoaderReady = useCallback(() => {
    if (typeof window === "undefined") return;

    window.setTimeout(() => {
      setLoaderReady(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
        });
      });
    }, 350);
  }, []);

  useEffect(() => {
    let poll;

    if (hasLoaderRun() && !isLoaderActive()) {
      markLoaderReady();
    } else {
      window.addEventListener("loaderComplete", markLoaderReady, {
        once: true,
      });

      poll = window.setInterval(() => {
        if (hasLoaderRun() && !isLoaderActive()) {
          window.clearInterval(poll);
          poll = null;
          markLoaderReady();
        }
      }, 80);
    }

    return () => {
      window.removeEventListener("loaderComplete", markLoaderReady);

      if (poll) {
        window.clearInterval(poll);
      }
    };
  }, [markLoaderReady]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionReady(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "400px 0px 400px 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!loaderReady) return;

    const section = sectionRef.current;
    const first = effect1.current;
    const second = effect2.current;

    if (!section || !first || !second) return;

    const ctx = gsap.context(() => {
      gsap.set(first, {
        xPercent: -100,
        force3D: true,
      });

      gsap.set(second, {
        xPercent: 100,
        force3D: true,
      });

      gsap.to([first, second], {
        xPercent: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "85% 80%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    });

    return () => {
      ctx.revert();
    };
  }, [loaderReady]);

  return (
    <section
      ref={sectionRef}
      id="FeaturedEffects"
      className="h-fit bg-background my-[10vw] max-md:mt-[40vw] gap-[2vw] max-md:gap-[8vw] flex-col w-full self-padd flex items-center justify-center overflow-x-hidden"
    >
      <p className="text22 text-light-grey">Featured Effects</p>

      <RandomBlur
        as="h2"
        className="text140 max-md:w-[70vw] text-center w-[80vw]"
      >
        Start with the effects people actually notice.
      </RandomBlur>

      <SplitLine
        delay={0.3}
        as="p"
        className="text34 text-center mt-[4vw] w-[80vw]"
      >
        A few high-impact patterns from the Vault - ready to preview, copy,
        install, and adapt.
      </SplitLine>

      <div className="w-full max-md:flex-col-reverse flex max-md:gap-[6vw] max-md:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col">
        <div className="w-fit max-md:mx-auto! max-md:mt-[6vw]">
          <Button text="Explore All Effects" href="/effects" />
        </div>

        <div className="w-full max-md:flex-col max-md:gap-[8vw] flex h-[50vh] max-sm:h-[50vh] max-md:h-[80vh] items-center gap-[2vw] justify-between">
          <div
            ref={effect1}
            className="w-full h-full rounded-md overflow-hidden bg-[#151515] border border-white/10"
          >
            <DemoFrame
              src="/embed/phantom-image-trail"
              title="Phantom Image Trail"
              shouldMount={shouldMountIframes}
              category="Cursor Effects"
              description="A fluid, high-performance image-revealing cursor effect built with GSAP and WebGL. Creates an immersive, tactile trail behind the pointer as it glides over elements."
              href="/effects/cursor-effects/phantom-image-trail"
            />
          </div>

          <div
            ref={effect2}
            className="w-full h-full rounded-md overflow-hidden bg-[#151515] border border-white/10"
          >
            <DemoFrame
              src="/embed/hover-stack"
              title="Hover Stack"
              shouldMount={shouldMountIframes}
              category="Creative Components"
              description="A sleek, layered 3D stacking hover card interaction. Layers fan out on hover, revealing rich detail, secondary actions, and progressive depth."
              href="/effects/components/hover-stack"
            />
          </div>
        </div>
      </div>
    </section>
  );
}