// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";

type SectionHeadProps = {
  title: string;
  text?: string;
  stacked?: boolean;
  children?: ReactNode;
};

const SectionHead = ({ title, text, stacked = false, children }: SectionHeadProps) => (
  <div
    className={`flex max-lg:flex-col max-lg:items-start max-lg:gap-5 ${
      stacked ? "flex-col items-start gap-6" : "items-end justify-between gap-9"
    }`}
  >
    <MaskReveal as="h2" className={stacked ? "w-[35%] max-lg:w-[70%] max-md:w-full" : "w-[55%] max-lg:w-full"}>
      {title}
    </MaskReveal>
    {(text || children) && (
      <FadeUp className="flex w-[32%] flex-col items-start gap-6 max-lg:w-[70%] max-md:w-full">
        {text && <p className="text-28 leading-[1.3] text-mpx-muted">{text}</p>}
        {children}
      </FadeUp>
    )}
  </div>
);

export default SectionHead;
