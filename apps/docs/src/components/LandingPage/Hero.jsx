import React from "react";

export default function Hero() {
  return (
    <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
      <div className="space-y-[2vw] max-sm:space-y-[8vw] mt-[2vw] max-sm:mt-0  relative z-2">
        <p className="text24 hidden max-sm:block text-light-grey max-sm:text-center">  Hyperiux Vault</p>
        <div className="h-fit flex max-sm:flex-col max-sm:justify-center items-center w-full ">
          <h1 className="text140  max-sm:text-center indent-[12vw] max-sm:indent-[0vw]! relative w-[78vw] max-sm:w-full">
            <span className="text24 max-sm:hidden text-light-grey absolute text-justify left-[-10vw] top-[2.5vw]">
              Hyperiux Vault
            </span>
            Creative interaction
            effects for websites that need to be remembered.
          </h1>
        </div>
        <p className="text22 max-sm:text-center">
          Creative interaction systems built with React, GSAP, Motion, Three.js,
          and WebGL.
        </p>
      </div>
    </section>
  );
}
