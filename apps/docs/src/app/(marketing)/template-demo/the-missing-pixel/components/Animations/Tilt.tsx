// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import { useTilt } from "./useTilt";

const Tilt = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useTilt(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Tilt;
