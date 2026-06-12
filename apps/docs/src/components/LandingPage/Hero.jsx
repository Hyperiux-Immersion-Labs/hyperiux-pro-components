import React from "react";

export default function Hero() {
  return (
      <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
        <div className="space-y-[2vw] mt-[2vw]  relative z-2">
          <div className="h-fit flex  items-center w-full ">
            <h1 className="text110 relative translate-x-[-2vw]  text-right font-laygrotesk w-[65vw]">
              <span className="text22 text-light-grey absolute left-[5vw] top-[2.5vw]">
                Hyperiux Vault
              </span>
              Creative interaction effects for websites that need to be
              remembered.
            </h1>
          </div>
          <p className="text22">
            Creative interaction systems built with React, GSAP, Motion, Three.js,
            and WebGL.
          </p>
        </div>
      </section>

  );
}
