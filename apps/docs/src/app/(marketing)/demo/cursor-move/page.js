import React from 'react'
import CursorMove from '@/components/cursor-move'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor='#ffffff' />
        <CursorMove
          text="Hello!"
          textAs="h1"
          backgroundClassName="bg-zinc-950"

        />
        <div className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-white text-[1.05vw] max-[1025px]:hidden shadow-lg w-[52vw] text-center">
         Glide your cursor over the screen - the crosshair dances, the letters bend, and the coordinates responds.
        </div>
        <div className='absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-7 py-4 rounded-[3vw] text-white text-[2.5vw] max-md:text-[4vw] hidden max-[1025px]:block w-[45%] max-md:w-[80%] text-center mx-auto'>
            Open on desktop to experience the effect as intended.
        </div>
    </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("cursor-move");
}
