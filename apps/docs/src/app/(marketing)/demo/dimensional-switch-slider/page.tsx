import DimensionalSwitchSlider from '@/components/dimensional-switch-slider'
import React from 'react'

const page = () => {
  return (
    <>
    <div className="w-screen h-screen flex justify-center items-center bg-[#111111] text-foreground">
    <DimensionalSwitchSlider direction="horizontal"/>
    </div>
    
    </>
  )
}

export default page