"use client";

import React, { useEffect, useState } from "react";
import { ElevateNavbarMobile } from "./ElevateMobileNav";
import { ElevateNavbarDesktop } from "./ElevateDesktopNav";

const menuItems = [
  {
    name: "Effects",
    href: "#",
    isDropdown: true,
    dropdown: [
      { title: "All Effects", img: "/img/dino2.png", href: "#" },
      { title: "Components", img: "/img/dino2.png", href: "#" },
      { title: "WebGL", img: "/img/dino2.png", href: "#" },
    ],
  },
  {
    name: "Tech",
    href: "/tech",
    isDropdown: true,
    dropdown: [
      { title: "React Effects", img: "/img/dino2.png", href: "#" },
      { title: "GSAP Effects", img: "/img/dino2.png", href: "#" },
      { title: "Three.js Effects", img: "/img/dino2.png", href: "#" },
    ],
  },
  {
    name: "Extras",
    href: "#",
    isDropdown: false,
    dropdown: null,
  },
  {
    name: "Docs",
    href: "#",
    isDropdown: true,
    dropdown: [
      { title: "Introduction", img: "/img/dino2.png", href: "#" },
      { title: "Installation", img: "/img/dino2.png", href: "#" },
      { title: "CLI", img: "/img/dino2.png", href: "#" },
    ],
  },
];

const cta = {
  label: "BUILT W/ HYPERIUX",
  href: "#",
};

export default function ElevateNavbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 541);
    };

    checkWidth();
    setHasMounted(true);

    window.addEventListener("resize", checkWidth);

    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="relative h-screen w-full bg-purple-300 font-mono text-[0.75vw]">
      <div className="absolute left-1/2 top-[30%] w-full -translate-x-1/2 -translate-y-1/2 text-center  text-[#363737]">
      <h1 className="text-[8vw] font-black uppercase">
        Elevate Navbar
      </h1>
      <p className="mt-4 text-[1.2vw] max-sm:text-[3vw]">
        Hover over the navbar to see the effect. Resize the window to see the responsive design in action.
      </p>

      </div>
      

      {isMobile ? (
        <ElevateNavbarMobile menuItems={menuItems} cta={cta} />
      ) : (
        <ElevateNavbarDesktop menuItems={menuItems} cta={cta} />
      )}
    </div>
  );
}