// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { FadeUp, PAGE_DELAY } from "../Animations/gsapAnim";

type Option = { value: string; label: string; count?: number };

type FilterBarProps = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  countText: string;
};

const FilterBar = ({ label, options, value, onChange, countText }: FilterBarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-5 max-md:flex-col max-md:items-start max-md:gap-6">
    <div role="group" aria-label={label} className="flex flex-wrap gap-2 max-lg:gap-3">
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <FadeUp key={option.value} delay={PAGE_DELAY + 0.4 + index * 0.08}>
          <button
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`font-mpx-head flex h-[5vh] items-center gap-1 rounded-full border px-[1.2vw] text-22 transition-colors duration-300 max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw] ${
              active
                ? "border-(--mpx-ink) bg-(--mpx-ink) text-(color:--mpx-paper)"
                : "border-(--mpx-ink)/30 text-(color:--mpx-ink) hover:border-(--mpx-ink)"
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className="text-[0.8vw] pl-2 opacity-60 max-md:text-[4vw]">{option.count}</span>}
          </button>
          </FadeUp>
        );
      })}
    </div>
    <FadeUp delay={PAGE_DELAY + 0.4 + options.length * 0.08}>
      <p aria-live="polite" className="text-24 text-mpx-muted">
        {countText}
      </p>
    </FadeUp>
  </div>
);

export default FilterBar;
