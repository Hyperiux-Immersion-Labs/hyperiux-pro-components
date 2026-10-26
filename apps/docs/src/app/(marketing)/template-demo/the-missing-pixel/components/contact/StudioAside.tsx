// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, RuleDraw } from "../Animations/gsapAnim";
import UnderlineLink from "../Buttons/UnderlineLink";

const StudioAside = () => (
  <aside
    aria-label="Other ways to reach us"
    className="sticky top-[12vh] flex flex-col gap-10 rounded-[2vw] bg-(--mpx-ink) p-[3vw] text-(color:--mpx-paper) max-lg:static max-lg:rounded-[3vw] max-lg:p-[5vw] max-md:rounded-[5vw] max-md:p-[7vw]"
  >
    <FadeUp className="flex flex-col items-start gap-4">
      <p className="text-22 text-(color:--mpx-grey)">Prefer email?</p>
      <UnderlineLink
        href="mailto:hello@themissingpixel.studio"
        className="font-mpx-head text-28 break-all transition-colors duration-300 hover:text-(color:--mpx-accent)"
      >
        hello@themissingpixel.studio
      </UnderlineLink>
    </FadeUp>
    <div className="flex flex-col gap-4">
      <FadeUp delay={0.1}>
        <p className="font-mpx-body! text-22! tracking-normal! text-(color:--mpx-grey)">What happens next</p>
      </FadeUp>
      <ol>
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-paper)/15" />
            {index === STEPS.length - 1 && (
              <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-paper)/15" />
            )}
            <FadeUp
              delay={0.1 + index * 0.1}
              className="grid grid-cols-[2.5vw_1fr_auto] items-baseline gap-4 py-4 max-lg:grid-cols-[5vw_1fr_auto] max-md:grid-cols-[8vw_1fr]"
            >
              <span className="text-14 text-(color:--mpx-grey) tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-mpx-head text-24">{step.title}</span>
              <span className="text-14 text-(color:--mpx-grey) max-md:col-start-2">{step.time}</span>
            </FadeUp>
          </li>
        ))}
      </ol>
    </div>
  </aside>
);

export default StudioAside;

const STEPS = [
  { title: "We read it properly", time: "Within two working days" },
  { title: "A thirty-minute call", time: "Week 1" },
  { title: "A proposal you can forward", time: "Week 2" },
];
