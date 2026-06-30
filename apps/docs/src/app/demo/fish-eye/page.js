import FishEye from '@/components/fish-eye'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

export default function Page() {
    return (
        <>
        <DemoHeader />
        <LenisSmoothScroll />
     
        <div className='h-screen w-full bg-zinc-200 max-md:p-[20vw] max-sm:p-[10vw] max-md:flex-col flex items-start p-[5vw] pt-[6.5vw] justify-between max-md:justify-center max-md:gap-[10vw] max-md:items-center'>

            <h2 className='absolute bottom-[5vw] left-[5vw] max-md:left-[2vw]  max-sm:top-[18vw] max-md:top-[8vh] max-sm:right-[5vw] text-black text-[7vw] max-md:text-[7vw] max-sm:text-[12vw] leading-none font-bold'>
                FISH EYE
            </h2>

            <h2 className='absolute top-[5vw] text-right max-sm:top-[85vh] max-md:top-[85vh] max-sm:right-[5vw] right-[5vw] max-md:w-full text-black max-sm:text-[12vw] max-md:text-[7vw] text-[7vw] leading-none font-bold'>
                WITH <br />
                <span className='text-red-500'> TSL </span>
            </h2>

            {/* mobile warning */}
            <div className='hidden max-md:flex absolute z-30 left-0 bottom-0  -translate-y-1/2 px-5'>
                <div className='rounded-full  px-5 py-3 text-left text-black text-lg max-sm:text-base leading-[1.2] w-80'>
                     Hover unlocks the illusion <br /> Best experienced on desktop
                </div>
            </div>

            <div className='h-[30vw] w-[30vw] max-md:size-[40vw] relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg" />
            </div>

            <div className='h-[45vw] w-[30vw] max-md:h-[50vw] max-md:w-[40vw] relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg" />
            </div>

            <div className='size-[25vw] mt-auto max-md:mt-0 max-md:size-[30vw] relative'>
                <FishEye src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg" />
            </div>

            <div className="absolute bottom-[1vw] right-[3vw] z-40 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-black text-[1.1vw] max-md:hidden shadow-md">
                Pssst... Float your cursor over an image - watch the scene bulge, wobble and come alive.
            </div>
        </div>
           </>
    )
}