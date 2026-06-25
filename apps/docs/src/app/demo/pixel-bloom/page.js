"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { PixelBloom } from "@/components/pixel-bloom";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
    useEffect(() => {
        // Only apply x-animation on desktop
        if (window.matchMedia("(max-width: 1025px)").matches) return;
        const ctx = gsap.context(() => {
            const boxes = gsap.utils.toArray(".curved-scroll-box");
            boxes.forEach((box, index) => {
                const isLeft = index % 2 === 0;
                const radius = window.innerWidth * 0.15;
                ScrollTrigger.create({
                    trigger: box,
                    start: "top bottom",
                    end: "bottom top",
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const theta = progress * Math.PI;
                        const xOffset = Math.sin(theta) * radius;
                        const finalX = isLeft ? -xOffset : xOffset;
                        gsap.set(box, { x: finalX });
                    },
                });
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <>
       <DemoHeader />
       <ScrollBottom textColor='text-[#111111]' />
        <section className="w-screen overflow-x-hidden bg-gray-400 max-md:h-auto max-md:flex-col max-md:p-0 h-[750vh] flex items-center justify-center relative">

            <h1 className=" text-[8vw] max-md:text-[5vw] mix-blend-difference  text-white fixed max-md:static max-md:pt-24  top-1/2 left-1/2 -translate-x-1/2 max-md:translate-x-0 max-md:top-0 max-md:left-0 max-md:translate-y-0 w-full max-sm:text-[11vw] text-center leading-[.5] -translate-y-1/2 max-md:text-white z-1">
                PIXEL BLOOM <br />
                <span className="text-[1.6vw] max-sm:text-[3vw] max-md:hidden">Glide over the images to uncover the motion.</span>
            </h1>
            <p className="max-md:block hidden max-sm:pt-10 max-md:text-[3vw]  max-sm:text-[5vw] mix-blend-difference  text-white    w-full text-center leading-relaxed   z-1">
                Click to see the effect 
                <br />
                <span className="uppercase">

                 it’s way more fun on desktop
                </span>
            </p>
            <PixelBloom className='w-[85vh] h-[50vh] absolute! top-50! left-1/2 -translate-x-1/2 z-10 aspect-video max-md:hidden' />
            <div className="h-[20vh] max-sm:h-[10vh] max-md:h-[8vh] w-full"></div>
            <div className="relative w-full flex flex-col  gap-[10vh]  items-center">
                {/* On mobile, center each image horizontally with mx-auto and remove ml/mr */}
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] rounded-[2vw] max-sm:rounded-lg overflow-clip mr-[25vw] max-md:mx-auto transform-gpu backface-hidden">
                    <PixelBloom className='w-full h-full' type='video' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel.mp4' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden ml-[25vw] max-md:mx-auto  rounded-[2vw] transform-gpu backface-hidden">
                    <PixelBloom className='w-full h-full' type='image' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden mr-[25vw] max-md:mx-auto  rounded-[2vw] transform-gpu backface-hidden">
                    <PixelBloom className='w-full h-full' type='image' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden ml-[25vw]  max-md:mx-auto rounded-[2vw] transform-gpu backface-hidden max-md:hidden max-sm:hidden">
                    <PixelBloom className='w-full h-full' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden mr-[25vw]  max-md:mx-auto rounded-[2vw] transform-gpu backface-hidden">
                    <PixelBloom className='w-full h-full' type='image' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden ml-[25vw]  max-md:mx-auto rounded-[2vw] transform-gpu backface-hidden">
                        <PixelBloom className='w-full h-full' type='image' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[70vw] overflow-hidden mr-[25vw]  max-md:mx-auto rounded-[2vw] transform-gpu backface-hidden">
                    <PixelBloom className='w-full h-full' type='image' src='https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg' />
                </div>
                <div className="curved-scroll-box size-[30vw] max-md:size-[20vw] overflow-hidden ml-[25vw]  max-md:mx-auto  rounded-[2vw] transform-gpu backface-hidden ">
                    <PixelBloom className='w-full h-full' />
                </div>
            </div>
            <div className="h-[20vh] max-md:h-0  w-full"></div>
        </section>
         </>
    );
}
