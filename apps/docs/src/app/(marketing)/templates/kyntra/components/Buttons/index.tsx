"use client";

import { type ComponentPropsWithoutRef, type MouseEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { AppleIcon, ArrowRight, GooglePlay } from "./icons";

gsap.registerPlugin(ScrollToPlugin);

type StoreButtonProps = {
  href?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

const APPLE_BG = "#2F55D4";
const PLAY_BORDER = "#E3E3E3";
const PLAY_TEXT = "#1A1A1A";

export const AppleStoreButton = ({ href = "#", ...props }: StoreButtonProps) => {
  return (
    <Link
      href={href}
      aria-label="Download from Apple Store"
      {...props}
      style={{ backgroundColor: APPLE_BG, borderColor: APPLE_BG }}
      className=" ease group flex w-[16vw] cursor-pointer items-center justify-start gap-4 overflow-hidden rounded-full border px-[2vw] py-[0.6vw] text-white transition-all duration-300 hover:scale-[0.95] max-md:min-w-[30vw] max-md:px-[4vw] max-md:py-[1.5vw] max-sm:w-fit max-sm:min-w-[65vw] max-sm:px-[10vw] max-sm:py-[3vw]"
    >
      <div>
        <AppleIcon className="mt-[-0.5vw] h-[2vw] w-[2vw] max-md:h-[4.5vw] max-md:w-[4.5vw] max-sm:h-[8vw] max-sm:w-[8vw]" />
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <span className="h-[0.8vw] text-[0.8vw]  max-md:h-[2.5vw] max-md:text-[2vw] max-sm:h-auto max-sm:text-[3vw]">
          Download on the
        </span>
        <p className="mb-1.5 text-28 leading-none  max-md:text-[3.2vw] max-sm:text-[6vw]">
          App Store
        </p>
      </div>
    </Link>
  );
};

export const PlayStoreButton = ({ href = "#", ...props }: StoreButtonProps) => {
  return (
    <Link
      href={href}
      aria-label="Download from Play Store"
      {...props}
      style={{ borderColor: PLAY_BORDER, color: PLAY_TEXT }}
      className=" ease group relative z-9999  w-[16vw] cursor-pointer items-center justify-start gap-4 overflow-hidden flex rounded-full border bg-white px-[2vw] py-[0.6vw] transition-all duration-300 hover:scale-[0.95] max-md:w-fit max-md:min-w-[30vw] max-md:px-[4vw] max-md:py-[1.5vw] max-sm:w-fit max-sm:min-w-[65vw] max-sm:px-[10vw] max-sm:py-[3vw]"
    >
      <div>
        <GooglePlay className="h-[2vw] w-[2vw] max-md:h-[4.5vw] max-md:w-[4.5vw] max-sm:h-[8vw] max-sm:w-[8vw]" />
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <span className="h-[0.8vw] text-[0.8vw]  max-md:h-[2.5vw] max-md:text-[2vw] max-sm:h-auto max-sm:text-[3vw]">
          Get it on
        </span>
        <p className=" text-28 mb-1.5 leading-none  text-nowrap max-md:text-[3.2vw] max-sm:text-[6vw]">
          Google Play
        </p>
      </div>
    </Link>
  );
};

type LinkButtonProps = {
  text: string;
  href: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

export const LinkButton = ({
  text,
  href,
  className = "",
  ...props
}: LinkButtonProps) => {
  const parentOnClick = props.onClick;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    parentOnClick?.(event);

    if (typeof href === "string" && href.startsWith("#") && href.length > 1) {
      event.preventDefault();
      gsap.to(window, {
        duration: 1,
        ease: "power2.out",
        scrollTo: { y: href, offsetY: 80 },
      });
    }
  };

  return (
    <Link
      {...props}
      href={href}
      onClick={handleClick}
      className={`group hover:text-primary block w-fit duration-300 ${className}`}
    >
      <div className="flex items-center justify-start gap-2 max-sm:gap-1">
        <span className="link-line">{text}</span>
        <span className="inline-block h-[1px] w-[1px] overflow-hidden">
          About {href}
        </span>
        <ArrowRight className="h-[1vw] w-[1vw] transition-transform duration-300 group-hover:-rotate-45 max-md:h-[2.5vw] max-md:w-[2.5vw] max-sm:h-[4vw] max-sm:w-[4vw]" />
      </div>
    </Link>
  );
};
