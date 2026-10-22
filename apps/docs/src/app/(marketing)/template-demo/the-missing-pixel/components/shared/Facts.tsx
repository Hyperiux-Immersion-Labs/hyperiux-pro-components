// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp } from "../Animations/gsapAnim";

type Fact = { label: string; value: string };

const Facts = ({ items }: { items: Fact[] }) => (
  <FadeUp
    as="dl"
    className="grid grid-cols-4 gap-x-9 gap-y-6 border-y border-black/10 py-[2vw] max-lg:grid-cols-2 max-lg:py-[4vw] max-md:grid-cols-1 max-md:py-[7vw]"
  >
    {items.map((item) => (
      <div key={item.label} className="flex flex-col gap-1">
        <dt className="text-14 text-mpx-muted">{item.label}</dt>
        <dd className="font-mpx-head text-22 font-medium">{item.value}</dd>
      </div>
    ))}
  </FadeUp>
);

export default Facts;
