import React from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'

const Hero = () => {
    return (
        <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
            <img
        src="/landing-page/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full object-cover max-sm:block"
      />
            <div
                className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2 w-[60%] max-md:w-full"
            >

                <div className="h-fit flex max-md:flex-col max-md:justify-center items-center w-full">
                    <RandomBlur
                        as="h1"
                        className="text110 max-md:text-center max-md:indent-0! relative w-[78vw] max-md:w-full"
                    >
                        <span className="inline-block">
                            Start free. Upgrade when the interface gets ambitious.
                        </span>
                    </RandomBlur>
                </div>
                <SplitLine
                    as="p"
                    start="top 120%"
                    className="text24 max-md:text-center text-[#C9C9C9] w-[70%] max-md:w-full"
                >
                    Use the free Vault to ship real React and Next.js interaction effects. Upgrade to Pro when you need the full library, advanced systems, premium packs, and ongoing drops.
                </SplitLine>
            </div>
        </section>
    )
}

export default Hero