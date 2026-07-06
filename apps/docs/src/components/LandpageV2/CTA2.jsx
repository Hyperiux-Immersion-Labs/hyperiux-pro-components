import React from 'react'
import Button from '../WebsiteComps/Button';
import RandomBlur from '../WebsiteComps/RandomBlur';
import ShimmerText from '../WebsiteComps/ShimmerText';
import { UnlockIcon } from 'lucide-react';

export default function CTA2({
    animations = true,
    href = "/pricing#pricing-cards",
    isHomePage = false,
    isHomepage = false,
}) {
    // const shouldOffsetPricingScroll = isHomePage || isHomepage;

    return (
        <div className=" z-100 h-fit py-[5vw] pt-[12vw]  overflow-hidden flex items-end justify-end relative max-md:min-h-0 max-sm:py-[15vw] max-sm:px-[7vw]">
            <div className="w-full max-md:space-y-[6vw] max-sm:space-y-[8vw] h-fit relative z-2">
                {
                    animations ? (
                        <RandomBlur
                            as="h2"
                            className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! w-[70%] mx-auto text-center"
                        >
                            Build the interaction layer your website is missing.
                        </RandomBlur>
                    ) : (
                        <h2
                            className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! w-[70%] mx-auto text-center"
                        >
                            Build the interaction layer your website is missing.
                        </h2>
                    )
                }

                <p className="text-center text24 py-[2vw]">Copy the code. Tune the motion. Ship the moment.</p>

                <div className="flex max-sm:flex-col items-center max-sm:gap-[4vw] pb-[2vw] mb-[4.5vw] max-md:mb-[15vw] relative max-sm:mb-[10vw] justify-center gap-[2vw] fadeup">
                    <Button variant='outline2' text="Browse the effects" href="/effects" className='max-sm:w-full' />
                    <Button text="Get Pro from $20/mo" className="max-sm:w-full" href={href} variant="orange" />
                    <p
                        className="shimmer-text w-full flex justify-center items-center gap-[0.5vw] text-[#939393] leading-none max-md:justify-center max-md:gap-2 absolute max-sm:bottom-[-12vw] max-md:bottom-[-5vw] bottom-[-.8vw] left-1/2 -translate-x-1/2"
                    >
                        <span className="inline-block size-[0.9vw] shrink-0 text-[#d2d2d2] max-md:size-3">
                            <UnlockIcon className="h-full w-full" />
                        </span>

                        <ShimmerText baseColor="#d2d2d2" shimmerColor="#ffffff" className='max-sm:text-sm max-sm:text-center max-sm:leading-[1.2]'>
                            30+ effects free, forever. No credit card.
                        </ShimmerText>
                    </p>
                </div>

            </div>
            <div
                    className='radial-glow w-screen max-sm:left-1/2 max-sm:w- h-[50vw] max-md:h-[60vh] max-sm:h-[60vh] max-md:w-[150vw] max-sm:w-[170vw] absolute bottom-[-15vw] max-sm:bottom-[-20vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0'
                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)' }}
                ></div>
        </div>
    )
}
