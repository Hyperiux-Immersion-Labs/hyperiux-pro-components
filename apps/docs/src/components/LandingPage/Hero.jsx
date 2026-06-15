import React from "react";
import RandomBlur from "../Reusable/RandomBlur";
import SplitLine from "../Reusable/SplitLine";

export default function Hero() {
  return (
    <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
      <div className="space-y-[2vw] max-sm:space-y-[8vw] mt-[2vw] max-sm:mt-0  relative z-2">
        <p className="text24 hidden max-sm:block text-light-grey max-sm:text-center">  Hyperiux Vault</p>
        <div className="h-fit flex max-sm:flex-col max-sm:justify-center items-center w-full ">
          <h1 className="text140  max-sm:text-center max-sm:indent-[0vw]! relative w-[78vw] max-sm:w-full">
            <span className="text24 max-sm:hidden text-light-grey absolute text-justify left-[1vw] top-[3vw]">
              Hyperiux Vault
            </span>
            <RandomBlur as="span">
              <span className="opacity-0">dum</span>  Creative interaction effects for websites that need to be remembered.
            </RandomBlur>
          </h1>
        </div>
        <SplitLine delay={.4} className="text22 max-sm:text-center" as='p'>

            Creative interaction systems built with React, GSAP, Motion, Three.js,
            and WebGL.
        </SplitLine>
      </div>
    </section>
  );
}
