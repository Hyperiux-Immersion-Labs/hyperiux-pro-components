import React from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'

const Hero = () => {
    return (
        <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
            <div
                className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2"
            >

                <div className="h-fit flex max-md:flex-col max-md:justify-center items-center w-full">
                    <RandomBlur
                        as="h1"
                        className="text140 max-md:text-center max-md:indent-0! relative w-[78vw] max-md:w-full"
                    >
                        <span className="inline-block">
                            <span className="max-md:hidden w-45 h-full inline-block"></span>
                            Build with the free Vault. Upgrade when the interface starts getting ambitious.
                        </span>
                    </RandomBlur>
                </div>
                <SplitLine
                    as="p"
                    start="top 120%"
                    className="text22 max-md:text-center"
                >
                    Start with 30+ free effects, move into premium interaction packs, or request
                    custom motion systems built for your product.
                </SplitLine>
            </div>
        </section>
    )
}

export default Hero