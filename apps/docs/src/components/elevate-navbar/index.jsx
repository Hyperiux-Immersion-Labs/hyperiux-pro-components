"use client";

import React, { useEffect, useState } from "react";
import { ElevateNavbarMobile } from "./ElevateMobileNav";
import { ElevateNavbarDesktop } from "./ElevateDesktopNav";

const menuItems = [
  {
    name: "Effects",
    href: "/effects",
    isDropdown: true,
    dropdown: [
      { title: "All Effects", img: "/img/dino2.png", href: "/effects" },
      { title: "Components", img: "/img/dino2.png", href: "/effects/components" },
      { title: "WebGL", img: "/img/dino2.png", href: "/effects/webgl" },
    ],
  },
  {
    name: "Tech",
    href: "/tech",
    isDropdown: true,
    dropdown: [
      { title: "React Effects", img: "/img/dino2.png", href: "/tech/react" },
      { title: "GSAP Effects", img: "/img/dino2.png", href: "/tech/gsap" },
      { title: "Three.js Effects", img: "/img/dino2.png", href: "/tech/threejs" },
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
    href: "/docs",
    isDropdown: true,
    dropdown: [
      { title: "Introduction", img: "/img/dino2.png", href: "/docs" },
      { title: "Installation", img: "/img/dino2.png", href: "/docs/installation" },
      { title: "CLI", img: "/img/dino2.png", href: "/docs/cli" },
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
      <h1 className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-[10vw] font-black uppercase text-[#363737]">
        Elevate Navbar
      </h1>

      {isMobile ? (
        <ElevateNavbarMobile menuItems={menuItems} cta={cta} />
      ) : (
        <ElevateNavbarDesktop menuItems={menuItems} cta={cta} />
      )}
    </div>
  );
}