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
  target_blank = false,
}) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.orange;
  const isDarkText = variant === "white";
  const circleColorClass = isDarkText ? "bg-black" : "bg-white";
  const hoverTextClass = isDarkText ? "group-hover:text-white" : "group-hover:text-black";

  return (
    <Link
      href={href}
      target={target_blank ? "_blank" : undefined}
      rel={target_blank ? "noopener noreferrer" : undefined}
      className={`group flex overflow-hidden items-center gap-[0.5vw] max-md:gap-2 max-sm:gap-2 rounded-full px-[1.5vw] py-[.8vw] max-md:px-6 max-md:py-3 max-sm:px-6 max-sm:py-3 relative text-[1vw] max-md:text-lg max-sm:text-sm ${styles.pill} ${className}`}
    >
      <span className={`size-[.5vw] max-md:size-2 max-sm:size-2 group-hover:scale-[50] duration-500 transition-all rounded-full inline-block ${circleColorClass}`} />
      <p className={`relative z-10 ${hoverTextClass} duration-500 transition-all group-hover:-translate-x-[1vw] max-md:group-hover:-translate-x-1.5 max-sm:group-hover:-translate-x-1.5`}>{text}</p>
      <span className={`size-[1.2vw] max-md:size-4 max-sm:size-4 absolute right-[1vw] max-md:right-4 max-sm:right-4 ${hoverTextClass} opacity-0 group-hover:opacity-100 duration-500 transition-all inline-block`}>
        <ArrowUpRightIcon className='rotate-45' stroke={2.5} />
      </span>
    </Link>
  );
}
