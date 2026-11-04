// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { proof } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP);

const format = (value: number, decimals: number) => value.toFixed(decimals);

const Proof = () => {
  const root = useRef<HTMLElement>(null);
  const { report } = proof;

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "center 45%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-metric]", 0.3, 0.12, 20);
      gsap.utils.toArray<HTMLElement>("[data-orn-count]").forEach((el, i) => {
        const metric = proof.metrics[i];
        const counter = { v: 0 };
        el.textContent = format(0, metric.decimals);
        tl.to(counter, { v: metric.value, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = format(counter.v, metric.decimals); } }, 0.4 + i * 0.12);
      });
      fade(tl, "[data-orn-report]", 1, 0, 24);
      fade(tl, "[data-orn-report-row]", 1.3, 0.2, 10);
      tl.from("[data-orn-tick]", { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.3, stagger: 0.2, ease: "back.out(2)" }, 1.6);
      fade(tl, "[data-orn-result]", 2.2, 0, 12);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="proof" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light-alt">
      <div className="orn-container orn-section flex flex-col gap-14 max-md:gap-10">
        <h2 data-orn-split className="w-[70%] max-lg:w-full">
          <span className="block">{proof.title[0]}</span>
          <span className="block text-orn-muted">{proof.title[1]}</span>
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 border border-orn-line max-md:grid-cols-2">
            {proof.metrics.map((metric, i) => (
              <div
                key={metric.label}
                data-orn-metric
                data-orn-fade
                className={`flex flex-col gap-6 border-orn-line px-[1.6vw] py-[1.8vw] max-lg:px-[2.6vw] max-lg:py-[3vw] max-md:gap-4 max-md:px-[4vw] max-md:py-[5vw] ${i > 0 ? "border-l" : ""} ${i === 2 ? "max-md:border-l-0" : ""} ${i > 1 ? "max-md:border-t" : ""}`.replace(/\s+/g, " ").trim()}
              >
                <Icon name={metric.icon} className="h-[2.6vh] aspect-square self-start text-orn-accent max-lg:h-[2vh] max-md:h-[2.8vh]" />
                <div className="flex flex-col gap-1">
                  <p className="text-48 font-orn-display">
                    <span data-orn-count>{format(metric.value, metric.decimals)}</span>
                    {metric.suffix}
                  </p>
                  <p className="text-14 text-orn-muted">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-orn-mono text-12 text-orn-muted">{proof.sampleNote}</p>
        </div>
        <div data-orn-report data-orn-fade className="flex items-stretch gap-0 border border-orn-line bg-[color-mix(in_srgb,white_55%,transparent)] max-lg:flex-col">
          <div className="flex flex-1 flex-col px-[1.6vw] py-[1.4vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[5vw]">
            <div className="flex items-center justify-between gap-4 py-[0.6vw] max-lg:py-[1.4vw] max-md:py-[2vw]">
              <span className="flex items-center gap-2 text-14 font-medium">
                <span aria-hidden className="h-[0.8vh] aspect-square bg-[var(--orn-accent)] max-md:h-[1vh]" />
                {report.title}
              </span>
              <span className="font-orn-mono text-12 text-orn-muted">{report.total}</span>
            </div>
            <ul className="flex flex-col">
              {report.rows.map((row) => (
                <li
                  key={row.agent}
                  data-orn-report-row
                  data-orn-fade
                  className="flex items-center gap-6 border-t border-orn-line py-[1vw] max-lg:py-[2vw] max-md:gap-3 max-md:py-[4vw]"
                >
                  <Icon name={row.icon} className="h-[2.2vh] aspect-square text-orn-accent max-lg:h-[1.6vh] max-md:h-[2.4vh]" />
                  <span className="w-[22%] text-14 font-medium max-md:flex-1">{row.agent}</span>
                  <span className="flex-1 text-14 text-orn-muted max-md:hidden">{row.summary}</span>
                  <span className="font-orn-mono text-12 text-orn-muted">{row.time}</span>
                  <Icon name="check" className="h-[2.2vh] aspect-square text-orn-accent max-lg:h-[1.6vh] max-md:h-[2.4vh]" />
                </li>
              ))}
            </ul>
          </div>
          <div
            data-orn-result
            data-orn-fade
            className="flex w-[28%] flex-col justify-center gap-5 border-l border-orn-line px-[1.6vw] py-[1.6vw] max-lg:w-full max-lg:border-t max-lg:border-l-0 max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[5vw]"
          >
            <div className="flex items-center gap-3">
              <span data-orn-tick className="flex h-[3.6vh] aspect-square items-center justify-center bg-[var(--orn-mint)] text-[var(--orn-forest)] max-lg:h-[2.6vh] max-md:h-[4vh]">
                <Icon name="check" className="h-[60%] aspect-square" />
              </span>
              <div className="flex flex-col">
                <span className="text-14 font-medium">{report.result.title}</span>
                <span className="text-12 text-orn-muted">{report.result.detail}</span>
              </div>
            </div>
            <a
              href={report.result.cta.href}
              className="inline-flex h-[4.4vh] items-center justify-center gap-2 border border-orn-line text-14 transition-colors duration-200 hover:border-[var(--orn-accent)] max-lg:h-[3.4vh] max-md:h-[5vh]"
            >
              {report.result.cta.label}
              <Icon name="arrow" className="h-[1.4vh] aspect-square max-lg:h-[1.1vh] max-md:h-[1.6vh]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proof;
