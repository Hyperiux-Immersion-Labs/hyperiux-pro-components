"use client"
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import {
    MotionMark,
    NextMark,
    ReactMark,
    ThreeMark,
    WebGLMark,
} from "@/utils/Icons";
import MaskTextReveal from "../mask-text-reveal";

const HeroFigure = ({ className }) => (
    <Image src="/icons/gsap-icon.svg" className={` ${className}`} width={100} height={100} alt="gsap image" />
);

const StatCard = ({
    children,
    label,
    className = "",
    contentClassName = "",
}) => {
    return (
        <div
            className={[
                "relative flex min-h-[21vw] flex-col justify-between rounded-md border border-white/20 bg-[#141312] p-[1.65vw] text-white backdrop-blur-sm",
                "max-md:min-h-[34vw]  max-md:p-5",
                "max-sm:min-h-[48vw]  max-sm:p-3",
                className,
            ].join(" ")}
        >
            <div className={contentClassName}>{children}</div>

            {label && (
                <p className="text32 leading-none font-heading text-white/90 max-md:text-[2.4vw] max-sm:text-[4vw]">
                    {label}
                </p>
            )}
        </div>
    );
};

export default function TrustStrip() {
    const paragraphText = useRef()
    useEffect(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#trust-strip",
                start: "top bottom",
                end: "bottom top",
                // markers:true,
                scrub: true
                
            }
        })
        tl.to(".strip-1", {
            yPercent: 10,
            ease: "none"
        })
        tl.to(".strip-2", {
            yPercent: -20,
            ease: "none"
        }, "<")
        tl.to(paragraphText.current,{
            yPercent:20,
            ease:'none',
        },"<")
    }, [])
    return (
        <section className="relative w-full  z-10 px-[3.5vw] py-[12vw] text-white max-md:px-[6vw] max-md:py-24 max-sm:px-[7vw] max-sm:py-20" id="trust-strip">


            <div className="relative flex max-md:flex-col justify-between w-full h-fit pr-[4vw] max-sm:pr-0 max-md:gap-14 max-sm:gap-8">
                <div className="sticky h-fit top-[12vh] max-md:static">
                    <MaskTextReveal stagger={0.08} scrub={false} duration={2} >
                        <h2 ref={paragraphText} className="max-w-[39vw] max-sm:text64 text-[4vw] font-normal text-white max-md:max-w-[95vw] max-md:w-[95vw] max-md:text-[5vw] max-sm:max-w-full max-sm:text-[5.8vw] ">
                            Give your product the perception lift of a custom interaction
                            system without commissioning one from scratch.
                        </h2>

                    </MaskTextReveal>

                </div>

                <div className="flex items-start max-md:justify-center max-sm:items-start gap-0">
                    <div className="flex flex-col max-sm:flex- w-[19vw] max-md:w-[40%] max-sm:w-[50%] strip-1">
                        <StatCard
                            label="Effects"
                            className="min-h-[24vw] max-md:min-h-[42vw] max-sm:min-h-[56vw]"
                            contentClassName="flex h-full items-start"
                        >
                            <span className="text140 font-normal font-heading leading-none text-[#ff5f00] max-md:text-[12vw] max-sm:text-[16vw]!">
                                115
                            </span>
                        </StatCard>

                        <StatCard
                            label="Effects Monthly"
                            className="-mt-px min-h-[24vw] max-md:min-h-[40vw] max-sm:min-h-[54vw]"
                            contentClassName="flex h-full items-start"
                        >
                            <span className="text140 font-normal font-heading leading-none text-[#ff5f00] max-md:text-[12vw] max-sm:text-[16vw]!">
                                New<sup>+</sup>
                            </span>
                        </StatCard>

                        <StatCard
                            label="WebGL | Three.JS"
                            className="-mt-px min-h-[24vw] max-md:min-h-[36vw] max-sm:min-h-[52vw]"
                            contentClassName="flex h-full items-start justify-between gap-[2vw] pt-[1vw]"
                        >
                            <ThreeMark className={"size-[6vw] max-md:size-[9vw] max-sm:size-[13vw]"} />
                            <WebGLMark className={"size-[6vw] max-md:size-[9vw] max-sm:size-[13vw]"} />
                        </StatCard>
                    </div>

                    <div className="translate-y-[20%] max-md:w-[40%] flex flex-col max-md:mt-8  w-[19vw] strip-2 max-sm:w-[50%]">
                        <StatCard
                            label="Free"
                            className="min-h-[24vw] max-md:min-h-[42vw] max-sm:min-h-[56vw]"
                            contentClassName="flex h-full items-start"
                        >
                            <span className="text140 font-normal font-heading leading-none text-[#ff5f00] max-md:text-[12vw] max-sm:text-[16vw]!">
                                32
                            </span>
                        </StatCard>

                        <StatCard
                            label="Motion | GSAP"
                            className="-mt-px min-h-[24vw] max-md:min-h-[36vw] max-sm:min-h-[52vw]"
                            contentClassName="flex h-full items-center justify-between pt-[1vw]"
                        >
                            <MotionMark className={"size-[5.5vw] max-md:size-[9vw] max-sm:size-[13vw]"} />
                            <HeroFigure className={"size-[5vw] max-md:size-[9vw] max-sm:size-[13vw]"} />
                        </StatCard>

                        <StatCard
                            label="React.JS | Next.JS"
                            className="-mt-px min-h-[24vw] max-md:min-h-[36vw] max-sm:min-h-[52vw]"
                            contentClassName="flex h-full items-center gap-[2vw] pt-[1vw] max-md:justify-between"
                        >
                            <ReactMark className={"size-[5vw] max-md:size-[9vw] max-sm:size-[13vw]"} />
                            <NextMark className={"size-[7vw] max-md:size-[11vw] max-sm:size-[13vw]"} />
                        </StatCard>
                    </div>
                </div>
            </div>
        </section>
    );
}
