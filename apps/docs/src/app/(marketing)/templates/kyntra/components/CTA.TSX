// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useState } from "react";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";

const CTA = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      id="cta"
      className={`relative flex h-screen w-full flex-col items-center justify-center px-[5%] text-black transition-colors duration-300 ease-in-out ${
        hovered ? "bg-kyntra-primary" : "bg-[#f5f5f5]"
      }`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CharStaggerPrimaryButton
          text="Different Home, Different Chaos"
          href="#"
          hoverColor="#ffffff"
          className="w-[55vw] justify-center rounded-full bg-black py-[5vw] text-center max-[1025px]:w-[75vw] max-[1025px]:py-[9vw] max-md:w-full max-md:py-[14vw]"
          textClassName="font-helvetica-neue text-[2.6vw] leading-[1.1] font-normal tracking-[-0.02em] text-white max-[1025px]:text-[5vw] max-md:text-[7vw]"
        />
      </div>

      <p className="text-24 mt-[2vw] text-black max-[1025px]:text-[2.6vw] max-md:mt-[6vw] max-md:text-[4vw]">
        Download Kyntra and create your first home profile.
      </p>
    </section>
  );
};

export default CTA;
