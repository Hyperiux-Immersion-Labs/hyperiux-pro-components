// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode, RefObject } from "react";

type SceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  id: string;
  chapter?: number;
  height?: string;
  tone?: "dark" | "light";
  className?: string;
  innerClassName?: string;
  minHeight?: string;
  children: ReactNode;
};

export default function Scene({
  sectionRef,
  id,
  chapter,
  height = "",
  tone = "dark",
  className = "",
  innerClassName = "",
  minHeight = "min-h-svh",
  children,
}: SceneProps) {
  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={`${id}-title`}
      data-vey-tone={tone}
      data-vey-chapter={chapter}
      className={`relative ${height} ${className}`}
    >
      <div className={`relative flex ${minHeight} flex-col overflow-hidden max-md:min-h-0 max-md:overflow-visible ${innerClassName}`}>
        {children}
      </div>
    </section>
  );
}
