// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { THEME } from "../../theme";

const AGENTS = ["Planner", "Researcher", "Analyst", "Coder", "Critic", "Courier"];
const C = 200;
const R = 140;
const NODES = AGENTS.map((name, i) => {
  const a = -Math.PI / 2 + (i / AGENTS.length) * Math.PI * 2;
  return { name, x: C + Math.cos(a) * R, y: C + Math.sin(a) * R, lx: C + Math.cos(a) * (R + 34), ly: C + Math.sin(a) * (R + 34) };
});

// Agents hero visual: the core hands the job to each specialist in turn. A packet travels core to agent,
// the agent lights and runs, and the packet carries the result on to the next one, then home.
const AgentGraph = () => {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = root.current;
      if (!svg) return;
      const nodes = gsap.utils.toArray<SVGGElement>("[data-ag-node]", svg);
      const links = gsap.utils.toArray<SVGLineElement>("[data-ag-link]", svg);
      const packet = svg.querySelector("[data-ag-packet]");
      if (prefersReducedMotion() || !packet) {
        gsap.set(nodes, { opacity: 1 });
        return;
      }
      gsap.to("[data-ag-orbit]", { rotate: 360, duration: 60, repeat: -1, ease: "none", svgOrigin: `${C} ${C}` });
      gsap.to("[data-ag-core]", { scale: 1.1, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut", svgOrigin: `${C} ${C}` });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      let from = { x: C, y: C };
      NODES.forEach((n, i) => {
        const dot = nodes[i].querySelector("[data-ag-dot]");
        const halo = nodes[i].querySelector("[data-ag-halo]");
        tl.fromTo(packet, { attr: { cx: from.x, cy: from.y } }, { attr: { cx: n.x, cy: n.y }, duration: 0.45, ease: "power2.inOut" })
          .to(links[i], { strokeOpacity: 0.8, duration: 0.2 }, "<")
          .to(dot, { attr: { fill: THEME.primaryLight, r: 9 }, duration: 0.25, ease: "back.out(3)" })
          .fromTo(halo, { attr: { r: 9 }, opacity: 0.6 }, { attr: { r: 26 }, opacity: 0, duration: 0.7, ease: "expo.out" }, "<")
          .to(nodes[i].querySelector("text"), { fill: THEME.bone, duration: 0.2 }, "<")
          .to(dot, { attr: { r: 6 }, duration: 0.3 }, ">-0.2");
        from = { x: n.x, y: n.y };
      });
      tl.to(packet, { attr: { cx: C, cy: C }, duration: 0.5, ease: "power2.inOut" })
        .fromTo("[data-ag-core-halo]", { attr: { r: 34 }, opacity: 0.6 }, { attr: { r: 90 }, opacity: 0, duration: 1, ease: "expo.out" })
        .to(links, { strokeOpacity: 0.18, duration: 0.6 }, "<")
        .to(gsap.utils.toArray("[data-ag-dot]", svg), { attr: { fill: THEME.ink }, duration: 0.6 }, "<")
        .to(gsap.utils.toArray("[data-ag-node] text", svg), { fill: THEME.stone, duration: 0.6 }, "<");
    },
    { scope: root },
  );

  return (
    <svg ref={root} viewBox="0 0 400 400" aria-hidden className="h-auto w-full overflow-visible">
      <g data-ag-orbit>
        <circle cx={C} cy={C} r={R + 60} fill="none" stroke={THEME.bone} strokeOpacity="0.08" strokeDasharray="2 6" />
        <circle cx={C} cy={C - R - 60} r="2.5" fill={THEME.primaryLight} />
      </g>
      <circle cx={C} cy={C} r={R} fill="none" stroke={THEME.primary} strokeOpacity="0.2" />
      {NODES.map((n, i) => (
        <line key={n.name} data-ag-link x1={C} y1={C} x2={n.x} y2={n.y} stroke={THEME.primaryLight} strokeOpacity="0.18" strokeWidth="0.8" data-i={i} />
      ))}
      <circle data-ag-core-halo cx={C} cy={C} r="34" fill="none" stroke={THEME.primaryLight} opacity="0" />
      <g data-ag-core>
        <circle cx={C} cy={C} r="34" fill={THEME.primary} fillOpacity="0.12" stroke={THEME.primaryLight} strokeOpacity="0.7" />
        <text x={C} y={C + 4} textAnchor="middle" fontSize="11" fill={THEME.bone} className="ord-label uppercase" letterSpacing="1">
          Ordin
        </text>
      </g>
      {NODES.map((n) => (
        <g key={n.name} data-ag-node>
          <circle data-ag-halo cx={n.x} cy={n.y} r="9" fill="none" stroke={THEME.primaryLight} opacity="0" />
          <circle data-ag-dot cx={n.x} cy={n.y} r="6" fill={THEME.ink} stroke={THEME.primaryLight} strokeWidth="1.2" />
          <text x={n.lx} y={n.ly + 4} textAnchor="middle" fontSize="11" fill={THEME.stone} className="ord-label uppercase" letterSpacing="0.6">
            {n.name}
          </text>
        </g>
      ))}
      <circle data-ag-packet cx={C} cy={C} r="4" fill={THEME.primaryLight} style={{ filter: "drop-shadow(0 0 4px var(--ord-primary-light))" }} />
    </svg>
  );
};

export default AgentGraph;
