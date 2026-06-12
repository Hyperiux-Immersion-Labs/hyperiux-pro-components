'use client'
import { useEffect, useRef } from "react";
import Button from "../Reusable/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const agencyProjects = [
    {
        title: "Yellow",
        subtitle: "Branding | UI/UX Design"
    },
    {
        title: "Yellow",
        subtitle: "Branding | UI/UX Design"
    },
    {
        title: "Yellow",
        subtitle: "Branding | UI/UX Design"
    },
    {
        title: "Montra",
        subtitle: "Branding | UI/UX Design"
    },
];

export default function AgencyProof() {
    const swiperTranslateWrapper = useRef(null);

    useEffect(() => {
        gsap.set(swiperTranslateWrapper.current, { xPercent: 100 })

        const tl = gsap.timeline()
        tl.to(swiperTranslateWrapper.current, {
            xPercent: -270,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: "#SwiperDiv",
                start: "top center",
                end: "100% center",
                scrub: true,
                markers: false,
            }
        })
    }, [])

    return (
        <section
            id="FreeVault"
            className="h-fit py-[10vw]! gap-[2vw] flex-col w-full flex items-center justify-center"
        >
            <p className="text22 text-light-grey">Agency Proof</p>
            <h2 className="text140  text-center w-[80vw]">
                A public proof of how Hyperiux thinks about digital experience.
            </h2>
            <p className="text34 text-center mt-[4vw] w-[80vw]">
                The Vault is a public slice of Hyperiux’s interaction design and creative frontend thinking - the same discipline
                used for premium websites, product experiences, SaaS landing pages, and immersive digital systems.
            </p>
            <div id="SwiperDiv" className="h-[500vh] w-full relative">

                <div className="w-full flex sticky top-[5vw] h-fit  gap-[2.5vw] items-end mt-[4vw] flex-col ">
                    <div className="w-fit self-padd mr-[1vw]">
                        <Button text="Read Installation Docs" href="/effects" />
                    </div>
                    <div className="w-full  flex h-[60vh] items-center gap-[2vw]">

                        {/* TRANSLATE DIV */}
                        <div ref={swiperTranslateWrapper} className="flex  h-full w-full gap-[2vw] items-center">
                            {agencyProjects.map((project, idx) => (
                                <div key={idx} className="w-[60vw] shrink-0 h-full space-y-[2vw] ">
                                    <div className="w-full h-full rounded-md bg-neutral-200"></div>
                                    <div className="h-fit ">
                                        <p className="text32">{project.title}</p>
                                        <p className="text24">{project.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                            {/* TEXT DIV */}
                            <div className="w-[120vw] flex items-center justify-center h-full shrink-0">
                                <h2 className="text180">Prediction is not decoration</h2>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </section>
    );
}
