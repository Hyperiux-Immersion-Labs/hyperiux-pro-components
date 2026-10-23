// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import { FadeUp, MaskReveal, LineReveal } from "../Animations/gsapAnim";

type SectionHeadProps = {
  title: string;
  text?: string;
  stacked?: boolean;
  titleClassName?: string;
  textClassName?: string;
  children?: ReactNode;
};

const SectionHead = ({
  title,
  text,
  stacked = true,
  titleClassName,
  textClassName = "w-[32%]",
  children,
}: SectionHeadProps) => (
  <div
    className={`flex max-lg:flex-col max-lg:items-start max-lg:gap-5 ${
      stacked ? "flex-col items-start gap-6" : "items-end justify-between gap-9"
    }`}
  >
    <MaskReveal
      as="h2"
      className={
        titleClassName ??
        (stacked
          ? "w-[35%] max-lg:w-[70%] max-md:w-full"
          : "w-[55%] max-lg:w-full")
      }
    >
      {title}
    </MaskReveal>
    {(text || children) && (
      <div
        className={`flex flex-col items-start gap-6 max-lg:w-[70%] max-md:w-full ${textClassName}`}
      >
        {text && (
          <LineReveal className="text-28 leading-[1.3] text-mpx-muted">
            {text}
          </LineReveal>
        )}
        {children && <FadeUp>{children}</FadeUp>}
      </div>
    )}
  </div>
);

export default SectionHead;
