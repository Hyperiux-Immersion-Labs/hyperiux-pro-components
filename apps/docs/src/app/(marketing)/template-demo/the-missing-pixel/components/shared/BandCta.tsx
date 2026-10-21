// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import { FadeUp } from "../Animations/gsapAnim";

type BandCtaProps = {
  title: string;
  text: string;
  children: ReactNode;
  dark?: boolean;
};

const BandCta = ({ title, text, children, dark = false }: BandCtaProps) => (
  <FadeUp
    className={`flex items-center justify-between gap-9 rounded-3xl px-[4vw] py-[4vw] max-lg:flex-col max-lg:items-start max-lg:gap-8 max-lg:px-[5vw] max-lg:py-[6vw] max-md:px-[6vw] max-md:py-[9vw] ${
      dark ? "bg-[#0a0a0a] text-[#f5f5f5]" : "border border-black/10 bg-white"
    }`}
  >
    <div className="flex w-[60%] flex-col gap-4 max-lg:w-full">
      <h2>{title}</h2>
      <p className={`text-28 ${dark ? "text-white/60" : "text-mpx-muted"}`}>{text}</p>
    </div>
    <div className="max-lg:w-full">{children}</div>
  </FadeUp>
);

export default BandCta;
