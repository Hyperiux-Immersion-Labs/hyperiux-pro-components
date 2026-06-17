import PixelRandom from '@/components/showcase/transitions/PixelRandom/PixelRandomTransition'
import Footer from "@/components/LandingPage/Footer";
import React from'react'

export default function layout({ children }) {
 return (
 <PixelRandom color='#ff5f00'>
 <div className="w-full">
 {children}
 <Footer />
 </div>
 </PixelRandom>
 )
}
