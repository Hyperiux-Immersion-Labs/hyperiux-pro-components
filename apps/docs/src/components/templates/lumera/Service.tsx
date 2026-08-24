"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ServiceButtonProps {
  link: string;
  btnText: string;
  className?: string;
}

const ServiceButton = ({ link, btnText, className }: ServiceButtonProps) => {
  return (
    <Link
      href={link}
      className={`fadeUp inline-flex h-[4.2vw] min-w-[21vw] items-center justify-center rounded-full border border-[#ca8216] bg-white px-[2.5vw] text-center text-[1.1vw] font-medium text-[#1c1b1a] [text-rendering:geometricPrecision] transition-all duration-300 hover:bg-white hover:text-[#1c1b1a] max-[1025px]:h-[7vw] max-[1025px]:min-w-[33.5vw] max-[1025px]:px-[2.5vw] max-[1025px]:text-[2.2vw] max-[1025px]:font-normal max-md:h-[15vw] max-md:min-w-[65vw] max-md:px-[4.5vw] max-md:text-[4.2vw] max-md:font-normal ${className ?? ""}`}
    >
      <span>{btnText}</span>
    </Link>
  );
};

const serviceButtons = [
  { text: "Architecture" },
  { text: "Interior Design" },
  { text: "Landscape" },
  { text: "Consulting" },
];

const services = [
  {
    title: "Residential",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Commercial",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Hospitality",
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Renovation",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Wellness",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop",
  },
];

export default function Service() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <section className="w-screen mobile:py-[20%] tablet:py-[10%] tablet:overflow-hidden mobile:overflow-hidden" id="services">
        <div className={`px-[5%] flex flex-col py-[10%] gap-[7vw] tablet:py-0 mobile:gap-[1vw]`}>
          <div className="relative hidden mobile:block tablet:block">
            <button
              onClick={toggleDropdown}
              className="bg-secondary-color text-black border border-black rounded-full px-6 py-3 text-[2.5vw] mobile:text-[4vw] hover:bg-opacity-90 transition-colors"
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
              <div className="absolute z-10 mt-2 w-fit bg-white rounded-[3vw] shadow-2xl px-[4vw] py-[4vw] transition-all duration-300 ease-in mobile:w-fit">
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

          <div className="flex gap-[0.5vw] fadeup flex-wrap tablet:hidden mobile:hidden">
            {serviceButtons.map((item, index) => (
              <ServiceButton key={index} link="#" btnText={item.text} />
            ))}
          </div>

          <div
            className={`w-full h-full tablet:overflow-x-auto overflow-hidden mobile:mt-[10%] tablet:w-[100vw] tablet:ml-[-5vw] [&::-webkit-scrollbar]:h-[1.5vw] [&::-webkit-scrollbar]:rounded-[10px] [&::-webkit-scrollbar-track]:bg-[#eeeeee] [&::-webkit-scrollbar-track]:m-[5vw] [&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-black max-[1025px]:[&::-webkit-scrollbar]:h-[0.8vw]`}
          >
            <div className="flex relative gap-[1.5%] overflow-hidden aspect-[2.5] fadeup tablet:flex tablet:w-[400vw] tablet:ml-[5%] tablet:aspect-auto tablet:overflow-visible tablet:mb-[5vw] tablet:gap-[3vw] mobile:gap-[1.5%]">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group w-[20%] flex rounded-[24px] overflow-hidden items-start [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)] p-[1vw] no-underline transition-all duration-[350ms] ease-in-out relative hover:w-[50%] focus:w-[50%] max-[1025px]:w-full max-[1025px]:hover:w-full max-[1025px]:focus:w-full max-md:w-full max-md:hover:w-full max-md:focus:w-full tablet:h-[50vh] tablet:p-[4vw]"
                >
                  <Image
                    fill
                    alt={service.title}
                    src={service.img}
                    loading="lazy"
                    quality={90}
                    className="object-cover object-center transition-all duration-350 ease-in-out scale-110 group-hover:scale-100 group-focus:scale-100"
                  />
                  <div className="stripe-label backdrop-blur-sm px-[2vw] py-[1vw] bg-white/10 rounded-lg overflow-hidden w-fit duration-500 ease-in-out transition-all tablet:py-[2vw] tablet:px-[3vw]">
                    <p className="text-[1.25vw] font-head text-white uppercase whitespace-nowrap mobile:text-[4vw] tablet:text-[3vw]">
                      {service.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
