"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import firePlace from "./assets/fire-place.png";
import lapPool from "./assets/lap-pool.png";
import relaxationLounge from "./assets/relaxation-lounge.png";
import spaAndWellness from "./assets/spa-and-wellness.png";
import wineCellar from "./assets/wine-cellar.png";

interface ServiceButtonProps {
  link: string;
  btnText: string;
  className?: string;
}

const ServiceButton = ({ link, btnText, className }: ServiceButtonProps) => {
  return (
    <Link
      href={link}
      className={`fadeUp inline-flex h-[4.2vw] min-w-[21vw] max-md:w-full items-center justify-center rounded-full border border-[#ca8216] bg-white px-[2.5vw] text-center text-[1.1vw] font-medium text-[#1c1b1a] [text-rendering:geometricPrecision] transition-all duration-300 hover:bg-white hover:text-[#1c1b1a] max-[1025px]:h-[7vw] max-[1025px]:min-w-[33.5vw] max-[1025px]:px-[2.5vw] max-[1025px]:text-[2.2vw] max-[1025px]:font-normal max-md:h-[15vw] max-md:min-w-[65vw] max-md:px-[4.5vw] max-md:text-[4.2vw] max-md:font-normal ${className ?? ""}`}
    >
      <span>{btnText}</span>
    </Link>
  );
};

const serviceButtons = [
  { text: "Download Brochure" },
  { text: "Download Floor Plan" },
  { text: "Download Payment Plan" },
  { text: "Download Architectural Drawings" },
  { text: "View Amenities" },
  { text: "Schedule a Visit" },
  { text: "Contact Sales Team" },
];

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
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const buttonsScrollRef = useRef<HTMLDivElement>(null);
  const buttonsDragState = useRef<{ pointerId: number; startX: number; startScrollLeft: number; moved: boolean } | null>(null);
  const [isDraggingButtons, setIsDraggingButtons] = useState(false);
  const [buttonsThumb, setButtonsThumb] = useState({ widthPct: 100, leftPct: 0 });

  const updateButtonsThumb = () => {
    const el = buttonsScrollRef.current;
    if (!el) return;
    const widthPct = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollRatio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setButtonsThumb({ widthPct, leftPct: scrollRatio * (100 - widthPct) });
  };

  useEffect(() => {
    updateButtonsThumb();
    window.addEventListener("resize", updateButtonsThumb);
    return () => window.removeEventListener("resize", updateButtonsThumb);
  }, []);

  const handleButtonsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = buttonsScrollRef.current;
    if (!el) return;
    buttonsDragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    setIsDraggingButtons(true);
    el.setPointerCapture(event.pointerId);
  };

  const handleButtonsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = buttonsScrollRef.current;
    const drag = buttonsDragState.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    el.scrollLeft = drag.startScrollLeft - delta;
    updateButtonsThumb();
  };

  const endButtonsDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = buttonsScrollRef.current;
    const drag = buttonsDragState.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;
    el.releasePointerCapture(event.pointerId);
    buttonsDragState.current = null;
    setIsDraggingButtons(false);
  };

  const handleButtonsClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (buttonsDragState.current?.moved) {
      event.preventDefault();
    }
  };

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
          <div className="relative hidden max-md:px-[6%] max-md:block max-[1025px]:block">
            <button
              onClick={toggleDropdown}
              className="bg-secondary-color text-black border border-black rounded-full px-6 py-3 text-[2.5vw] max-md:text-[4vw] hover:bg-opacity-90 transition-colors"
            >
              Our Services
              <svg
                className={`w-5 h-5 inline ml-2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-fit bg-white rounded-[3vw] shadow-2xl max-md:px-[6%]! py-[4vw] transition-all duration-300 ease-in max-md:w-[85vw]">
                <ul className="py-2 text-gray-700 space-y-[2vw]">
                  {serviceButtons.map((item, index) => (
                    <li key={index}>
                      <ServiceButton link="#" btnText={item.text} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="max-[1025px]:hidden max-md:hidden">
            <div
              ref={buttonsScrollRef}
              className={`fadeup no-scrollbar flex flex-nowrap gap-[2vw] overflow-x-auto touch-pan-x px-[4vw] select-none pb-[1vw] ${
                isDraggingButtons ? "cursor-grabbing" : "cursor-grab"
              }`}
              onScroll={updateButtonsThumb}
              onPointerDown={handleButtonsPointerDown}
              onPointerMove={handleButtonsPointerMove}
              onPointerUp={endButtonsDrag}
              onPointerCancel={endButtonsDrag}
              onPointerLeave={endButtonsDrag}
              onClickCapture={handleButtonsClickCapture}
              onDragStart={(event) => event.preventDefault()}
            >
              {serviceButtons.map((item, index) => (
                <ServiceButton key={index} link="#" btnText={item.text} className="shrink-0" />
              ))}
            </div>

            <div className="relative mt-[0.8vw] mx-[4vw] w-[80%] h-[0.4vw]  overflow-hidden rounded-full bg-[#e5e5e5]">
              <div
                className="absolute inset-y-0 rounded-l-full bg-black"
                style={{ width: `${buttonsThumb.widthPct}%`, left: `${buttonsThumb.leftPct}%` }}
              />
            </div>
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
