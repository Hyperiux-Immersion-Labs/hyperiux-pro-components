import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'

interface OrisWrapperProps {
  children: React.ReactNode
}

export default function OrisWrapper({ children }: OrisWrapperProps) {
  return (
    <main id='main' className='bg-white'>
      <LenisSmoothScroll lerp={.1} />
      {children}
    </main>
  )
}
