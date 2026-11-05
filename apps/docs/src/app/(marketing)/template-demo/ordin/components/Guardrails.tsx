// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { useResizeKey } from "./Animations/useResizeKey";
import LineReveal from "./Animations/LineReveal";
import { THEME, alpha } from "../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const POLICIES = [
  { name: "Scoped permissions", body: "Each agent touches only the tables, tools and inboxes its brief names." },
  { name: "All-or-nothing runs", body: "A job settles in full or rolls back. No half-paid batches." },
  { name: "Spend ceilings", body: "Limits live on the action itself, not in a prompt someone can talk around." },
  { name: "Human sign-off", body: "Anything outbound waits in a queue until a person approves it." },
  { name: "Full audit trail", body: "Every token, tool call and decision is signed and replayable." },
];

const ACTIONS = [
  { label: "read ledger.q3", kind: "ok", policy: 0 },
  { label: "drop table vendors", kind: "block", policy: 0 },
  { label: "pay 14 invoices as one batch", kind: "ok", policy: 1 },
  { label: "wire USD 48,000", kind: "block", policy: 2 },
  { label: "email 14 vendors", kind: "hold", policy: 3 },
  { label: "commit run 8821", kind: "ok", policy: 4 },
] as const;

const STATUS = { ok: "Passed", block: "Denied", hold: "Awaiting sign-off" };

