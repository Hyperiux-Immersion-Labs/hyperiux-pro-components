"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import ProjectCard from "../Reusable/ProjectCard";
import SplitLine from "../Reusable/SplitLine";
import RandomBlur from "../Reusable/RandomBlur";
import Button from "../Reusable/Button";
import TextConvergence from "../Reusable/TextConvergence";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const agencyProjects = [
    {
        img: "/img/montra.png",
        title: "Montra",
        subtitle: "Branding | UI/UX Design",
        link: "https://montra.app",
    },
    {
        img: "/img/yellow.png",
        title: "Yellow",
        subtitle: "Branding | UI/UX Design",
        link: "https://welcometoyellow.com/",
    },
    {
        img: "/img/monielink.png",
        title: "Monielink",
        subtitle: "Branding | UI/UX Design",
        link: "https://monielink.io",
    },
    {
        img: "/img/yellow.png",
        title: "Yellow",
        subtitle: "Branding | UI/UX Design",
        link: "https://welcometoyellow.com/",
    },
];

export default function AgencyProofMobile() {
    const swiperRef = useRef(null);

    return (
        <section
            id="AgencyProof"
            className="h-fit relative z-200 py-[10vw] max-sm:py-[20vw] gap-[2vw] max-sm:gap-[8vw] flex flex-col w-full items-center justify-center sm:hidden"
        >
            <p className="text22 text-light-grey">Agency Proof</p>

            <RandomBlur as="h2" className="text140 text-center w-[80vw] max-sm:w-[90vw]">
                A public proof of how Hyperiux thinks about digital experience.
            </RandomBlur>

            <SplitLine
                delay={0.2}
                as="p"
                className="text34 text-center mt-[4vw] max-sm:mt-[6vw] w-[80vw] max-sm:w-[85vw]"
            >
                The Vault is a public slice of Hyperiux’s interaction design and
                creative frontend thinking - the same discipline used for premium
                websites, product experiences, SaaS landing pages, and immersive digital
                systems.
            </SplitLine>

            <div className="w-full flex justify-end max-sm:justify-center px-[10vw] max-sm:px-[8vw] mt-[2vw] mb-[8vw]">
                <div className="w-fit max-sm:mx-auto! max-sm:mt-[6vw]">
                    <Button text="Read Installation Docs" />
                </div>
            </div>

            {/* Swiper Container */}
            <div className="w-full relative py-[4vw] flex flex-col items-center">
                <div className="w-full overflow-hidden">
                    <Swiper
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        spaceBetween={20}
                        slidesPerView={"auto"}
                        centeredSlides={true}
                        loop={true}
                        className="w-full animate-fade-in"
                    >
                        {agencyProjects.map((project, idx) => (
                            <SwiperSlide key={idx} className="!w-fit flex justify-center items-center">
                                <ProjectCard
                                    project={project}
                                    idx={idx}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Custom Navigation Buttons */}
                <div className="flex gap-[4vw] justify-center  mt-[8vw]">
                    <div
                        href="#"
                        target="_self"
                        rel=""
                        onClick={(e) => {
                            e.preventDefault();
                            swiperRef.current?.slidePrev();
                        }}
                        className="p-[.5vw]  aspect-square border-foreground rounded-full border flex items-center justify-center"
                    >
                        <ChevronLeft size={32} className="text-white" />
                    </div>
                    <div
                        href="#"
                        target="_self"
                        rel=""
                        onClick={(e) => {
                            e.preventDefault();
                            swiperRef.current?.slideNext();
                        }}
                        className="p-[.5vw]  aspect-square rounded-full border border-foreground flex items-center justify-center"
                    >
                        <ChevronRight size={32} className="text-white" />
                    </div>
                </div>
            </div>

            <div className="w-full flex items-center justify-center min-h-[35vh] py-[10vw] mt-[10vw] select-none">
                <TextConvergence
                    text="Prediction is not decoration. It's a core interaction design principle."
                    className="text140 text-center w-[90vw] leading-[1.1]"
                />
            </div>
        </section>
    );
}
