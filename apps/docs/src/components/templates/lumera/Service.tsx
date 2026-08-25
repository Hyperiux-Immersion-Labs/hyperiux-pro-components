"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import firePlace from "./assets/fire-place.png";
import lapPool from "./assets/lap-pool.png";
import relaxationLounge from "./assets/relaxation-lounge.png";
import spaAndWellness from "./assets/spa-and-wellness.png";
import wineCellar from "./assets/wine-cellar.png";
import DraggableMarquee from "./VaultComp/draggable-marquee";

const services = [
  {
    title: "RELAXATION LOUNGE",
    img: relaxationLounge,
  },
  {
    title: "65 Foot Lap Pool",
    img: lapPool,
  },
  {
    title: "Spa and Wellness",
    img: spaAndWellness,
  },
  {
    title: "Fire Place",
    img: firePlace,
  },
  {
    title: "Wine Cellar",
    img: wineCellar,
  },
];

export default function Service() {
  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const [servicesThumb, setServicesThumb] = useState({ widthPct: 100, leftPct: 0 });

  const updateServicesThumb = () => {
    const el = servicesScrollRef.current;
    if (!el) return;
    const widthPct = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollRatio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setServicesThumb({ widthPct, leftPct: scrollRatio * (100 - widthPct) });
  };

  useEffect(() => {
    updateServicesThumb();
    window.addEventListener("resize", updateServicesThumb);
    return () => window.removeEventListener("resize", updateServicesThumb);
  }, []);

  return (
    <>
      <section className="w-screen max-md:py-[20%] max-[1025px]:py-[10%] max-[1025px]:overflow-hidden max-md:overflow-hidden" id="services">
        <div className={` flex flex-col py-[10%] gap-[7vw] max-[1025px]:py-0 max-md:gap-[1vw]`}>
          <div className="w-full">
            <DraggableMarquee speed={1} />
          </div>

          <div>
            <div
              ref={servicesScrollRef}
              onScroll={updateServicesThumb}
              className={`w-full h-full px-[5%] no-scrollbar max-[1025px]:overflow-x-auto overflow-hidden max-md:pr-0 max-md:mt-[10%] max-[1025px]:w-[100vw] max-[1025px]:ml-[-5vw] max-md:ml-0 max-md:px-[5vw]`}
            >
              <div className="flex relative gap-[1.5%] overflow-hidden aspect-[2.5] fadeup max-[1025px]:flex max-[1025px]:w-[400vw] max-[1025px]:ml-[5%] max-[1025px]:aspect-auto max-[1025px]:overflow-visible max-[1025px]:mb-[5vw] max-[1025px]:gap-[3vw] max-md:gap-[1.5%]">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="group w-[20%] flex rounded-[24px] overflow-hidden items-start [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)] p-[1vw] no-underline transition-all duration-[350ms] ease-in-out relative hover:w-[50%] focus:w-[50%] max-[1025px]:w-full max-[1025px]:hover:w-full max-[1025px]:focus:w-full max-md:w-full max-md:hover:w-full max-md:focus:w-full max-[1025px]:h-[50vh] max-[1025px]:p-[4vw]"
                  >
                    <Image
                      fill
                      alt={service.title}
                      src={service.img}
                      loading="lazy"
                      quality={90}
                      className="object-cover object-center transition-all duration-350 ease-in-out scale-110 group-hover:scale-100 group-focus:scale-100"
                    />
                    <div className="stripe-label max-w-[15vw] backdrop-blur-sm px-[2vw] py-[1vw] bg-white/10 rounded-lg overflow-hidden w-fit duration-500 ease-in-out transition-all group-hover:max-w-[42vw] group-focus:max-w-[42vw] max-[1025px]:max-w-[90%] max-[1025px]:py-[2vw] max-[1025px]:px-[3vw]">
                      <p className="truncate text-[1.25vw] font-head text-white uppercase whitespace-nowrap max-md:text-[4vw] max-[1025px]:text-[3vw]" title={service.title}>
                        {service.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-[3vw] mx-[5%] hidden h-[0.4vw] overflow-hidden rounded-full bg-[#e5e5e5] max-[1025px]:block max-[1025px]:h-[0.8vw] max-md:mx-[5vw] max-md:mt-[6vw]">
              <div
                className="absolute inset-y-0 rounded-l-full bg-black"
                style={{ width: `${servicesThumb.widthPct}%`, left: `${servicesThumb.leftPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
