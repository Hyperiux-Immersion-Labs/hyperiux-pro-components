import BeamBorder from './BorderBeam'

const cardData = {
  label: 'Rotate',
  title: 'Shipping motion that reads premium, not noisy',
  description:
    'This effect sends a rotating beam of color around the border, creating a continuous orbit that keeps the surface feeling active without overpowering the content.',
  statLabel: 'Motion',
  statValue: 'Continuous rotation',
  size: 'md',
  colorVariant: 'colorful',
  strength:0.7,
}

export default function BorderBeam({
  size = cardData.size,
  colorVariant = cardData.colorVariant,
  theme = "light",
  active = true,
  strength = 1,
  duration,
  beamWidth,
  backgroundColor = "#f4f5f7",
}) {
  return (
    <BeamBorder
      size={size}
      colorVariant={colorVariant}
      theme={theme}
      active={active}
      strength={strength}
      duration={duration}
      beamWidth={beamWidth}
    >
      <div
        className="rounded-md p-[2.2vw] backdrop-blur-sm max-md:p-[4.8vw] max-sm:p-[6vw]"
        style={{ backgroundColor }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.8vw] uppercase tracking-[0.22em] text-black/45 max-md:text-[1.8vw] max-sm:text-[3vw]">
              Featured Surface
            </p>
            <h2 className="mt-[0.8vw] max-w-[28vw] text-[2.2vw] font-medium leading-[1.1] tracking-[-0.04em] text-black max-md:mt-[1.6vw] max-md:max-w-full max-md:text-[5vw] max-sm:mt-[2vw] max-sm:text-[7vw]">
              {cardData.title}
            </h2>
          </div>

          <span className="rounded-full border border-black/10 bg-black/5 px-[1vw] py-[0.4vw] text-[0.7vw] uppercase tracking-[0.18em] text-black/70 max-md:px-[2.4vw] max-md:py-[1vw] max-md:text-[1.6vw] max-sm:px-[3.5vw] max-sm:py-[1.6vw] max-sm:text-[2.6vw]">
            {cardData.label}
          </span>
        </div>

        <p className="mt-[1.6vw] max-w-[32vw] text-[1vw] leading-[1.6] text-black/60 max-md:mt-[3vw] max-md:max-w-full max-md:text-[2.5vw] max-sm:mt-[4vw] max-sm:text-[3.4vw]">
          {cardData.description}
        </p>

        <div className="mt-[2.4vw] flex items-end justify-between gap-4 border-t border-black/10 pt-[1.6vw] max-md:mt-[5vw] max-md:pt-[3vw] max-sm:mt-[6vw] max-sm:flex-col max-sm:items-start max-sm:pt-[4vw]">
          <div>
            <p className="text-[0.7vw] uppercase tracking-[0.2em] text-black/40 max-md:text-[1.5vw] max-sm:text-[2.5vw]">
              {cardData.statLabel}
            </p>
            <p className="mt-[0.5vw] text-[1.2vw] font-medium text-black max-md:mt-[1vw] max-md:text-[2.5vw] max-sm:mt-[1.4vw] max-sm:text-[4vw]">
              {cardData.statValue}
            </p>
          </div>

          <div className="flex gap-[0.6vw] max-md:gap-[1.4vw] max-sm:gap-[2vw]">
            <span className="h-[0.8vw] w-[0.8vw] rounded-full bg-[#ff5a7a] max-md:h-[1.8vw] max-md:w-[1.8vw] max-sm:h-[3vw] max-sm:w-[3vw]" />
            <span className="h-[0.8vw] w-[0.8vw] rounded-full bg-[#45a3ff] max-md:h-[1.8vw] max-md:w-[1.8vw] max-sm:h-[3vw] max-sm:w-[3vw]" />
            <span className="h-[0.8vw] w-[0.8vw] rounded-full bg-[#55d88a] max-md:h-[1.8vw] max-md:w-[1.8vw] max-sm:h-[3vw] max-sm:w-[3vw]" />
          </div>
        </div>
      </div>
    </BeamBorder>
  )
}
