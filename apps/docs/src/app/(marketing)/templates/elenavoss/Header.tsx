"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import ElenaVossLogo from "./assets/elena-voss.svg";
import DotFillBtn from "./effects/dot-fill-button/DotFillButton";
import { useGetInTouchModal } from "./GetInTouchModal";

const SCROLL_BLUR_THRESHOLD_RATIO = 0.4;

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { openModal } = useGetInTouchModal();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * SCROLL_BLUR_THRESHOLD_RATIO);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`w-screen h-fit py-[1.5vw] flex items-center justify-between px-[4vw] fixed inset-0 z-99 opacity-0 transition-[backdrop-filter] duration-500 ease-out max-[1025px]:py-[3vw] max-[1025px]:px-[5vw] max-md:py-4 max-md:px-5 ${
          scrolled ? "backdrop-blur-lg" : "backdrop-blur-none"
        }`}
        id="header"
      >
        <div>
          <Image
            src={ElenaVossLogo}
            width={338}
            height={172}
            alt="Logo"
            loading="lazy"
            className="w-[12vw] max-[1025px]:w-[20vw] max-md:w-[34vw]"
          />
        </div>
        <DotFillBtn
          btnText="Get in Touch"
          href={"#"}
          onClick={(e) => {
            e.preventDefault();
            openModal();
          }}
          textClassName="font-normal text-[1.15vw] max-[1025px]:text-[3vw] max-md:text-[4.2vw]"
          bgColor="#ffffff"
          dotColor="#070707"
          hoverTextColor="#ffffff"
          textColor="#111111"
        />
      </header>
    </>
  );
};

export default Header;
