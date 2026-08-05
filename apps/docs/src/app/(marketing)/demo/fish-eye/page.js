import FishEye from '@/components/fish-eye'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
    return (
        <>
        <DemoHeader />
        <LenisSmoothScroll />
     
        <div className='h-screen w-full bg-zinc-200 max-[1025px]:p-[20vw] max-md:p-[10vw] max-[1025px]:flex-col flex items-start p-[5vw] pt-[6.5vw] justify-between max-[1025px]:justify-center max-[1025px]:gap-[10vw] max-[1025px]:items-center'>

            <h1 className='absolute bottom-[8vw] left-[5vw] max-[1025px]:left-[2vw]  max-md:top-[18vw] max-[1025px]:top-[8vh] max-md:right-[5vw] text-black text-[7vw] max-[1025px]:text-[7vw] max-md:text-[12vw] leading-none font-bold'>
                FISH EYE
            </h1>

            <h2 className='absolute top-[5vw] text-right max-md:top-[85vh] max-[1025px]:top-[85vh] max-md:right-[5vw] right-[5vw] max-[1025px]:w-full text-black max-md:text-[12vw] max-[1025px]:text-[7vw] text-[7vw] leading-none font-bold max-md:hidden'>
                WITH <br />
                <span className='text-red-500'> TSL </span>
            </h2>

            <div className='hidden max-[1025px]:flex absolute inset-0 z-30 items-center justify-center px-8 text-center'>
                <div className='pointer-events-none flex max-w-sm flex-col items-center gap-3 text-black'>
                    <p className='text-[8vw] font-light leading-none tracking-tight uppercase'>
                        Open on desktop
                    </p>
                    <p className='text-sm leading-relaxed text-black/55'>
                        Hover unlocks the lens illusion. Best experienced on desktop.
                    </p>
                </div>
            </div>

            <div className='h-[30vw] w-[30vw] max-[1025px]:hidden relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg" />
            </div>

            <div className='h-[45vw] w-[30vw] max-[1025px]:hidden relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg" />
            </div>

            <div className='size-[25vw] mt-auto max-[1025px]:hidden relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg" />
            </div>

            <div className="absolute bottom-[1vw] right-[3vw] z-40 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-black text-[1.1vw] max-[1025px]:hidden shadow-md">
               Float your cursor over an image - watch the scene bulge, wobble and come alive.
            </div>
        </div>
           </>
    )
}
export async function generateMetadata() {
  return getDemoPageMetadata("fish-eye");
}
