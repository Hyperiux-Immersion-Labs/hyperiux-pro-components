// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import type { MouseEventHandler } from "react";
import CharStaggerButton from "./effects/char-stagger-button";
import { Arrow, Mark } from "./Icons";
import { brand } from "../content";

type ButtonProps = {
  href: string;
  children: string;
  variant?: "primary" | "ghost" | "ink" | "outline";
  arrow?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const VARIANTS = {
  primary: "bg-[#aeb8e8] text-[#0b1020] hover:bg-[#e8eaf5]",
  ghost: "border border-white/15 text-[#f5f6fa] hover:border-white/40 hover:bg-white/5",
  ink: "bg-[#151927] text-[#f5f6fa] hover:bg-[#202b4a]",
  outline: "border border-[#e2e4ec] bg-white text-[#151927] hover:border-[#aeb8e8] hover:bg-[#e8eaf5]",
};

export function VeyButton({ href, children, variant = "primary", arrow = true, className = "", onClick }: ButtonProps) {
  return (
    <CharStaggerButton
      href={href}
      text={children}
      onClick={onClick}
      icon={arrow ? Arrow : undefined}
      iconClassName="h-[0.9vw] w-[0.9vw] max-lg:h-[1.8vw] max-lg:w-[1.8vw] max-md:h-[3.7vw] max-md:w-[3.7vw]"
      className={`h-[6vh] justify-center gap-3 rounded-md px-[1.8vw] text-22 font-medium transition-colors duration-300 max-lg:h-[4.4vh] max-lg:px-[3.6vw] max-md:h-[6.4vh] max-md:px-[6vw] ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Mark className="h-[1.1vw] w-[1.1vw] max-lg:h-[2.2vw] max-lg:w-[2.2vw] max-md:h-[4.6vw] max-md:w-[4.6vw]" />
      <span className="text-30 font-medium">{brand.name}</span>
    </span>
  );
}
