'use client'
import React, { useCallback, useState } from'react'
import { NumericTunnelLoader } from './NumericTunnelLoader'
import Button from '../WebsiteComps/Button'

export default function NumericTunnel() {
 const [isComplete, setIsComplete] = useState(false)
 const [tunnelInstance, setTunnelInstance] = useState(0)

 const handleComplete = useCallback(() => {
 setIsComplete(true)
 }, [])

 const handleReplay = useCallback(() => {
 setIsComplete(false)
 setTunnelInstance((currentInstance) => currentInstance + 1)
 }, [])

 return (
 <NumericTunnelLoader key={tunnelInstance} onComplete={handleComplete}>
 <div className="h-screen w-full bg-white">
  <div className="h-full w-full flex flex-col items-center justify-center gap-6">
 <h2 className=" text-black text-[4vw] font-bold max-sm:text-[8vw]">HYPERIUX VAULT</h2>
  <Button text=" Explore All Effects" href="/effects" variant="orange" />
<button
  type="button"
  onClick={handleReplay}
  className={`
    rounded-full border border-black/10 bg-white/60 px-5 py-2
    text-sm font-medium text-black backdrop-blur-md

    transition-all duration-300
    hover:scale-105 hover:border-black/20 hover:bg-white/80
    active:scale-95
    ${
      isComplete
        ? "opacity-100"
        : "pointer-events-none opacity-0"
    }`}
>
  ↻ Replay
</button>
</div>
 </div>
 </NumericTunnelLoader>
 )
}


