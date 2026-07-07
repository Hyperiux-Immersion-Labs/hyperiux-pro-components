"use client"
import React from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'
import { useFadeUp } from '../Animations/gsapAnimations'

const Hero = () => {
    useFadeUp()
    return (
        <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
            <img
        src="/landing-page/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full object-cover max-md:block"
      />
            <div
                className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2 w-[60%] max-md:w-full"
            >

                <div className="h-fit flex max-md:flex-col max-md:justify-center items-center w-full">
                    <RandomBlur
                        as="h1"
                        className="text110 max-md:text-center max-md:indent-0! relative w-[45vw] max-md:w-full"
                    >
                        <span className="inline-block">
                           Start free. Join Founding Access for Pro.
                        </span>
                    </RandomBlur>
                </div>
                <SplitLine
                    as="p"
                    start="top 120%"
                    className="text24 max-md:text-center text-[#C9C9C9] w-[70%] max-md:w-full"
                >
                    Free Core is open today with 30+ source-owned React and Next.js effects. Vault Pro opens next week through Founding Access, unlocking 80+ premium effects across scroll systems, cursor effects, text reveals, page transitions, loaders, backgrounds, and WebGL scenes.
                </SplitLine>
            </div>
        </section>
    )
}

export default Hero