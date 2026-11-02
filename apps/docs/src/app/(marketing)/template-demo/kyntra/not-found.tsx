// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import "./kyntra-styles.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import CharStaggerPrimaryButton from "./components/effects/char-stagger-primary-button";
import { FadeUp, ParaAnim } from "./components/Animations/gsapAnim";
import { useReducedMotionSync } from "./components/Animations/reducedMotion";
import kyntraLogo from "./assets/kyntra-logo.webp";

const HOME = "/template-demo/kyntra";
const TITLE = "Page not found | Kyntra";

// Same shader as the hero, desktop only; phones get the hero's CSS fallback.
// The copy keeps a soft shadow so it reads on its light band too.
const Gradient = dynamic(() => import("./components/shader/gradient"), {
  ssr: false,
});

// No IntroOverlay, Header or footer here: their #section links have nothing to
// scroll to on a 404, so the page keeps just the logo and one way home
const NotFound = () => {
  // A 404 only gets its layout's metadata title, and Next can stream that in after
  // this runs, so the tab title is set here and re-applied whenever <head> changes.
  // That rewrites the layout's own <title>, so its text is restored on the way out.
  useEffect(() => {
    const originals = new Map<HTMLTitleElement, string>();
    const apply = () => {
      const el = document.querySelector("title");
      if (!el || el.textContent === TITLE) return;
      if (!originals.has(el)) originals.set(el, el.textContent ?? "");
      el.textContent = TITLE;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      originals.forEach((text, el) => {
        if (el.isConnected && el.textContent === TITLE) el.textContent = text;
      });
    };
  }, []);
  const reduced = useReducedMotionSync();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1026px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="kyntra-page relative min-h-svh w-full overflow-hidden bg-white">

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.4 : 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {isDesktop ? (
            <Gradient baseStart={0.3} waveHeight={0.22} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#000000_0%,#000000_18%,#0A1633_32%,#16295F_46%,#26429C_58%,#3E63D0_70%,#6E8FE2_82%,#B9CCF4_92%,#ffffff_100%)]" />
          )}
        </motion.div>
      </div>

      <header className="absolute inset-x-0 top-0 z-20 px-[3vw] py-[1.1vw] max-lg:px-[5%] max-lg:py-[5%]">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.3 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href={HOME} className="flex w-fit items-center" aria-label="Kyntra home">
            <div className="h-fit w-[8vw] max-lg:w-[20vw] max-md:w-[26vw]">
              <Image
                src={kyntraLogo}
                alt="Kyntra"
                className="h-full w-full object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </Link>
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-svh max-w-400 flex-col items-center justify-center px-[5vw] py-[12vh] text-center text-white max-lg:px-[7vw] max-md:py-[16vh]">
        <ParaAnim
          as="p"
          delay={0.3}
          aria-hidden
          className="font-helvetica-neue text-[13vw] font-medium leading-[0.9] tracking-[-0.04em] text-white max-lg:text-[22vw] max-md:text-[32vw]"
        >
          404
        </ParaAnim>

        <ParaAnim
          as="h1"
          delay={0.5}
          className="mt-[0.8vw] text-[3.2vw]! text-white max-lg:mt-[3vw] max-lg:text-[6vw]! max-md:mt-[4vw] max-md:text-[8vw]! max-md:leading-[1.1]!"
        >
          Nothing Needs Fixing Here
        </ParaAnim>

        <FadeUp
          as="p"
          delay={0.6}
          className="mt-[1vw] w-[30vw] text-[1vw] leading-[1.6] tracking-wide text-white/90 [text-shadow:0_1px_10px_rgba(10,22,60,0.55)] max-lg:mt-[3vw] max-lg:w-[65vw] max-lg:text-[2vw] max-lg:leading-[1.8] max-md:mt-[4vw] max-md:w-full max-md:text-[3.8vw]"
        >
          This page has moved out, or the link was never on the schedule. Head
          back home and Kyntra will pick up right where you left off.
        </FadeUp>

        <FadeUp delay={0.75} className="mt-[2vw] max-lg:mt-[5vw] max-md:mt-[8vw] max-md:w-full">
          <CharStaggerPrimaryButton
            text="Back to Home"
            href={HOME}
            hoverColor="#ffffff"
            showArrow
            className="rounded-full bg-black px-[2.2vw] py-[0.9vw] text-white transition-colors hover:bg-kyntra-primary max-lg:px-[6vw] max-lg:py-[2.2vw] max-md:w-full max-md:justify-center max-md:py-[4vw]"
            textClassName="font-aeonik-pro text-[1.1vw] tracking-tight max-lg:text-[2.2vw] max-md:text-[4.2vw]"
            iconClassName="text-white"
          />
        </FadeUp>
      </main>
    </div>
  );
};

export default NotFound;
