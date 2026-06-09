'use client'
import { NumericTunnel } from '@/components/numeric-tunnel'
import React from'react'

export default function page() {
 return (
 <NumericTunnel>
 <div className="h-screen w-full bg-white">
 <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-[10vw] font-bold">UI</h2>
 </div>
 </NumericTunnel>
 )
}
