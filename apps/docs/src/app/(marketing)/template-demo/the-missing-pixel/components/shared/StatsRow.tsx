// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, Odometer } from "../Animations/gsapAnim";

type Stat = { value: string; label: string };

type StatsRowProps = {
  items: Stat[];
  columns?: 3 | 4;
};

const StatsRow = ({ items, columns = 3 }: StatsRowProps) => (
  <ul
    className={`grid gap-9 max-lg:gap-6 ${
      columns === 4 ? "grid-cols-4 max-lg:grid-cols-2" : "grid-cols-3 max-md:grid-cols-1"
    }`}
  >
    {items.map((item, index) => (
      <FadeUp
        as="li"
        key={item.label}
        delay={index * 0.1}
        className="flex flex-col gap-4 border-t border-(--mpx-ink)/30 py-[1.4vw] max-lg:py-[2.6vw] max-md:py-[5vw]"
      >
        <Odometer value={item.value} className="font-mpx-head text-64 leading-none" />
        <span className="w-[80%] text-22 w-[90%] text-mpx-muted max-md:w-full">{item.label}</span>
      </FadeUp>
    ))}
  </ul>
);

export default StatsRow;
