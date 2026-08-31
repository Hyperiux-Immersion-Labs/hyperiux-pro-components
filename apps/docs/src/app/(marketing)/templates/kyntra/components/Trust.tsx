// Built using Hyperiux Vault: https://vault.hyperiux.com
import Image from "next/image";
import NumberCounterThree from "./effects/number-counter/NumberCounterThree";
import ParallaxImageAnimation from "./effects/parallax-image-animation";
import trustOutside from "../assets/trust-outside.png";
import trustInside from "../assets/trust-inside.png";

import FocusTextWrap from "./effects/focus-text/wrap";
const STATS = [
  { value: "4.9/5", label: "Average Rating" },
  { value: "25K+", label: "Services Completed" },
  { value: "2K+", label: "Verified Professionals" },
  { value: "50+", label: "Service Categories" },
];

const Trust = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Full-bleed background image (blurred) */}
      <Image
        src={trustOutside}
        alt=""
        aria-hidden
        priority
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover "
      />

      {/* Inset glass card */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-[10vw] max-md:p-[6vw]">
        <div className="relative h-full max-h-[76vh] w-full max-w-360 overflow-hidden rounded-[1.6vw] border border-white/20 max-md:rounded-[5vw]">
          {/* Card background image - parallax on scroll scrub */}
          <ParallaxImageAnimation
            src={trustInside.src}
            alt="Kyntra verified professionals"
            start="top bottom"
            width={1600}
            height={1000}
            wrapperClassName="pointer-events-none absolute inset-0"
            translateY="10%"
            scrub
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative flex h-full flex-col justify-between p-[3.5vw] max-md:p-[7vw]">
            <FocusTextWrap>
              <h2 className="font-helvetica-neue max-w-[10ch]  leading-[1.05] font-normal tracking-[-0.02em] max-[1025px]:text-[5vw] max-md:text-[10vw]">
                Trusted by Homeowners
              </h2>
            </FocusTextWrap>

            <div className="grid grid-cols-4 gap-[3vw] max-md:grid-cols-2 max-md:gap-x-[6vw] max-md:gap-y-[8vw]">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <div className="flex h-[3.2vw] items-end leading-none **:leading-none max-[1025px]:h-[5vw] max-md:h-[9vw]">
                    <NumberCounterThree
                      value={stat.value}
                      fontWeight={500}
                      textColor="#ffffff"
                      textSize="font-medium text-[3.5vw] max-[1025px]:text-[4.5vw] max-md:text-[8vw]"
                    />
                  </div>
                  <div className="mt-[1.2vw] h-px w-full bg-white/50 max-md:mt-[3vw]" />
                  <span className="mt-[0.9vw] text-22 text-white/85 max-[1025px]:text-[1.6vw] max-md:mt-[2.5vw] max-md:text-[3.2vw]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
