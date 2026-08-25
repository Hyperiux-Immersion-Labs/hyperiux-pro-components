// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PrimaryButton from "./PrimaryButton";
import CharStaggerButton from "./VaultComp/char-stagger-button";
import Image from "next/image";
import lumeraLogo from "./assets/icons/lumera-logo.png";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP);

const navLinks = [
  { label: "About", target: "#about" },
  { label: "Features", target: "#features-slideshow" },
  { label: "Properties", target: "#project" },
  { label: "Locations", target: "#highlights" },
];

const Header: React.FC = () => {
  const lenis = useLenis();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setIsScrolled(currentY > 150);

      if (currentY > lastYRef.current && currentY > 100) {
        setHidden(true);
      } else if (currentY < lastYRef.current) {
        setHidden(false);
      }
      lastYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set("[data-header-fade]", { opacity: 1 });
      return;
    }

    gsap.to("[data-header-fade]", {
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      delay: 1,
      ease: "power2.out",
    });
  }, []);

  const handleNavScroll = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    setMenuOpen(false);

    if (lenis) {
      lenis.scrollTo(target, { duration: 2 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-[5%] py-[2%] transform transition-all duration-300 tablet:px-[5%] tablet:py-[7%] ${hidden ? "-translate-y-full max-[1025px]:translate-y-0" : "translate-y-0"} ${isScrolled ? "bg-black/10 backdrop-blur-md shadow-md" : ""} `} >
      <div className="flex items-center justify-between">
        <Link href="/" data-header-fade className="relative z-60 flex items-center gap-[0.6vw] tablet:gap-[2vw] opacity-0">
          <div className="h-fit w-40">
            <Image src={lumeraLogo} alt="Lumera" className="h-full w-full object-contain" />
          </div>
        </Link>

        <nav className="flex items-center gap-[3vw] max-[1025px]:hidden">
          {navLinks.map((link) => (
            <CharStaggerButton
              key={link.label}
              text={link.label}
              href={link.target}
              onClick={(event) => handleNavScroll(event, link.target)}
              data-header-fade
              hoverColor="#ffffff"
              className="text-white/90 opacity-0"
              textClassName="font-body text-[1.2vw] tracking-wide"
            />
          ))}
        </nav>

        <div className="max-[1025px]:hidden ">
          <PrimaryButton data-header-fade link="#footer" btnText="Enquire Now" className="min-w-0! w-50 opacity-0" />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="relative z-60 hidden h-[6vw] w-[7vw] shrink-0 items-center justify-center max-[1025px]:flex max-md:h-[8vw] max-md:w-[9vw]"
        >
          <span className="relative block h-[3vw] w-[5.5vw] max-md:h-[4vw] max-md:w-[7vw]">
            <span
              className={`absolute left-0 top-[22%] h-px w-full bg-white transition-transform duration-300 ${
                menuOpen ? "translate-y-[1.1vw] rotate-45 max-md:translate-y-[1vw]" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[68%] h-px w-full bg-white transition-transform duration-300 ${
                menuOpen ? "translate-y-[-1.1vw] -rotate-45 max-md:translate-y-[-1vw]" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 hidden h-dvh bg-[#1c1b1a] px-[5%] pb-[10vw] pt-[28vw] transition-transform duration-500 max-[1025px]:block max-md:pt-[34vw] ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-[5vw] max-md:gap-[7vw]">
            {navLinks.map((link) => (
              <CharStaggerButton
                key={link.label}
                text={link.label}
                href={link.target}
                onClick={(event) => handleNavScroll(event, link.target)}
                hoverColor="rgba(255,255,255,0.7)"
                className="text-white"
                textClassName="font-heading text-[9vw] font-medium leading-none max-md:text-[12vw]"
              />
            ))}
          </div>

          <CharStaggerButton
            text="Enquire Now"
            href="#footer"
            onClick={(event) => handleNavScroll(event, "#footer")}
            hoverColor="#1c1b1a"
            className="h-[11vw] w-full justify-center rounded-full border border-[#ca8216] bg-white px-[6vw] text-[#1c1b1a] max-md:h-[15vw]"
            textClassName="font-body text-[3vw] font-medium max-md:text-[4.2vw]"
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
