// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp } from "lucide-react";

import lumeraLogo from "./assets/icons/lumera-logo-black.png";
import facebookIcon from "./assets/icons/socials/facebook.svg";
import xIcon from "./assets/icons/socials/x.svg";
import instagramIcon from "./assets/icons/socials/instagram.svg";
import linkedinIcon from "./assets/icons/socials/linkedin.svg";

const socialLinks = [
  { src: facebookIcon, label: "Facebook" },
  { src: xIcon, label: "Twitter" },
  { src: instagramIcon, label: "Instagram" },
  { src: linkedinIcon, label: "LinkedIn" },
];

const Footer = () => {
  const handleScrollTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="footer" className="z-5 footer-body">
      <div className={`px-[5%] max-md:px-[6%] w-screen h-full rounded-t-xl overflow-hidden bg-[#E0D4C6] text-[#1C1B1A] max-md:py-[10%] max-[1025px]:pt-[5%]`}>
        <div className=" pt-[5%] pb-[2%] flex flex-col">
          {/* First Div */}
          <div className="w-full relative flex items-center justify-between max-[1025px]:flex-col-reverse mb-[7vw] max-md:gap-0">
            <div className="flex   items-center justify-center gap-[1vw] max-md:gap-[3vw] max-md:mb-[5vw]">
              {socialLinks.map(({ src, label }) => (
                <Link href={"#"} key={label} aria-label={label}>
                  <div className="relative h-[2.7vw] w-[2.7vw] p-[0.75vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup max-md:w-[10vw] max-md:h-[10vw] max-md:p-[2.5vw] max-[1025px]:w-[5vw] max-[1025px]:h-[5vw] max-[1025px]:p-[1.3vw]">
                    <Image src={src} alt={label} width={24} height={24} className="h-full w-full object-contain" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Second Div */}
            <div className="absolute left-1/2 top-1/2 flex  -translate-x-1/2 -translate-y-1/2 items-center justify-center fadeup max-[1025px]:static max-[1025px]:w-[40vw] max-md:w-[55vw] max-[1025px]:mb-[6vw] max-md:mb-[10vw] max-[1025px]:translate-x-0 max-md:translate-y-0 ">
              <Link href={"/"} className="w-[11vw] max-[1025px]:w-[16vw] max-md:w-[30vw] h-auto">
                <Image
                  src={lumeraLogo}
                  alt="Lumera"
                  height={1000}
                  width={1000}
                  className="h-full w-full object-cover"
                />
              </Link>
            </div>

            {/* Third Div */}
            <Link aria-label="Scroll Top" href="#" onClick={handleScrollTop} className="group max-[1025px]:hidden">
              <div className="relative h-[3vw] w-[3vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup max-md:absolute max-md:top-[5%] max-md:right-[5%] max-md:w-[9vw] max-md:h-[9.2vw] max-[1025px]:w-[5vw] max-[1025px]:h-[5vw]">
                <ChevronUp
                  className="absolute h-[1.5vw] w-[1.5vw] text-white transition-transform duration-500 ease-in-out group-hover:translate-y-[-180%] max-md:h-[4.5vw] max-md:w-[4.5vw] max-[1025px]:h-[2.4vw] max-[1025px]:w-[2.4vw]"
                  strokeWidth={1.8}
                />
                <ChevronUp
                  className="absolute h-[1.5vw] w-[1.5vw] translate-y-[180%] text-white transition-transform duration-500 ease-in-out group-hover:translate-y-0 max-md:h-[4.5vw] max-md:w-[4.5vw] max-[1025px]:h-[2.4vw] max-[1025px]:w-[2.4vw]"
                  strokeWidth={1.8}
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3  flex-col justify-center">
            <Link href="tel:+12125550186" className={`text-[3.4vw] font-medium font-heading leading-none max-md:text-[5.5vw] max-[1025px]:text-[5vw]`}>
              <span data-para-anim className="">+1 (212) 555-0186</span>
            </Link>
            <Link href="mailto:hello@lumeraheights.com">
              <p data-para-anim className={`text-[3.2vw] font-heading font-medium max-md:text-[5.5vw] max-[1025px]:text-[5vw]`}>
                hello@lumeraheights.com
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between max-[1025px]:flex-col max-md:gap-[5vw] fadeup pt-[7vw] max-[1025px]:gap-[3vw]">
            <div className="max-[1025px]:w-[70%] max-[1025px]:order-1">
              <p className="text-[1vw] uppercase max-md:text-[3.5vw] max-[1025px]:text-center max-[1025px]:text-[2.5vw]">
                © 2026. All Rights Reserved
              </p>
            </div>
            <div className="w-[35%] max-[1025px]:w-[80%] ml-[-5%] max-[1025px]:ml-0">
              <p className="text-[1vw] leading-[1.2] text-center max-md:text-[3.5vw] max-[1025px]:text-center max-[1025px]:text-[2.5vw]">
                Sheikh Mohammed Bin Rashid Blvd Dubai, United Arab Emirates
              </p>
            </div>
            <Link href={"#"} className="max-[1025px]:order-3">
              <div>
                <p className="text-[1vw]   max-md:text-[3.2vw] max-md:text-center max-[1025px]:text-[2.5vw]">
                  Privacy Policy
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
