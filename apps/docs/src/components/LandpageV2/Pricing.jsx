"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import gsap from "gsap";
import { CheckIcon } from "../../utils/Icons";
import Button from "../WebsiteComps/Button";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";
import { useUser } from "@clerk/nextjs";
import Scrolltrigger from "gsap/dist/ScrollTrigger";
import ShimmerText from "../WebsiteComps/ShimmerText";
gsap.registerPlugin(Scrolltrigger);

const DIGITS = [...Array(10).keys()];

const PriceDigit = memo(({ digit, visible = true }) => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const target = `-${parseInt(digit, 10) * 10}%`;
    if (!hasMounted.current) {
      gsap.set(containerRef.current, { y: target });
      hasMounted.current = true;
    } else {
      gsap.to(containerRef.current, {
        y: target,
        duration: 0.55,
        ease: "power3.out",
      });
    }
  }, [digit]);

  return (
    <span
      className="overflow-hidden h-[1em] leading-none inline-block relative transition-all duration-300 [--pd-w:0.64em] max-sm:[--pd-w:0.64em]"
      style={{ width: visible ? "var(--pd-w)" : "0", opacity: visible ? 1 : 0 }}
    >
      <span ref={containerRef} className="flex flex-col will-change-transform">
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex h-[1em] items-center justify-center leading-none"
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
});

PriceDigit.displayName = "PriceDigit";

const freeFeatures = [
  "30+ production-ready effects",
  "Copy-paste + CLI install",
  "Commercial-friendly usage",
  "Code you own",
];
const ProFeatures = [
  "All 115 effects",
  "New effects added regularly.",
  "Priority access to upcoming packs",
  "Hyperiux CLI install + auth",
  "Dependency, performance & reduced-motion notes per effect",
  "Code you own, commercial-friendly",
];

