// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, RuleDraw } from "../Animations/gsapAnim";

type Fact = { label: string; value: string };

const Facts = ({ items }: { items: Fact[] }) => (
  <dl className="relative grid grid-cols-4 gap-x-9 gap-y-6 py-[2vw] max-lg:grid-cols-2 max-lg:py-[4vw] max-md:grid-cols-1 max-md:py-[7vw]">
    <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
    {items.map((item, index) => (
      <FadeUp key={item.label} delay={index * 0.1} className="flex flex-col gap-1">
        <dt className="text-14 text-mpx-muted">{item.label}</dt>
        <dd className="font-mpx-head text-22 font-medium">{item.value}</dd>
      </FadeUp>
    ))}
    <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-ink)/10" />
  </dl>
);

export default Facts;
