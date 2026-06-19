"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import ProjectCard from "../WebsiteComps/ProjectCard";
import SplitLine from "../WebsiteComps/SplitLine";
import RandomBlur from "../WebsiteComps/RandomBlur";
import Button from "../WebsiteComps/Button";
import CircularButton from "../WebsiteComps/CirclularButton";
import TextConvergence from "../WebsiteComps/TextConvergence";

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
            className="h-fit relative z-200 bg-foreground text-[#0e0e0e] py-[10vw] max-md:py-[20vw] gap-[2vw] max-md:gap-[8vw] flex flex-col w-full items-center justify-center md:hidden"
        >
            <p className="text22 text-light-grey">Agency Proof</p>

            <RandomBlur as="h2" className="text140 text-center w-[80vw] max-md:w-[90vw]">
                A public proof of how Hyperiux thinks about digital experience.
            </RandomBlur>

            <SplitLine
                delay={0.2}
                as="p"
                className="text34 text-center mt-[4vw] max-md:mt-[6vw] w-[80vw] max-md:w-[85vw]"
            >
                The Vault is a public slice of Hyperiux’s interaction design and
                creative frontend thinking - the same discipline used for premium
                websites, product experiences, SaaS landing pages, and immersive digital
                systems.
            </SplitLine>

            <div className="w-full flex justify-end max-md:justify-center px-[10vw] max-md:px-[8vw] mt-[2vw] mb-[8vw]">
                <div className="w-fit max-md:mx-auto! max-md:mt-[6vw]">
                    <Button text="Work with Hyperiux" />
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
                <div className="flex items-center justify-center gap-2 mt-[8vw]">
                    <CircularButton
                        onClick={() => swiperRef.current?.slidePrev()}
                        aria-label="Show previous project"
                        className="h-11 w-11 p-4 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                        bgColor="#ff5f00"
                    >
                        <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                    </CircularButton>
                    <CircularButton
                        onClick={() => swiperRef.current?.slideNext()}
                        aria-label="Show next project"
                        className="h-11 w-11 p-4 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                        bgColor="#ff5f00"
                    >
                        <ChevronRight className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                    </CircularButton>
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