const Guardrails = () => {
  const root = useRef<HTMLElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>("[data-ord-stage]");
      const rings = section?.querySelector<HTMLElement>("[data-ord-rings]");
      if (!section || !stage || !rings) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-ord-policy]", section);
      const packets = gsap.utils.toArray<HTMLElement>("[data-ord-action]", section);
      const outer = section.querySelector("[data-ord-outer]");
      const svg = section.querySelector<SVGSVGElement>("[data-ord-guard-wires]");
      const wires = gsap.utils.toArray<SVGPathElement>("[data-ord-guard-wire]", section);

      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1 });
        gsap.set(wires, { opacity: 0 });
        gsap.set(packets, { opacity: 0 });
        return;
      }

      const spin = gsap.to("[data-ord-spin]", {
        rotate: (i) => (i % 2 ? -360 : 360),
        duration: (i) => 60 + i * 30,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      const box = stage.getBoundingClientRect();
      const r = rings.getBoundingClientRect();
      const cx = r.left - box.left + r.width / 2;
      const cy = r.top - box.top + r.height / 2;
      const edge = r.width * 0.46;
      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      const startX = isMobile() ? box.width + 40 : cx + edge + 10 * vw;

      packets.forEach((p, i) => gsap.set(p, { x: startX, y: cy + (i % 2 ? 1 : -1) * 2.5 * vh, xPercent: -50, yPercent: -50, opacity: 0 }));
      gsap.set(items, { opacity: 0 });

      const mobile = isMobile();
      if (svg) svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      items.forEach((item, i) => {
        const ir = item.getBoundingClientRect();
        const ex = ir.left - box.left - 1.2 * vw;
        const ey = ir.top - box.top + ir.height / 2;
        const a = Math.atan2(ey - cy, ex - cx);
        const sx = cx + Math.cos(a) * edge;
        const sy = cy + Math.sin(a) * edge;
        const mid = (sx + ex) / 2;
        wires[i]?.setAttribute("d", `M${sx} ${sy} C${mid} ${sy} ${mid} ${ey} ${ex} ${ey}`);
        const len = wires[i]?.getTotalLength() ?? 0;
        if (wires[i]) gsap.set(wires[i], { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        // Starts when the stage pins (below the section's top padding), once the globe sits inside the circle.
        // Ends a screen early: the last screen is where Platform slides up over this pinned stage
        scrollTrigger: {
          trigger: section.querySelector("[data-ord-stage]") ?? section,
          start: "top top",
          endTrigger: section,
          end: "bottom 200%",
          scrub: 0.8,
        },
      });

      tl.to({}, { duration: 0.5 });

      // Each action gets one beat; a new policy first spends a beat bringing its block in,
      // so the packet only sets off once the rule it is about to meet is on screen
      let cursor = 0.5;
      ACTIONS.forEach((a, i) => {
        const p = packets[i];
        const status = p.querySelector("[data-ord-status]");
        const strike = p.querySelector("[data-ord-strike]");
        if (i === 0 || ACTIONS[i - 1].policy !== a.policy) {
          const k = a.policy;
          if (k > 0) tl.to(items.slice(0, k), { opacity: 0.4, duration: 0.2 }, cursor);
          if (!mobile && wires[k]) tl.to(wires[k], { strokeDashoffset: 0, duration: 0.35, ease: "power2.inOut" }, cursor);
          tl.fromTo(items[k], { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, cursor + (mobile ? 0 : 0.3));
          cursor += mobile ? 0.35 : 0.65;
        }
        const at = cursor;
        cursor += 1;
        tl.to(p, { opacity: 1, duration: 0.15 }, at);
        if (a.kind === "block") {
          tl.to(p, { x: cx + edge, duration: 0.45, ease: "power2.in" }, at)
            .to(outer, { strokeOpacity: 1, duration: 0.05 }, ">")
            .to(p, { borderColor: alpha(THEME.bone, 0.9), duration: 0.05 }, "<")
            .to(strike, { scaleX: 1, duration: 0.1 }, "<")
            .to(status, { opacity: 1, duration: 0.05 }, "<")
            .to(p, { x: cx + edge + 4 * vw, y: `+=${10 * vh}`, rotate: 8, opacity: 0, duration: 0.4, ease: "power1.in" }, ">0.1")
            .to(outer, { strokeOpacity: 0.5, duration: 0.2 }, "<");
        } else if (a.kind === "hold") {
          tl.to(p, { x: cx + edge + 2 * vw, duration: 0.35, ease: "power2.out" }, at)
            .to(p, { borderColor: THEME.primaryLight, color: THEME.primaryLight, duration: 0.05 }, ">")
            .to(status, { opacity: 1, duration: 0.05 }, "<")
            .to(p, { x: cx, scale: 0.3, opacity: 0, duration: 0.4, ease: "power2.in" }, ">0.15");
        } else {
          tl.to(p, { x: cx, scale: 0.3, duration: 0.6, ease: "power2.in" }, at)
            .to(p, { backgroundColor: THEME.primary, borderColor: THEME.primary, color: THEME.ink, duration: 0.05 }, at + 0.15)
            .to(status, { opacity: 1, duration: 0.05 }, "<")
            .to(p, { opacity: 0, duration: 0.1 }, at + 0.55);
        }
      });

      tl.to(items, { opacity: 1, duration: 0.3 }, ">").to({}, { duration: 0.4 });

      return () => spin.kill();
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="governance" data-ord-orb="guard" className="relative h-[300vh] pt-[7%]">
      <div data-ord-stage className="sticky top-0 h-screen overflow-hidden">
        <div
          data-ord-rings
          aria-hidden
          className="absolute left-[26vw] top-[54vh] h-[76vh] aspect-square -translate-x-1/2 -translate-y-1/2 max-md:left-[50vw] max-md:top-[36vh] max-md:h-[50vh]"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <g data-ord-spin>
              <circle cx="50" cy="50" r="30" fill="none" stroke={THEME.bone} strokeOpacity="0.14" strokeWidth="0.15" strokeDasharray="0.4 1.2" />
            </g>
            <g data-ord-spin>
              <circle cx="50" cy="50" r="38" fill="none" stroke={THEME.bone} strokeOpacity="0.1" strokeWidth="0.15" strokeDasharray="4 2" />
            </g>
            <circle data-ord-outer cx="50" cy="50" r="46" fill="none" stroke={THEME.primary} strokeOpacity="0.5" strokeWidth="0.25" />
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="2"
                x2="50"
                y2="5"
                stroke={THEME.primaryLight}
                strokeOpacity="0.7"
                strokeWidth="0.2"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </svg>
        </div>
        {ACTIONS.map((a) => (
          <span
            key={a.label}
            data-ord-action
            aria-hidden
            className="absolute left-0 top-0 flex flex-col items-start gap-1 rounded-xs border border-(--ord-bone)/25 bg-transparent px-[0.8vw] py-[0.8vh] ord-label text-14 whitespace-nowrap text-(--ord-bone) opacity-0 max-lg:px-[1.6vw] max-md:px-[3vw]"
          >
            <span className="relative">
              {a.label}()
              <span data-ord-strike className="absolute inset-x-0 top-1/2 block h-px origin-left bg-(--ord-bone) [transform:scaleX(0)]" />
            </span>
            <span data-ord-status className="uppercase opacity-0">
              {STATUS[a.kind]}
            </span>
          </span>
        ))}
        <svg data-ord-guard-wires aria-hidden className="pointer-events-none absolute inset-0 h-full w-full max-md:hidden">
          {POLICIES.map((p) => (
            <path key={p.name} data-ord-guard-wire d="" fill="none" stroke={alpha(THEME.primary, 0.55)} strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute right-[5vw] top-0 flex h-screen w-[34vw] flex-col justify-center gap-10 max-lg:right-[4vw] max-lg:w-[44vw] max-md:inset-x-[5vw] max-md:top-auto max-md:bottom-0 max-md:h-auto max-md:w-auto max-md:gap-5 max-md:py-[5vh]">
          <LineReveal>
            <h2>
              Agents improvise. <span className="text-ord-stone">Policies don&apos;t.</span>
            </h2>
          </LineReveal>
          <ul className="flex flex-col">
            {POLICIES.map((p, i) => (
              <li key={p.name} data-ord-policy className="relative flex gap-6 border-t border-(--ord-bone)/12 py-[1.8vh] max-md:gap-4 max-md:py-[1.2vh]">
                <span className="ord-label text-14 text-ord-primary-light">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-30">{p.name}</h3>
                  <p className="text-24 text-ord-stone max-md:hidden">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Guardrails;
