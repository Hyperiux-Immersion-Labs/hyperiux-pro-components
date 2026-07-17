"use client"
import React from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'
import { useFadeUp } from '../Animations/gsapAnimations'
import LineReveal from '../Animations/LineReveal'

const Hero = () => {
    useFadeUp()
    return (
        <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
            <img
        src="/landing-page/hero-bg.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full object-cover max-md:block"
      />
            <div
                className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2 w-[75%] max-md:w-full"
            >

                <div className="h-fit flex max-sm:flex-col max-sm:justify-start items-center w-full">
                    <LineReveal
                        as="h1"
                        className="text120 max-sm:text-left max-sm:indent-0! relative w-full text-white"
                    >
                        Start Free Today.<br/> Upgrade to Pro for Complete Access.
                    </LineReveal>
                </div>
                <SplitLine
                    as="p"
                    start="top 120%"
                    className="text24 max-sm:text-left text-[#C9C9C9] w-[65%] max-sm:w-[95%] max-md:w-[80%]"
                >
                    Free Core is open today with 30+ source-first React and Next.js effects. Vault Pro opens next week through Founding Access, unlocking 80+ premium effects across scroll systems, cursor effects, text reveals, page transitions, loaders, backgrounds, and WebGL scenes.
                </SplitLine>
            </div>
        </section>
    )
}

export default Hero