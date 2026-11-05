// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { THEME } from "../../theme";

const EVENTS = [
  ["Allow", "read ledger.q3"],
  ["Deny", "wire USD 48,000"],
  ["Hold", "email 14 vendors"],
  ["Allow", "query contracts"],
  ["Deny", "drop table vendors"],
  ["Allow", "commit run 8821"],
];

const TONE: Record<string, string> = { Allow: "text-ord-primary-light", Deny: "text-ord-bone line-through", Hold: "text-ord-primary" };

// Policy rings that turn slowly while a live decision log scrolls beneath them
const PolicyShield = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-ps-ring]", { rotate: (i) => (i % 2 ? -360 : 360), duration: (i) => 40 + i * 14, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
      gsap.to("[data-ps-core]", { scale: 1.08, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" });
      gsap.to("[data-ps-log]", { yPercent: -50, duration: 14, repeat: -1, ease: "none" });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col items-center gap-8">
      <svg viewBox="0 0 200 200" aria-hidden className="h-[46vh] aspect-square overflow-visible max-lg:h-[34vh]">
        <g data-ps-ring>
          <circle cx="100" cy="100" r="92" fill="none" stroke={THEME.primary} strokeOpacity="0.5" strokeWidth="0.5" />
          {[0, 90, 180, 270].map((d) => (
            <line key={d} x1="100" y1="4" x2="100" y2="12" stroke={THEME.primaryLight} strokeWidth="0.6" transform={`rotate(${d} 100 100)`} />
          ))}
        </g>
        <g data-ps-ring>
          <circle cx="100" cy="100" r="72" fill="none" stroke={THEME.bone} strokeOpacity="0.14" strokeWidth="0.4" strokeDasharray="6 4" />
        </g>
        <g data-ps-ring>
          <circle cx="100" cy="100" r="52" fill="none" stroke={THEME.bone} strokeOpacity="0.16" strokeWidth="0.4" strokeDasharray="1 3" />
          <circle cx="100" cy="48" r="2" fill={THEME.primaryLight} />
        </g>
        <g data-ps-core>
          <circle cx="100" cy="100" r="26" fill={THEME.primary} fillOpacity="0.1" stroke={THEME.primaryLight} strokeOpacity="0.6" strokeWidth="0.5" />
          <path d="M100 86 88 91v8c0 7 5 12 12 15 7-3 12-8 12-15v-8Z" fill="none" stroke={THEME.primaryLight} strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      </svg>
      <div className="relative h-[13vh] w-[80%] overflow-hidden border-y border-(--ord-bone)/10 [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent)] max-lg:w-full">
        <ul data-ps-log className="flex flex-col">
          {[...EVENTS, ...EVENTS].map(([kind, action], i) => (
            <li key={i} aria-hidden={i >= EVENTS.length} className="flex justify-between gap-6 py-[0.9vh] ord-label text-14 uppercase">
              <span className="text-ord-stone">{kind}</span>
              <span className={TONE[kind]}>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PolicyShield;
