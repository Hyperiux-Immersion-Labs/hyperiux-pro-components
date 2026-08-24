"use client";

import React from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import PrimaryButton from "./PrimaryButton";
import styles from "./styles.module.css";

const navLinks = [
  { label: "About", target: "#about" },
  { label: "Features", target: "#features-slideshow" },
  { label: "Properties", target: "#project" },
  { label: "Locations", target: "#highlights" },
];

const Header: React.FC = () => {
  const lenis = useLenis();

  // Routed through Lenis (the page is wrapped in <LenisSmoothScroll />) so
  // the scroll stays in sync with Lenis's virtualized scroll position
  // instead of fighting it.
  const handleNavScroll = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();

    if (lenis) {
      lenis.scrollTo(target, { duration: 2 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex justify-between items-center hero-fadeup">
      <Link href="/" className="flex items-center gap-[0.6vw] hero-fadeup tablet:gap-[2vw]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[1.4vw] h-[1.4vw] tablet:w-[5vw] tablet:h-[5vw]"
        >
          <path d="M4 21V9L12 3L20 9V21" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9 21V13H15V21" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9 9H9.01M15 9H15.01" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={`${styles["text-head"]} text-white text-[1.5vw] uppercase tracking-[0.08em] tablet:text-[6vw]`}>
          Lumera
        </span>
      </Link>

      <nav className="flex items-center gap-[2.2vw] max-[1025px]:hidden">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.target}
            onClick={(event) => handleNavScroll(event, link.target)}
            className={`${styles["text-body"]} text-white/90 text-[0.95vw] tracking-wide transition-colors hover:text-white`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="max-[1025px]:hidden">
        <PrimaryButton link="#footer" btnText="Enquire Now" />
      </div>
    </div>
  );
};

export default Header;
