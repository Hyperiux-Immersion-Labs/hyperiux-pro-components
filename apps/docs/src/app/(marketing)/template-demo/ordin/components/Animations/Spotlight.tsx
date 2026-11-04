// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type PointerEvent, type ReactNode } from "react";

type SpotlightProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  tone?: "dark" | "light";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Spotlight<T extends ElementType = "div">({
  as,
  children,
  className = "",
  tone = "dark",
  ...props
}: SpotlightProps<T>) {
  const Tag = (as ?? "div") as any;
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ord-mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ord-my", `${e.clientY - r.top}px`);
  };

  const glow =
    tone === "dark"
      ? "bg-[radial-gradient(22vw_circle_at_var(--ord-mx)_var(--ord-my),rgba(115,190,161,0.16),transparent_65%)]"
      : "bg-[radial-gradient(22vw_circle_at_var(--ord-mx)_var(--ord-my),rgba(115,190,161,0.1),transparent_65%)]";

  return (
    <Tag ref={ref} onPointerMove={onMove} className={`group/spot ${className}`} {...props}>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 ${glow}`}
      />
      {children}
    </Tag>
  );
}
