import PixelRandom from '@/components/showcase/transitions/PixelRandom/PixelRandomTransition'
import React from'react'

export default function layout({ children }) {
 return (
 <PixelRandom color='#ff5f00'>
 {children}
 </PixelRandom>
 )
}
