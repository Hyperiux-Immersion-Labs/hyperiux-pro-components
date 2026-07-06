import React, { useRef } from 'react'
import gsap from 'gsap'
import { TextFillAnimation } from '../WebsiteComps/TextFillAnimation'
import CodeBlockWorkflow from './CodeBlockWorkFlow'
import Link from 'next/link'
import RandomBlur from '../WebsiteComps/RandomBlur'
import ShimmerText from '../WebsiteComps/ShimmerText'

const Solution = () => {
    const underlineRef = useRef(null);
    const isAnimating = useRef(false);

    const handleLinkEnter = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        const el = underlineRef.current;
        if (!el) return;
        gsap.timeline({ onComplete: () => { isAnimating.current = false; } })
            .to(el, { scaleX: 0, transformOrigin: "right center", duration: 0.3, ease: "power2.in" })
            .to(el, { scaleX: 1, transformOrigin: "left center", duration: 0.3, ease: "power2.out" });
    };

    return (
        <section className='w-full h-fit px-[3vw] py-[10%]' id='solution'>
            <RandomBlur as="h2" className="text110 w-full text-center">
                Vault is That Layer - <span className='text-[#ff5f00]'>Installable</span>
            </RandomBlur>

            <div className='w-full h-fit flex justify-center items-center max-md:my-15 max-sm:my-[15vw]'>
                <TextFillAnimation
                    text="Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client
                    launches. Preview the moment you need, install it with one command, then tune it in your own repo.
                    It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own."
                    textSize="4vw"
                    textWidth="100%"
                    textColor="#ffffff"
                    primaryColor='#ff5f00'
                    dimColor="#272727"
                    id="hero-break"
                    containerClassName="text-start"
                    mobileTextSize="8vw"
                    mobileTextWidth="92%"
                    tabletTextSize='6vw'
                    tabletTextWidth='88%'
                />

            </div>
            <div className='w-full h-fit px-[2vw]' id="code-block">
                {/* <Image src={"/assets/homepage/code-blocks.png"} alt='code block' className='w-full h-full object-contain' width={1920} height={1080}/> */}
                <CodeBlockWorkflow />

                <div className='flex w-full justify-end max-md:justify-center mt-[2vw] max-md:mt-0'>
                    <div className="pl-[0.65vw] text18 max-sm:leading-[1.4] max-md:text-center leading-relaxed text-white/62 max-md:pl-0 max-md:text-sm! ">
                        <ShimmerText baseColor="#939393" shimmerColor="#ffffff">
                            That’s the whole workflow. The files land in your project. You
                            change anything you want.{" "}
                        </ShimmerText>
                        <Link href={"/effects"} className="relative text-white group w-fit inline-block" onMouseEnter={handleLinkEnter}>
                        <div className="flex items-center gap-[.5vw] w-fit cursor-pointer">

                            <span className="relative overflow-hidden inline-flex h-[1.3em]">
                                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">See How it Works</span>
                                <span className="inline-block absolute left-0 top-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">See How it Works</span>
                            </span>

                            <svg className="transition-transform duration-300 group-hover:translate-y-[3px] size-2" width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.24036 7.72066C8.30902 7.64697 8.39182 7.58787 8.48382 7.54688C8.57582 7.50589 8.67513 7.48384 8.77583 7.48207C8.87654 7.48029 8.97656 7.49882 9.06995 7.53654C9.16334 7.57426 9.24817 7.6304 9.31939 7.70162C9.39061 7.77284 9.44676 7.85767 9.48448 7.95106C9.5222 8.04445 9.54072 8.14448 9.53895 8.24518C9.53717 8.34588 9.51513 8.4452 9.47414 8.5372C9.43314 8.6292 9.37404 8.712 9.30035 8.78066L5.30035 12.7807C5.15973 12.9211 4.9691 13 4.77035 13C4.5716 13 4.38098 12.9211 4.24035 12.7807L0.240354 8.78066C0.166667 8.712 0.107565 8.6292 0.0665735 8.5372C0.0255818 8.4452 0.00354045 8.34588 0.00176376 8.24518C-1.2927e-05 8.14448 0.0185113 8.04445 0.0562319 7.95106C0.0939526 7.85767 0.150098 7.77284 0.221317 7.70162C0.292535 7.6304 0.377369 7.57426 0.470758 7.53654C0.564147 7.49882 0.664174 7.48029 0.764877 7.48207C0.86558 7.48384 0.964894 7.50589 1.05689 7.54688C1.14889 7.58787 1.23169 7.64697 1.30035 7.72066L4.02035 10.4407L4.02036 0.750659C4.02036 0.551747 4.09937 0.360981 4.24003 0.220329C4.38068 0.0796762 4.57144 0.000659508 4.77036 0.000659526C4.96927 0.000659543 5.16003 0.0796762 5.30069 0.220329C5.44134 0.360982 5.52036 0.551747 5.52036 0.75066L5.52035 10.4407L8.24036 7.72066Z" fill="white" />
                            </svg>
                        </div>

                            <div ref={underlineRef} className="w-full absolute left-0 bottom-[-20%]  h-px bg-white bottom-underline" />
                        </Link>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Solution