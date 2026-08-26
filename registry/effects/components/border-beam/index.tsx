// Built using Hyperiux Vault: https://vault.hyperiux.com

import { ShoppingCart } from "lucide-react";
import BeamBorder, { type BeamBorderProps } from "./BorderBeam";

type BorderBeamProps = Pick<BeamBorderProps, 'size' | 'colorVariant' | 'theme' | 'active' | 'strength' | 'duration' | 'beamWidth'> & {
  backgroundColor?: string;
};

const cardData = {
  label: "More offers",
  title: "There is something else for you",
  description:
    "Animated edge light keeps the feature surface alive while the content stays calm and readable.",
  buttonLabel: "Shop",
  buttonValue: "All products",
  size: "pulse-outside",
  colorVariant: "colorful",
  strength: 1,
} as const;

export default function BorderBeam({
  size = cardData.size,
  colorVariant = cardData.colorVariant,
  theme = "light",
  active = true,
  strength = 1,
  duration = 2,
  beamWidth = 2,
  backgroundColor = "#212121",
}: BorderBeamProps) {
  return (
    <BeamBorder
      size={size}
      colorVariant={colorVariant}
      theme={theme}
      active={active}
      strength={strength}
      duration={duration}
      beamWidth={beamWidth}
      className="h-full"
    >
      <div
        className="relative flex h-full min-h-0 overflow-hidden rounded-[10px] p-9 text-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] max-sm:p-7"
        style={{ backgroundColor }}
      >
        <div className="relative z-10 flex max-w-[310px] flex-col">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#74ff32]">
            {cardData.label}
          </p>
          <h2 className="mt-4 text-[46px] font-normal leading-[1.14] text-white max-sm:text-[38px]">
            {cardData.title}
          </h2>
        </div>

        <div className="absolute bottom-0 right-0 h-[48%] min-h-[230px] w-[48%] min-w-[230px] max-sm:right-[-44px] max-sm:scale-90">
          <div className="absolute bottom-2 left-10 h-28 w-40 rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,#363636,#111)] shadow-[inset_8px_12px_22px_rgba(255,255,255,0.08),inset_-18px_-20px_34px_rgba(0,0,0,0.72),0_24px_32px_rgba(0,0,0,0.45)]" />
          <div className="absolute bottom-16 left-8 h-28 w-40 rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,#3b3b3b,#151515)] shadow-[inset_10px_12px_22px_rgba(255,255,255,0.09),inset_-18px_-20px_30px_rgba(0,0,0,0.68),0_16px_28px_rgba(0,0,0,0.35)]" />
          <div className="absolute bottom-10 left-[6.5rem] h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_28%,#fafafa_0_12%,#9b9b9b_13%_26%,#151515_27%_68%,#030303_69%)] shadow-[0_12px_20px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-8 left-16 h-11 w-11 rotate-[-24deg] rounded-full bg-[radial-gradient(circle_at_35%_32%,#555,#070707_68%)] shadow-[0_10px_20px_rgba(0,0,0,0.45)]" />
          <div className="absolute bottom-4 left-[8.25rem] h-3 w-20 rounded-full bg-white/5 blur-[2px]" />
        </div>

        <button className="absolute bottom-8 left-9 z-10 flex min-w-[158px] items-center justify-between rounded-[12px] bg-white px-4 py-3 text-left text-black shadow-[0_18px_35px_rgba(0,0,0,0.16)] max-sm:left-7">
          <span>
            <span className="block text-[10px] uppercase tracking-[0.04em] text-black/42">
              {cardData.buttonLabel}
            </span>
            <span className="block text-sm leading-tight text-black">
              {cardData.buttonValue}
            </span>
          </span>
          <span className="ml-5 flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </button>
      </div>
    </BeamBorder>
  );
}
