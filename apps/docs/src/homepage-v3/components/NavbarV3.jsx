"use client";
import { GithubIcon2, HyperiuxLogo } from "@/utils/Icons";
import React, { useRef, useState, useEffect } from "react";
import ButtonV3 from "./ButtonV3";
import HoverLinkV3 from "./HoverLinkV3";
import { PlusIcon, Search } from "lucide-react";
import { useLenis } from "lenis/react";
import Image from "next/image";

export default function NavbarV3() {
  const navRef = useRef(null);
  const [reveal, setReveal] = useState(true);
  const lastScroll = useRef(0);

  useLenis(({ scroll, velocity }) => {
    if (scroll < 100) {
      setReveal(true);
      return;
    }
    if (velocity > 0.1) {
      setReveal(false);
    } else if (velocity < -0.2) {
      setReveal(true);
    }
  });

  return (
    <nav
      ref={navRef}
      className={`py-[2vw] flex items-center justify-between w-full fixed z-900 top-0 left-0 px-[3vw] transition-transform duration-500 ease-out ${reveal ? "translate-y-0" : "translate-y-[-120%]"}`}
      style={{ willChange: "transform" }}
    >
      <div className="w-[10vw]  h-auto ">
        <HyperiuxLogo className="text-primary size-full " />
      </div>

      <div className="flex bg-[#121212] t20 px-[1.5vw] py-[1.4vw] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-[2.5vw]">
        <HoverLinkV3 href="/" text="Categories" className="group">
          <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
            <div className="group-hover:rotate-180 transition-all duration-300">
              <PlusIcon className="size-full" />
            </div>
          </div>
        </HoverLinkV3>
        <HoverLinkV3 href="/" text="Docs" className="group">
          <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
            <div className="group-hover:rotate-180 size-full transition-all duration-300">
              <PlusIcon className="size-full" />
            </div>
          </div>
        </HoverLinkV3>
        <HoverLinkV3 href="/pricing" text="Pricing" />
        <HoverLinkV3 href="https://github.com/hyperiux" target_blank text="Github">
          <GithubIcon2 className="size-[1.6vw]" />
        </HoverLinkV3>
      </div>

      <div className="flex items-center gap-[1vw]">
        <div className="h-[3.3vw] gap-[.5vw] w-auto px-[1vw] flex items-center justify-center bg-background">
          <Image
            src={"/homepage-v3/svgs/glass.svg"}
            alt="search"
            width={100}
            className=" size-[1.2vw]"
            height={100}
          />
          <span className="size-[1.8vw] relative font-geist-mono">
            <Image src={'/homepage-v3/svgs/ctrlk.svg'} alt='Search' width={16} height={16} className='h-full w-full object-contain' />
          </span>

        </div>
        <ButtonV3 text="Start Free" />
      </div>
    </nav>
  );
}
