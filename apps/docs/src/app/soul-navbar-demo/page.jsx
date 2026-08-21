'use client'

import { Leva, useControls } from 'leva'
import SoulNavbar from '@/components/soul-navbar/SoulNavbar'

export default function SoulNavbarDemoPage() {
  const { isHovered, isOpen } = useControls('State', {
    isHovered: { value: false, label: 'is hovered' },
    isOpen: { value: false, label: 'is open' },
  })

  const controls = useControls('Veil shape', {
    warpAmount: { value: 1.20, min: 0, max: 1.2, step: 0.01 },
    warpScale: { value: 0.85, min: 0.2, max: 3, step: 0.05 },
    edgeChaos: { value: 0.44, min: 0, max: 1.5, step: 0.01 },
    center: { value: 0.80, min: 0.2, max: 0.8, step: 0.01 },
    band: { value: 0.22, min: 0.002, max: 0.4, step: 0.002, label: 'edge feather' },
    gamma: { value: 1.50, min: 0.3, max: 2.5, step: 0.05 },
    hoverRadius: { value: 0.21, min: 0.05, max: 1, step: 0.01 },
  })

  const ink = useControls('Veil ink', {
    inkDark: { value: 0.02, min: 0, max: 0.3, step: 0.002, label: 'core' },
    inkEdge: { value: 0.11, min: 0, max: 0.6, step: 0.005, label: 'fringe' },
    toneSpread: { value: 0.48, min: 0.1, max: 3, step: 0.02, label: 'ramp spread' },
    toneGamma: { value: 2.45, min: 0.3, max: 3, step: 0.05, label: 'ramp bias' },
    inkVariation: { value: 0.00, min: 0, max: 0.3, step: 0.005, label: 'cloudiness' },
  })

  const timing = useControls('Veil timing', {
    hoverSpeed: { value: 2.5, min: 0.1, max: 8, step: 0.05, label: 'Hover speed' },
    openSpeed: { value: .2, min: 0.2, max: 15, step: 0.1, label: 'Open speed' },
    retract: { value: .6, min: 0.2, max: 20, step: 0.1, label: 'Close speed' },
  })

  const forcedProgress = isOpen ? 2 : isHovered ? 1 : null

  return (
    <main className="relative h-screen w-full bg-[#C3C3C3]">
      <h1 className='text-[2.5vw] w-full text-center text-black font-serif! absolute top-1/2 -translate-x-1/2 mx-auto left-1/2'>Ink Navbar With WebGpu</h1>

      <SoulNavbar
        debug={false}
        veilControls={{ ...controls, ...ink, ...timing }}
        forcedProgress={forcedProgress}
      />
    </main>
  )
}
