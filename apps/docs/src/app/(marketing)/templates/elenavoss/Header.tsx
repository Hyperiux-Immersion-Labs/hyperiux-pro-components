"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ElenaVossLogo from "./assets/elena-voss.svg";
import DotFillBtn from "./effects/dot-fill-button/DotFillButton";
import { useGetInTouchModal } from "./GetInTouchModal";

const SCROLL_BLUR_THRESHOLD_RATIO = 0.4;
const HEADER_HIDE_DURATION = 0.5;

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { openModal } = useGetInTouchModal();
  const headerRef = useRef<HTMLElement | null>(null);
  const lastScrollYRef = useRef(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    // Hero.tsx's own intro reveal also animates this element's yPercent
    // (via gsap.fromTo targeting #header directly) - using gsap here too,
    // rather than a Tailwind translate-y class, keeps both writers on the
    // same inline-style-driven property instead of a class/inline-style
    // specificity fight where the class would silently lose.
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > window.innerHeight * SCROLL_BLUR_THRESHOLD_RATIO);

      const delta = currentY - lastScrollYRef.current;
      if (delta > 0 && currentY > 0 && !hiddenRef.current) {
        hiddenRef.current = true;
        gsap.to(headerRef.current, { yPercent: -100, duration: HEADER_HIDE_DURATION, ease: "power3.out" });
      } else if (delta < 0 && hiddenRef.current) {
        hiddenRef.current = false;
        gsap.to(headerRef.current, { yPercent: 0, duration: HEADER_HIDE_DURATION, ease: "power3.out" });
      }
      lastScrollYRef.current = currentY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`w-screen h-fit py-[1.5vw] flex items-center justify-between px-[4vw] fixed inset-0 z-99 opacity-0 transition-[backdrop-filter] duration-500 ease-out max-[1025px]:py-[3vw] max-[1025px]:px-[5vw] max-md:py-4 ${
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
            className="w-[12vw] max-[1025px]:w-[25vw] max-md:w-[34vw]"
          />
        </div>
        <DotFillBtn
          btnText="Get in Touch"
          href={"#"}
          onClick={(e) => {
            e.preventDefault();
            openModal();
          }}
          className="border border-white/20!"
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
