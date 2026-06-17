import React from 'react'
import CursorMove from '@/components/cursor-move'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
  return (
    <>
      <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
        <CursorMove
          text="Hello!"
          backgroundClassName="bg-zinc-950"
          paddingClassName="p-24"
          showCrosshair
          crosshairVariant="solid"
          crosshairClassName="bg-white/10"
          crosshairDashedDashLength={14}
          crosshairDashedGap={14}
          crosshairDashedColor="rgba(255,255,255,0.2)"
          showCursorDot
          cursorDotClassName="w-3 h-3 bg-orange-500 rounded-sm"
          textClassName="text-9xl max-md:text-6xl max-sm:text-4xl text-orange-500 select-none leading-none"
          showCoordinates
          coordinatesTextClassName="text-xs text-white/40 tabular-nums"
          fontVariationMapping={{
            y: { name: "wght", min: 100, max: 900 },
          }}
          skewXRange={{ min: 0, max: -20 }}
          variableTextTransition="font-variation-settings 0.05s linear, transform 0.05s linear"
          variableTextTransformOrigin="bottom"
        />
        <div className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-white text-[1.05vw] max-md:hidden shadow-lg">
         Glide your cursor over the screen - the crosshair dances, the letters bend, and the coordinates responds.
        </div>
        <div className='absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-3 py-2 rounded-[3vw] text-white text-[2.5vw] max-sm:text-[4vw] hidden max-md:block w-[45%] max-sm:w-[60%] text-center mx-auto'>
            Open on desktop to experience the effect as intended.
        </div>
    </>
  )
}

export default page
