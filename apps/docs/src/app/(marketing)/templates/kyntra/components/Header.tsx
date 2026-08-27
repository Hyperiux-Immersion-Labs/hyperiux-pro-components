// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLenis } from "lenis/react";
import CharStaggerButton from "./effects/char-stagger-button";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";
import kyntraLogo from "../assets/kyntra-logo.png";

const navLinks = [
  { label: "For Homes", target: "#" },
  { label: "Product", target: "#" },
  { label: "Kyntra Care", target: "#" },
  { label: "Stories", target: "#" },
  { label: "Resources", target: "#" },
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

  const handleNavScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    target: string,
  ) => {
    event.preventDefault();
    setMenuOpen(false);

    if (lenis) {
      lenis.scrollTo(target, { duration: 2 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-[3vw] py-[1.6vw] transition-all duration-500 ease-in-out max-[1025px]:px-[5%] max-[1025px]:py-[5%] ${
        hidden ? "-translate-y-full max-[1025px]:translate-y-0" : "translate-y-0"
      } ${isScrolled ? "bg-black/20 shadow-md backdrop-blur-md" : ""}`}
    >
      <div className="flex items-center justify-between">
        <Link
          href="/templates/kyntra"
          className="relative z-60 flex items-center"
          aria-label="Kyntra home"
        >
          <div className="h-fit w-[8vw] max-[1025px]:w-[28vw] max-md:w-[34vw]">
            <Image
              src={kyntraLogo}
              alt="Kyntra"
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="flex items-center gap-[2.6vw] max-[1025px]:hidden">
          {navLinks.map((link) => (
            <CharStaggerButton
              key={link.label}
              text={link.label}
              href={link.target}
              onClick={(event) => handleNavScroll(event, link.target)}
              hoverColor="#ffffff"
              className="text-white"
              textClassName="font-aeonik-pro text-[1vw] tracking-tight"
            />
          ))}
        </nav>

        <div className="max-[1025px]:hidden">
          <CharStaggerPrimaryButton
            text="Get Started"
            href="#get-started"
            onClick={(event) => handleNavScroll(event, "#get-started")}
            hoverColor="#000000"
            showArrow
            className="rounded-full bg-white px-[1.8vw] py-[0.7vw] text-black"
            textClassName="font-aeonik-pro text-[1vw] tracking-tight"
            iconClassName="text-black"
          />
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
        className={`fixed inset-0 z-50 hidden h-dvh bg-black px-[5%] pb-[5vw] pt-[28vw] transition-transform duration-500 max-[1025px]:block max-md:pt-[34vw] ${
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
                textClassName="font-helvetica-neue text-[9vw] font-medium leading-none max-md:text-[12vw]"
              />
            ))}
          </div>

          <CharStaggerPrimaryButton
            text="Get Started"
            href="#get-started"
            onClick={(event) => handleNavScroll(event, "#get-started")}
            hoverColor="#000000"
            showArrow
            className="h-[13vw] w-full justify-center rounded-full bg-white px-[6vw] text-black max-md:h-[16vw]"
            textClassName="font-aeonik-pro text-[3.4vw] font-medium max-md:text-[4.6vw]"
            iconClassName="text-black"
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
