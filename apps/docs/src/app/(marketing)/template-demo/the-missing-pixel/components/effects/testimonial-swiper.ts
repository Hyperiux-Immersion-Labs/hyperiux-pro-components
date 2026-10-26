// Built using Hyperiux Vault: https://vault.hyperiux.com

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export const testimonialSwiper = (steps: HTMLElement[]) => {
  const splits = steps.map((step) => SplitText.create(step.querySelector("p")!, {
    type: "lines",
    mask: "lines",
  }));
  let active = 0;
  let animation: gsap.core.Timeline | undefined;

  return {
    show(index: number) {
      if (index === active) return;
      const direction = index > active ? 1 : -1;
      active = index;
      animation?.kill();
      const step = steps[index];
      const others = steps.filter((_, i) => i !== index);
      const meta = step.querySelectorAll("h3, span");
      animation = gsap.timeline()
        .to(others, { autoAlpha: 0, duration: 0.2, ease: "power1.in" })
        .set(step, { autoAlpha: 1 })
        .fromTo(splits[index].lines, { yPercent: 110 * direction }, {
          yPercent: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: { each: 0.08, from: direction > 0 ? "start" : "end" },
        })
        .fromTo(meta, { autoAlpha: 0 }, {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
        }, 0.2);
    },
    destroy() {
      animation?.kill();
      splits.forEach((split) => split.revert());
    },
  };
};