export default function Pricing({ padding, content = true }) {
  const [isYearly, setIsYearly] = useState(true);

  const { isLoaded, isSignedIn, user } = useUser();
  const userPlan = isSignedIn ? user?.publicMetadata?.plan || "free" : null;

  useEffect(() => {
    if (globalThis.innerWidth < 542) {
      gsap.to(".pricing", {
        opacity: 1,
        pointerEvents: "auto",
        scrollTrigger: {
          trigger: ".pricing",
          start: "30% top",
          end: "30% top",
          scrub: true,
          //   markers:true
        },
      });
    }
    if (globalThis.innerWidth >= 542 && globalThis.innerWidth < 1025) {
      gsap.to(".pricing", {
        opacity: 1,
        pointerEvents: "auto",
        scrollTrigger: {
          trigger: ".pricing",
          start: "20% top",
          end: "20% top",
          scrub: true,
          // markers: true
        },
      });
    }

    if (globalThis.innerWidth >= 1025) {
      gsap.to(".pricing", {
        opacity: 1,
        pointerEvents: "auto",
        scrollTrigger: {
          trigger: ".pricing",
          start: "5% top",
          end: "5% top",
          scrub: true,
          //   markers:true
        },
      });
    }
    gsap.fromTo(
      ".fadeup-cards",
      {
        y: 20,
        opacity: 0,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: "#pricing-cards",
          start: "top 80%",
          end: "top 80%",
          //   scrub:true,
          //   markers:true
        },
      },
    );
  }, []);

  return (
    <div
      className={`h-[190vw] flex items-end text-background pricing  pb-[20vw]! min-h-screen  bg-foreground self-padd  w-full mt-[-100vh] max-md:mt-[-110vh] max-sm:mt-[-100vh] relative z-2 opacity-0 pointer-events-none max-sm:h-[920vw] max-md:h-[550vw]`}
    >
      <div className=" w-full h-fit overflow-hidden flex flex-col gap-[6vw]  max-sm:gap-[10vw] items-center justify-center ">
        {content && (
          <div className=" text-center space-y-[4vw] max-sm:space-y-[6vw]">
            <RandomBlur
              start="top 50%"
              as="h2"
              className="text110 w-[60vw] max-md:w-full"
            >
              Start Free Today.<br/> Join Founding Access for Pro.
            </RandomBlur>
            <SplitLine
              start="top 60%"
              as="p"
              className="text24 w-[50vw] max-md:w-[70vw] max-sm:w-[85vw] mx-auto"
            >
              Free Core is open today with 30+ source-first effects. Vault Pro
              opens next week through Founding Access, unlocking 80+ premium
              effects across scroll systems, cursor effects, text reveals, page
              transitions, loaders, backgrounds, and WebGL scenes.
            </SplitLine>
          </div>
        )}
        <div
          id="pricing-cards"
          className="h-[55vw] max-md:h-fit max-md:flex-col-reverse max-md:gap-[8vw] relative w-full flex gap-[1.5vw] max-sm:gap-[15vw] fadeup-cards "
        >
          {/* TOGGLE for mobile */}

          <div className="h-fit max-md:flex hidden order-last rounded-md  max-sm:relative max-sm:right-0 max-md:justify-end right-0   items-center text24 text-background max-md:top-10 max-sm:top-10 top-[-2.8vw]  gap-[1vw] max-sm:gap-[4vw] z-0">
            <p
              className={`cursor-pointer font-heading font-medium max-sm:font-medium transition-opacity duration-300`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </p>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="p-[.2vw] max-md:p-[1vw] bg-primary relative flex items-center w-[3.5vw] max-md:w-[14vw] h-[1.8vw] max-md:h-[7vw] rounded-full transition-colors duration-300"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`h-[1.4vw] max-md:h-[5vw] w-[1.4vw] max-md:w-[5vw] rounded-full bg-foreground transition-transform duration-300 absolute ${isYearly ? "translate-x-[1.7vw] max-md:translate-x-[7vw]" : "translate-x-0"}`}
              />
            </button>
            <p
              className={`cursor-pointer font-heading font-medium max-sm:font-medium transition-opacity duration-300 `}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </p>
          </div>

          <div className="h-full max-md:w-full px-[4vw] rounded-md max-md:p-[6vw] flex-col py-[3vw] pb-[5vw]  flex items-start max-md:gap-[10vw] justify-between w-1/2 bg-[#F0F0F0] max-sm:rounded-sm">
            <div className="space-y-[1.5vw] max-md:space-y-[4vw] max-sm:space-y-[6vw]">
              <p className="text80 font-medium! font-heading">Free</p>
              <div className="flex gap-[1vw] max-md:gap-[3vw] items-end">
                <p className="text110 max-sm:text-[13vw]! font-medium! font-heading">$0</p>
                <p className="text24 mb-[1vw] max-md:mb-2">Forever</p>
              </div>
              <p className="text24 mt-[-1vw] max-md:mt-[-1vw] max-sm:mt-[-3.5vw]">
                For trying real effects in real projects.
              </p>
              <div className="flex flex-col gap-[1.5vw] max-md:gap-[4.5vw] pt-[2vw] max-sm:pt-[5vw]">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center w-full">
                    <div className="w-[3vw] max-sm:w-[7vw] max-md:w-[5vw]">
                      <CheckIcon className="w-[1.5vw] h-[1.5vw] rounded-full overflow-hidden max-md:w-[3.5vw] max-md:h-[3.5vw] max-sm:w-[4vw] max-sm:h-[4vw] shrink-0" />
                    </div>
                    <p className="text24 leading-[1.4] max-md:text-[4.2vw] w-[90%]">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-fit max-sm:w-full">
              <Button
                variant="outline"
                href="/effects/free"
                text="Browse Free Effects"
                className=" max-md:w-full max-md:mb-0 max-sm:text-[4vw]"
              />
            </div>
          </div>

          {/* TOGGLE for desktop */}
          <div className="h-fit max-md:hidden flex rounded-md absolute max-md:relative max-md:top-[4vw] max-md:right-0 max-md:justify-start right-0  items-center text24 text-background top-[-2.8vw]  gap-[1vw] max-md:gap-[4vw] z-0">
            <p
              className={`cursor-pointer font-heading font-medium transition-opacity duration-300`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </p>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="p-[.2vw] max-md:p-[1vw] bg-primary relative flex items-center w-[3.5vw] max-md:w-[14vw] h-[1.8vw] max-md:h-[7vw] rounded-full transition-colors duration-300"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`h-[1.4vw] max-md:h-[5vw] w-[1.4vw] max-md:w-[5vw] rounded-full bg-foreground transition-transform duration-300 absolute ${isYearly ? "translate-x-[1.7vw] max-md:translate-x-[7vw]" : "translate-x-0"}`}
              />
            </button>
            <p
              className={`cursor-pointer font-heading font-medium transition-opacity duration-300 `}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </p>
          </div>

          <div className="h-full rounded-md max-md:h-fit max-md:w-full max-md:p-[6vw] relative px-[4vw] max-sm:rounded-sm flex-col py-[3vw] pb-[5vw] flex items-start max-md:gap-[10vw] justify-between w-1/2 bg-background text-foreground">
            <div className="space-y-[1.5vw] max-md:space-y-[6vw]">
              <p className="text80 font-heading">Pro</p>

              <div className="flex gap-[1vw] max-md:gap-[2vw]  items-end">
                <p className="text110 max-sm:text-[13vw]! flex items-center font-medium! font-heading">
                  <span>$</span>
                  <PriceDigit digit="1" visible={isYearly} />
                  <PriceDigit digit={isYearly ? "7" : "2"} />
                  <PriceDigit digit={isYearly ? "9" : "0"} />
                </p>
                <p className="text24 mb-[1vw] max-md:mb-2">
                  {isYearly ? "Yearly" : "Monthly"}
                </p>
                <ShimmerText
                  as="div"
                  shimmerColor="#fab389"
                  baseColor="#ff5f00"
                  className="inline-block w-[20vw] max-md:w-[28vw] max-sm:w-[31vw] max-sm:text-[4vw]!"
                >
                  <p
                    className={`text22 w-full text-nowrap max-sm:text-[4vw]! font-heading font-medium! max-md:mb-2 mb-[.75vw] ml-[1vw]  text-primary transition-opacity duration-300 ${isYearly ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    3 months free
                  </p>
                </ShimmerText>
              </div>
              <p className="text24 mt-[-1vw] max-sm:leading-[1.2] max-md:mt-0">
                For developers, founders, and agencies shipping premium work.
              </p>
              <div className="flex flex-col gap-[1.5vw] max-md:gap-[3.5vw] pt-[2vw] max-sm:pt-[3vw]">
                {ProFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center w-full">
                    <div className="w-[3vw] max-sm:w-[7vw] max-md:w-[5vw]">
                      <CheckIcon className="w-[1.5vw] h-[1.5vw] max-md:mt-0 max-sm:w-[4vw] max-sm:h-[4vw] shrink-0 max-md:h-[3.5vw] max-md:w-[3.5vw]" />
                    </div>
                    <p className="text24 leading-[1.4] max-md:text-[4.2vw] w-[90%]">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-[1vw] max-md:space-y-[4vw] w-fit max-md:w-full">
              <div className="w-fit max-sm:w-full">
                {!isLoaded ? (
                  <Button
                    variant="orange"
                    text="···"
                    className="max-md:w-full max-sm:text-[4vw]"
                    disabled
                  />
                ) : userPlan === "pro" ? (
                  <Button
                    variant="orange"
                    text="Current Plan"
                    className="max-md:w-full max-sm:text-[4vw]"
                    disabled
                  />
                ) : userPlan === "free" ? (
                  <Button
                    variant="orange"
                    text={
                      checkoutLoading ? "Loading..." : "Join Founding Access"
                    }
                    href="/sign-up"
                    className="max-md:w-full max-sm:text-[4vw]"
                  />
                ) : (
                  <Button
                    variant="orange"
                    text="Join Founding Access"
                    href="/waitlist"
                    className="max-md:w-full max-sm:text-[4vw]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <SplitLine
          as="p"
          className="text34 max-md:text-[4vw] max-sm:text-[5vw] max-md:leading-[1.3] relative z-50 text-center w-[65vw] max-md:w-[85vw]"
        >
          Code you install stays in your repo. Free Core effects are available
          now. Pro downloads, Pro updates, and new Pro effect access require
          active Pro access.
        </SplitLine>
      </div>
    </div>
  );
}
