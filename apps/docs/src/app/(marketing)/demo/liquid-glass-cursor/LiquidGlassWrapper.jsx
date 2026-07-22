'use client'
import React from 'react'
import LiquidGlassCursor from '@/components/liquid-glass-cursor'
import { ChevronRight, Play } from 'lucide-react'

const CustomIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 58 65" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M0 0H9.02977V28.5943H0V0Z" fill="#1D1D1F"/>
    <path d="M57.1895 64.7134H48.1597V36.1192H57.1895V64.7134Z" fill="#1D1D1F"/>
    <path d="M0.0195312 36.1192V64.7135H9.0493V42.139L21.5405 37.4737V28.7449L0.0195312 36.1192Z" fill="#1D1D1F"/>
    <path d="M48.1777 22.5746V0.00012207H57.3579V28.5944L34.332 37.8697V28.5944L48.1777 22.5746Z" fill="#1D1D1F"/>
    <path d="M21.9912 29.0459L28.4868 26.8346C28.8573 26.7085 29.2624 26.7316 29.6161 26.8992L34.7834 29.3469M21.9912 29.0459L28.1616 32.2063M21.9912 29.0459V37.1727L28.1616 40.0321M34.7834 29.3469L28.1616 32.2063M34.7834 29.3469C34.7834 32.3443 34.7834 34.1753 34.7834 37.1727L28.1616 40.0321M28.1616 32.2063V40.0321" stroke="#1D1D1F" strokeWidth="0.902977"/>
  </svg>
)

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    )
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function LiquidGlassWrapper() {
  const isMobile = useIsMobile()

  return (
    <>
 
    <div className="min-h-screen w-full relative bg-[#F5F5F7] overflow-hidden font-sans selection:bg-black selection:text-white">
      {!isMobile && (
        <LiquidGlassCursor baseSize={30} textHoverSize={130} borderColor="rgba(0,0,0,0.05)" />
      )}

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-white rounded-full filter blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 space-y-8 max-md:space-y-20 max-sm:space-y-10 max-w-5xl mx-auto">
        <div data-cursor="text" className="mb-[2vw] h-[5vw] w-[5vw] max-md:w-[8vw] max-md:h-[8vw] max-sm:mt-4 max-sm:w-[9vw] max-sm:h-[9vw] text-[#1D1D1F]">
          <CustomIcon className="w-full h-full object-contain" />
        </div>

        <div data-cursor="button" className="px-5 py-1.5 max-md:mt-4 bg-white border border-[#E5E5EA] rounded-full text-xs font-semibold text-[#86868B] tracking-wide uppercase mb-6 cursor-none hover:scale-105 transition-transform duration-300">
          New
        </div>

        <div className="text-center space-y-4">
          <h1 data-cursor="text" className="text-[88px] max-md:text-6xl leading-tight font-semibold tracking-[-0.04em] text-[#1D1D1F] inline-block px-4 py-2">
            LIQUID PRO.
          </h1>
          <p data-cursor="text" className="max-md:text-2xl text-3xl text-[#86868B] font-medium tracking-tight max-w-2xl mx-auto inline-block px-4">
            Mind-blowing fluidity. <br className="max-md:hidden" /> Design that simply flows.
          </p>
        </div>

        <div className="flex flex-row max-sm:flex-col items-center gap-6 mt-10">
          <button data-cursor="button" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1D1D1F] text-white font-medium text-lg max-sm:text-lg max-md:text-xl rounded-full transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-none">
            Buy <ChevronRight className="w-4 h-4 max-sm:w-5 max-sm:h-5 max-md:w-6 max-md:h-6" />
          </button>
          <button data-cursor="button" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-[#2997FF] font-medium text-lg max-sm:text-lg max-md:text-xl rounded-full transition-all hover:bg-[#2997FF]/10 hover:scale-105 active:scale-95 cursor-none">
            Watch the film <Play className="w-4 h-4 max-sm:w-5 max-sm:h-5 max-md:w-6 max-md:h-6 fill-current" />
          </button>
        </div>

        {isMobile && (
          <p className="max-sm:text-base max-md:text-2xl text-[#86868B] w-[80%] mx-auto text-center mt-4 leading-[1.2]">
            This page has a secret
life on desktop.<br />
Best experienced where hover exists.
          </p>
        )}
      </div>
      {!isMobile && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center "
        >
          <h2 className="text-sm leading-none text-[#111111]">
            The glass keeps flowing.
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/65">
            Liquid Glass Cursor&apos;s ripple follows your pointer in real
            time. Since the distortion is the interaction itself, reduced
            motion can&apos;t be applied here.
          </p>
        </div>
      )}
    </div>
     </>
  )
}