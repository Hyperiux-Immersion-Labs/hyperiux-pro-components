// Built using Hyperiux Vault: https://vault.hyperiux.com

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
      style={{
        backgroundColor: APPLE_BG,
        borderColor: APPLE_BG,
        ...props.style,
      }}
      className=" ease group flex w-[16vw] shrink-0 cursor-pointer items-center justify-start gap-4 overflow-hidden rounded-full border px-[2vw] py-[0.6vw] text-white transition-all duration-300 hover:scale-[0.95] max-[1025px]:w-[78%] max-[1025px]:min-w-0 max-[1025px]:justify-start max-[1025px]:gap-[3vw] max-[1025px]:px-[6vw] max-[1025px]:py-[1.8vw] max-md:w-[85%] max-md:min-w-0 max-md:gap-[4vw] max-md:px-[7vw] max-md:py-[2.6vw] max-sm:w-[85%] max-sm:min-w-0 max-sm:px-[7vw] max-sm:py-[2.6vw]"
    >
      <div>
        <AppleIcon className="mt-[-0.5vw] h-[2vw] w-[2vw] max-[1025px]:mt-0 max-[1025px]:h-[4vw] max-[1025px]:w-[4vw] max-md:h-[5.6vw] max-md:w-[5.6vw] max-sm:h-[5.6vw] max-sm:w-[5.6vw]" />
      </div>
      <div className="flex flex-col gap-1.5 text-left max-[1025px]:gap-0">
        <span className="text-18 h-[0.8vw] max-[1025px]:h-auto">
          Download on the
        </span>
        <p className="mb-1.5 text-28 leading-none text-nowrap max-[1025px]:mb-0">
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
      style={{ borderColor: PLAY_BORDER, color: PLAY_TEXT, ...props.style }}
      className=" ease group relative z-9999  w-[16vw] shrink-0 cursor-pointer items-center justify-start gap-4 overflow-hidden flex rounded-full border bg-white px-[2vw] py-[0.6vw] transition-all duration-300 hover:scale-[0.95] max-[1025px]:w-[78%] max-[1025px]:min-w-0 max-[1025px]:justify-start max-[1025px]:gap-[3vw] max-[1025px]:px-[6vw] max-[1025px]:py-[1.8vw] max-md:w-[85%] max-md:min-w-0 max-md:gap-[4vw] max-md:px-[7vw] max-md:py-[2.6vw] max-sm:w-[85%] max-sm:min-w-0 max-sm:px-[7vw] max-sm:py-[2.6vw]"
    >
      <div>
        <GooglePlay className="h-[2vw] w-[2vw] max-[1025px]:h-[4vw] max-[1025px]:w-[4vw] max-md:h-[5.6vw] max-md:w-[5.6vw] max-sm:h-[5.6vw] max-sm:w-[5.6vw]" />
      </div>
      <div className="flex flex-col gap-1.5 text-left max-[1025px]:gap-0">
        <span className="text-18 h-[0.8vw] max-[1025px]:h-auto">
          Get it on
        </span>
        <p className="text-28 mb-1.5 leading-none text-nowrap max-[1025px]:mb-0">
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
