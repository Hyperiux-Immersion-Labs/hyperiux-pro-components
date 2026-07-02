import React from 'react'
import LinkHover from '../WebsiteComps/LinksHover';
import Button from '../WebsiteComps/Button';
import RandomBlur from '../WebsiteComps/RandomBlur';
import CircularButton from '../WebsiteComps/CirclularButton';
import { socialLinks, socialLinksList as AgencyLinks, vaultLinks } from "../../utils/Links";
import ShimmerText from '../WebsiteComps/ShimmerText';
import { UnlockIcon } from 'lucide-react';

export default function CTA2({ animations = true }) {
    return (
        <div className="self-padd z-100 h-fit  flex items-end justify-end bg-primary relative max-md:min-h-0 max-sm:py-[15vw]">
            <div className="w-full mt-[4vw] max-md:space-y-[6vw] max-sm:space-y-[8vw] h-fit relative">
                {
                    animations ? (
                        <RandomBlur
                            as="h2"
                            className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! px-[10vw] text-center"
                        >
                            Build the interaction layer your website is missing.
                        </RandomBlur>
                    ) : (
                        <h2
                            className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! px-[10vw] text-center"
                        >
                            Build the interaction layer your website is missing.
                        </h2>
                    )
                }

                <p className="text-center text24 py-[2vw]">Copy the code. Tune the motion. Ship the moment.</p>

                <div className="flex max-sm:flex-col items-center max-sm:gap-[4vw] pb-[2vw] mb-[4.5vw] max-md:mb-[15vw] relative max-sm:mb-[10vw] justify-center gap-[2vw] fadeup">
                    <Button variant='outline2' text="Install CLI" href="/docs/installation" />
                    <Button text="Work with Hyperiux" className="border border-white" target_blank href="https://www.hyperiux.com/" variant="orange" />
                    <p
                        className="shimmer-text flex items-center gap-[0.5vw] text-[#939393] leading-none max-md:justify-center max-md:gap-2 absolute bottom-[-.8vw] left-1/2 -translate-x-1/2"
                    >
                        <span className="inline-block size-[0.9vw] shrink-0 text-foreground max-md:size-3">
                            <UnlockIcon className="h-full w-full" />
                        </span>

                        <ShimmerText baseColor="#fff" shimmerColor="#ff5f00">
                            30+ effects free, forever. No credit card.
                        </ShimmerText>
                    </p>
                </div>

            </div>
        </div>
    )
}
