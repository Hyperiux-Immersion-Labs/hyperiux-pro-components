// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";

type SectionHeadProps = {
  title: string;
  text?: string;
  children?: ReactNode;
};

const SectionHead = ({ title, text, children }: SectionHeadProps) => (
  <div className="flex items-end justify-between gap-9 max-lg:flex-col max-lg:items-start max-lg:gap-5">
    <MaskReveal as="h2" className="w-[55%] max-lg:w-full">
      {title}
    </MaskReveal>
    {(text || children) && (
      <FadeUp className="flex w-[32%] flex-col items-start gap-6 max-lg:w-[70%] max-md:w-full">
        {text && <p className="text-28 text-mpx-muted">{text}</p>}
        {children}
      </FadeUp>
    )}
  </div>
);

export default SectionHead;
