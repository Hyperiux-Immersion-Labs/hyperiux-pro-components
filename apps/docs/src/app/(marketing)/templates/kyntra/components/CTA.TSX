// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useState } from "react";
import Link from "next/link";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";
import { FadeUp } from "./Animations/gsapAnim";

const CTA = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      id="cta"
      className={`relative flex h-screen max-[1025px]:h-[70vh] w-full flex-col items-center justify-center px-[5%] text-black transition-colors duration-300 ease-in-out ${
        hovered ? "bg-kyntra-primary" : "bg-[#f5f5f5]"
      }`}
    >
      <div
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovered(false);
        }}
        // Touch gets no hover model: tapping toggles the panel instead of
        // latching it on, since the link itself does not navigate.
        onClick={(e) => {
          const { pointerType } = e.nativeEvent as PointerEvent;
          if (pointerType === "touch" || pointerType === "pen") {
            setHovered((prev) => !prev);
          }
        }}
      >
        <FadeUp>
         
          {/* The char-stagger renders every character as its own inline-block,
              which fights a two-line wrap - so it stays desktop-only and mobile
              gets a plain button with ordinary text flow. */}
          <CharStaggerPrimaryButton
            text="Different Home, Different Chaos"
            href="#"
            hoverColor="#ffffff"
            staggerStep={0.006}
            className="w-[45vw] justify-center rounded-full bg-black py-[2.5vw] text-center max-[1025px]:hidden"
            textClassName=" text-44 leading-[1.1] font-normal tracking-[-0.02em] text-white"
          />

          <Link
            href="#"
            className="hidden w-[80vw] rounded-full bg-black px-[6vw] py-[7vw] text-center text-[5vw] leading-tight font-normal tracking-[-0.02em] text-white max-[1025px]:block max-md:w-[85vw] max-md:py-[4vw] max-md:text-[7vw]"
          >
            Different Home, Different Chaos
          </Link>
        </FadeUp>
      </div>

      <FadeUp
        as="p"
        delay={0.15}
        // Colour is driven by the same `hovered` state as the section
        // background, so the copy flips to white as the panel turns blue.
        className={`text-24 mt-[2vw] transition-colors duration-300 ease-in-out max-[1025px]:mt-[5vw] max-[1025px]:max-w-[62%] max-[1025px]:text-center max-[1025px]:text-[2.9vw] max-md:mt-[6vw] max-md:max-w-[72%] max-md:text-[4.2vw] ${
          hovered ? "text-white" : "text-black"
        }`}
      >
        Download Kyntra and create your first home profile.
      </FadeUp>
    </section>
  );
};

export default CTA;
