// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import Icon from "./Icon";

type Props = { href: string; children: ReactNode; variant?: "solid" | "line"; block?: boolean; className?: string };

const VARIANTS = {
  solid: "bg-[var(--orn-mint)] text-[var(--orn-forest)] hover:bg-[var(--orn-mint-highlight)]",
  line: "border border-current/25 hover:border-current/70",
};

export default function Button({ href, children, variant = "solid", block = false, className = "" }: Props) {
  return (
    <a
      href={href}
      className={`group inline-flex h-[5vh] items-center justify-center gap-3 px-[1.6vw] text-14 font-medium transition-colors duration-200 max-lg:h-[3.8vh] max-lg:px-[3vw] max-md:h-[5.6vh] max-md:px-[5vw] ${block ? "w-full" : ""} ${VARIANTS[variant]} ${className}`.trim()}
    >
      <span>{children}</span>
      <Icon name="arrow" className="h-[1.6vh] aspect-square transition-transform duration-200 group-hover:[transform:translate(0.2vw,-0.2vw)] max-lg:h-[1.2vh] max-md:h-[1.8vh]" />
    </a>
  );
}
