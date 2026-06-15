"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "@/utils/Icons";

const VARIANT_STYLES = {
  orange: {
    pill: "bg-primary text-white",
    circle: "bg-primary",
    icon: "text-white",
  },
  black: {
    pill: "bg-black text-white",
    circle: "bg-black",
    icon: "text-white",
  },
  white: {
    pill: "bg-white text-black",
    circle: "bg-white",
    icon: "text-black",
  },
};

export default function Button({
  text = "Install CLI",
  href = "/effects",
  variant = "orange",
  className = "",
 
}) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.orange;
  const isDarkText = variant === "white";
  const circleColorClass = isDarkText ? "bg-black" : "bg-white";
  const hoverTextClass = isDarkText ? "group-hover:text-white" : "group-hover:text-black";

  return (
    <Link href={href} className={`group flex overflow-hidden items-center gap-2 sm:gap-[0.5vw] rounded-full sm:px-[1.5vw] sm:py-[.8vw] px-6 py-3 relative text-sm sm:text-[1vw] ${styles.pill} ${className}`}>
      <span className={`sm:size-[.5vw] size-2 group-hover:scale-[50] duration-500 transition-all rounded-full inline-block ${circleColorClass}`} />
      <p className={`relative z-10 ${hoverTextClass} duration-500 transition-all sm:group-hover:-translate-x-[1vw] group-hover:-translate-x-1.5`}>{text}</p>
      <span className={`sm:size-[1.2vw] size-4 absolute sm:right-[1vw] right-4 ${hoverTextClass} opacity-0 group-hover:opacity-100 duration-500 transition-all inline-block`}>
        <ArrowUpRightIcon className='rotate-45' stroke={2.5} />
      </span>
    </Link>
  );
}
