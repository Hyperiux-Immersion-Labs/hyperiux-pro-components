"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function DemoFrame({ src, title, shouldMount }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-[#151515]">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151515] text20 text-white/40">
          Loading Preview
        </div>
      )}

      {shouldMount && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          data-sentry-block
          onLoad={() => setIsLoaded(true)}
          className="h-full w-full rounded-md border-0"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts"
          referrerPolicy="no-referrer"
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
              src="https://v8468r-3000.csb.app/"
              title="Image-Trail-1"
              shouldMount={shouldMountIframes}
            />
          </div>

          <div
            ref={effect2}
            className="w-full h-full rounded-md overflow-hidden bg-[#151515] border border-white/10"
          >
            <DemoFrame
              src="https://v8468r-3000.csb.app/card-stack"
              title="Image-Trail-2"
              shouldMount={shouldMountIframes}
            />
          </div>
        </div>
      </div>
    </section>
  );
}