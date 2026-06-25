import NoiseRippleCursor from '@/components/noise-ripple-cursor'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import LinkButton from '@/components/link-button'

export default function page() {
    return (
        <>
            <LenisSmoothScroll />
            <div className='min-h-screen w-full relative bg-[]'>
                {/* Hero Section - Full Screen */}
                <section className='h-screen w-full relative'>
                    <p className='text-[11vw] w-[80vw] font-medium tracking-tight leading-[.9] p-[2vw] absolute text-white max-md:text-[14vw] max-md:w-[90vw] bottom-[1.5vw] max-md:bottom-[10vw] max-sm:bottom-[20vw] max-sm:left-3 pointer-events-none z-10'>
                       Noise Ripple Effect

                    </p>
                    <p className='hidden max-md:block text-[3.5vw] max-sm:text-[4.5vw] absolute max-sm:bottom-[5vw] max-md:bottom-[3.5vh] max-sm:left-5 max-md:left-5  z-10 text-white w-[70%] leading-[1.2]'>
                        Best enjoyed on desktop for the full effect
                    </p>
                    <div className='absolute bottom-5 left-20 max-sm:left-15 max-md:bottom-[95%] z-10 '>
                        <LinkButton
                            text="Browse more effects"
                            href="/effects"
                            textColor="#ffffff"
                            mobileText='Browse more effects'
                            className="text-[1vw] max-md:text-[2vw]! max-sm:text-[3vw]!"
                            iconClassName="size-[1vw] max-md:size-[2.4vw] max-sm:size-[3vw]"
                        />
                    </div>
                    <NoiseRippleCursor />

                    <p className='absolute top-10 max-sm:top-20 right-10 text-[1.2vw] leading-[1.2] z-20 p-3 bg-white/10 rounded-xl max-md:hidden backdrop-blur-lg w-60 text-center'>
                        Drift through the frame. Leave the ordinary behind.
                    </p>
                </section>

            </div>
        </>

    )
}
