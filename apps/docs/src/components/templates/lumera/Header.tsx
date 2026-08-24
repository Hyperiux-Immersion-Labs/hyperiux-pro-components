"use client";

import React from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import PrimaryButton from "./PrimaryButton";
import Image from "next/image";
import lumeraLogo from "./assets/icons/lumera-logo.png";

const navLinks = [
  { label: "About", target: "#about" },
  { label: "Features", target: "#features-slideshow" },
  { label: "Properties", target: "#project" },
  { label: "Locations", target: "#highlights" },
];

const Header: React.FC = () => {
  const lenis = useLenis();


  const handleNavScroll = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();

    if (lenis) {
      lenis.scrollTo(target, { duration: 2 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className=" flex items-center justify-between">
      <Link href="/" className="flex items-center gap-[0.6vw]  tablet:gap-[2vw]">
      <div className="h-fit w-40">
        <Image src={lumeraLogo} alt="Lumera" className="h-full w-full object-contain" />
      </div>
      </Link>

      <nav className="flex items-center gap-[3vw] max-[1025px]:hidden">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.target}
            onClick={(event) => handleNavScroll(event, link.target)}
            className={`font-body text-white/90 cursor-pointer text-[1.2vw] tracking-wide transition-colors hover:text-white`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="max-[1025px]:hidden ">
        <PrimaryButton link="#footer" btnText="Enquire Now" className="min-w-0! w-50" />
      </div>
    </div>
  );
};

export default Header;
