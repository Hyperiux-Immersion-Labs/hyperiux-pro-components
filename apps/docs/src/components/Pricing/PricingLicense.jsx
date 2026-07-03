"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";
import Link from "next/link";

const cards = [
  {
    title: "Commercial use",
    body: "Free effects are commercial-friendly where marked in the license. Pro is built for production use on client sites, SaaS products, and internal tools alike.",
  },
  {
    title: "Ownership",
    body: "Every effect you install is source-first - the files land in your repository. You inspect, adapt, and maintain them like the rest of your front end, with no runtime dependency on Hyperiux.",
  },
  {
    title: "Team & agency use",
    body: "Pro is licensed per seat by default. Agencies and teams working across multiple client projects should use agency licensing rather than sharing one login.",
  },
  {
    title: "Cancellation",
    body: "Cancel anytime. Access continues until the end of your current billing period, then reverts to the free tier - code you've already shipped keeps working.",
  },
];

export default function PricingLicense() {
  const underlineRef = useRef(null);
  const isAnimating = useRef(false);

  const handleLinkEnter = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const el = underlineRef.current;
    if (!el) return;
    gsap.timeline({ onComplete: () => { isAnimating.current = false; } })
      .to(el, { scaleX: 0, transformOrigin: "right center", duration: 0.3, ease: "power2.in" })
      .to(el, { scaleX: 1, transformOrigin: "left center", duration: 0.3, ease: "power2.out" });
  };

  return (
    <section className="w-full bg-[#0e0e0e] text-white px-[5vw] py-[8vw] max-md:px-[6vw] max-md:py-[16vw]">

      {/* Heading */}
      <RandomBlur
        as="h2"
        className="text110 text-center w-[70vw] max-md:w-full mx-auto"
      >
        What you can do with Vault, in plain language.
      </RandomBlur>

      {/* Subtext */}
      <SplitLine
        as="p"
        delay={0.15}
        className="text24 text-white/50 text-center mt-[1.5vw] mb-[5vw] w-[48vw] max-md:w-[88vw] max-md:mt-4 max-md:mb-[10vw] mx-auto leading-relaxed"
      >
        A summary of the terms that matter most before you buy - see the full license for the complete legal text.
      </SplitLine>

      {/* Cards grid */}
      <div className="mx-auto w-full max-w-[82vw] max-md:max-w-full grid grid-cols-2 gap-[1.5vw] max-md:grid-cols-1 max-md:gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-[1vw] max-md:rounded-[4vw] border border-white/8 bg-white/[0.03] p-[2.2vw] max-md:p-6 flex flex-col gap-[1.2vw] max-md:gap-4 fadeup"
          >
            <h3 className="text-[2vw] max-sm:text-[7vw] max-md:text-[4.5vw] font-medium text-white/90">{card.title}</h3>
            <p className="text24 max-md:text-sm text-white/50 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="text24 max-md:text-sm text-white/40 text-center mt-[4vw] max-md:mt-[10vw]">
        Need the complete legal text?{" "}
        <Link
          href="/license"
          className="relative text-white inline-block"
          onMouseEnter={handleLinkEnter}
        >
          Read the full license
          <div ref={underlineRef} className="absolute left-0 -bottom-0.5 w-full h-px bg-white" />
        </Link>
      </div>
    </section>
  );
}
