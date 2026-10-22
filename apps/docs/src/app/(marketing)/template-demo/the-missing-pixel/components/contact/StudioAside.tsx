// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp } from "../Animations/gsapAnim";

const StudioAside = () => (
  <aside
    aria-label="Other ways to reach us"
    className="sticky top-[12vh] flex flex-col gap-10 rounded-[2vw] bg-[#0a0a0a] p-[3vw] text-[#f5f5f5] max-lg:static max-lg:rounded-[3vw] max-lg:p-[5vw] max-md:rounded-[5vw] max-md:p-[7vw]"
  >
    <FadeUp className="flex flex-col items-start gap-4">
      <p className="text-22 text-[#9a9a9a]">Prefer email?</p>
      <a
        href="mailto:hello@themissingpixel.studio"
        className="font-mpx-head text-30 break-all underline underline-offset-4 transition-colors duration-300 hover:text-[#ff5f00]"
      >
        hello@themissingpixel.studio
      </a>
    </FadeUp>
    <FadeUp delay={0.1} className="flex flex-col gap-4">
      <p className="font-mpx-body! text-22! tracking-normal! text-[#9a9a9a]">What happens next</p>
      <ol>
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2.5vw_1fr_auto] items-baseline gap-4 border-t border-[#f5f5f5]/15 py-4 last:border-b max-lg:grid-cols-[5vw_1fr_auto] max-md:grid-cols-[8vw_1fr]"
          >
            <span className="text-14 text-[#9a9a9a] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span className="font-mpx-head text-24">{step.title}</span>
            <span className="text-14 text-[#9a9a9a] max-md:col-start-2">{step.time}</span>
          </li>
        ))}
      </ol>
    </FadeUp>
  </aside>
);

export default StudioAside;

const STEPS = [
  { title: "We read it properly", time: "Within two working days" },
  { title: "A thirty-minute call", time: "Week 1" },
  { title: "A proposal you can forward", time: "Week 2" },
];
