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
    <section id="footer" className="z-[5] footer-body">
      <div className={`px-[5%] w-screen h-full rounded-t-xl overflow-hidden bg-[#E0D4C6] text-[#1C1B1A] mobile:py-[10%] tablet:pt-[5%]`}>
        <div className=" pt-[5%] pb-[2%] flex flex-col">
          {/* First Div */}
          <div className="w-full relative flex items-center justify-between mobile:flex-col-reverse mb-[7vw] mobile:gap-0">
            <div className="flex   items-center justify-center gap-[1vw] mobile:gap-[3vw] mobile:mb-[5vw]">
              {socialLinks.map(({ src, label }) => (
                <Link href={"#"} key={label} aria-label={label}>
                  <div className="relative h-[2.5vw] w-[2.5vw] p-[0.65vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:w-[10vw] mobile:h-[10vw] mobile:p-[2.5vw] tablet:w-[5vw] tablet:h-[5vw] tablet:p-[1.3vw]">
                    <Image src={src} alt={label} width={24} height={24} className="h-full w-full object-contain" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Second Div */}
            <div className="absolute left-1/2 top-1/2 flex w-[10vw] h-auto -translate-x-1/2 -translate-y-1/2 items-center justify-center fadeup mobile:static mobile:w-[40vw] mobile:mb-[10vw] mobile:translate-x-0 mobile:translate-y-0 tablet:w-[20vw]">
              <Link href={"/"}>
                <Image
                  width={200}
                  height={50}
                  src={lumeraLogo}
                  alt="Lumera"
                  className="h-full w-full object-contain"
                />
              </Link>
            </div>

            {/* Third Div */}
            <Link aria-label="Scroll Top" href="#" onClick={handleScrollTop} className="group">
              <div className="relative h-[3vw] w-[3vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:absolute mobile:top-[5%] mobile:right-[5%] mobile:w-[9vw] mobile:h-[9.2vw] tablet:w-[5vw] tablet:h-[5vw]">
                <ChevronUp
                  className="absolute h-[1.5vw] w-[1.5vw] text-white transition-transform duration-500 ease-in-out group-hover:translate-y-[-180%] mobile:h-[4.5vw] mobile:w-[4.5vw] tablet:h-[2.4vw] tablet:w-[2.4vw]"
                  strokeWidth={1.8}
                />
                <ChevronUp
                  className="absolute h-[1.5vw] w-[1.5vw] translate-y-[180%] text-white transition-transform duration-500 ease-in-out group-hover:translate-y-0 mobile:h-[4.5vw] mobile:w-[4.5vw] tablet:h-[2.4vw] tablet:w-[2.4vw]"
                  strokeWidth={1.8}
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3  flex-col justify-center">
            <Link href="tel:+12125550186" className={`text-[3.4vw] font-medium font-heading leading-none mobile:text-[5.5vw] tablet:text-[5vw]`}>
              <span data-para-anim className="">+1 (212) 555-0186</span>
            </Link>
            <Link href="mailto:hello@lumeraheights.com">
              <p data-para-anim className={`text-[3.2vw] font-heading font-medium mobile:text-[5.5vw] tablet:text-[5vw]`}>
                hello@lumeraheights.com
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between tablet:flex-col mobile:gap-[5vw] fadeup pt-[7vw] tablet:gap-[3vw]">
            <div className="tablet:w-[70%] tablet:order-1">
              <p className="text-[1vw] uppercase mobile:text-[3.5vw] tablet:text-center tablet:text-[2.5vw]">
                © 2026. All Rights Reserved
              </p>
            </div>
            <div className="w-[35%] tablet:w-[80%] ml-[-5%] tablet:ml-0">
              <p className="text-[1.1vw] leading-[1.2] text-center mobile:text-[3.5vw] tablet:text-center tablet:text-[2.5vw]">
                Sheikh Mohammed Bin Rashid Blvd Dubai, United Arab Emirates
              </p>
            </div>
            <Link href={"#"} className="tablet:order-3">
              <div>
                <p className="text-[1vw]   mobile:text-[3.2vw] mobile:text-center tablet:text-[2.5vw]">
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
