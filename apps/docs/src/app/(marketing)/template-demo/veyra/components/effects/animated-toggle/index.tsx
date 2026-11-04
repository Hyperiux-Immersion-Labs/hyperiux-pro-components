// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

type PlusProps = {
  isActive?: boolean;
  isHovered?: boolean;
  prefersReducedMotion?: boolean;
  duration?: number;
  className?: string;
};

export function Plus({ isActive = false, isHovered = false, prefersReducedMotion = false, duration = 0.32, className = "" }: PlusProps) {
  const rotation = (isActive ? 180 : 0) + (!prefersReducedMotion && isHovered ? 180 : 0);
  const transitionDuration = prefersReducedMotion ? "0s" : `${duration}s`;

  return (
    <span
      aria-hidden
      className={`relative flex items-center justify-center ease-in-out motion-reduce:transition-none ${className}`}
      style={{ transform: `rotate(${rotation}deg)`, transitionProperty: "transform", transitionDuration }}
    >
      <span className="absolute block h-0.5 w-full rounded-md bg-current" />
      <span
        className="absolute block h-0.5 w-full rounded-md bg-current transition-transform ease-in-out motion-reduce:transition-none"
        style={{ transform: isActive ? "rotate(180deg)" : "rotate(90deg)", transitionDuration }}
      />
    </span>
  );
}
