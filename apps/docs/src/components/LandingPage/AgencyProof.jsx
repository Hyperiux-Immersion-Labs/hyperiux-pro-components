"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import SplitLine from "../WebsiteComps/SplitLine";
import RandomBlur from "../WebsiteComps/RandomBlur";
import TextConvergence from "../WebsiteComps/TextConvergence";
import ProjectCard from "../WebsiteComps/ProjectCard";
import Button from "../WebsiteComps/Button";

gsap.registerPlugin(ScrollTrigger, SplitText);

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
        img: "/img/montra.png",
        title: "Montra",
        subtitle: "Branding | UI/UX Design",
        link: "https://montra.app",
    },
];

export default function AgencyProof() {
    const swiperTranslateWrapper = useRef(null);
    const wrapperRef = useRef(null);
    const [scrollTween, setScrollTween] = useState(null);

    // Title/subtitle refs, project card refs, per card
    const titleRefs = useRef([]);
    const subtitleRefs = useRef([]);
    const projectRefs = useRef([]);

    // The GSAP animation architecture, all contained, correct cleanups
    useEffect(() => {
        // Ensure fonts loaded before splitting, more stable line split
        let isUnmounted = false;
        let allSplits = [];
        let ctx;

        const setup = async () => {
            await (document.fonts?.ready || Promise.resolve());

            if (isUnmounted) return;

            // Horizontal scroll: translate by precise content width
            const wrapperEl = swiperTranslateWrapper.current;
            if (!wrapperEl) return;

            ctx = gsap.context(() => {
                // --- Horizontal scroll trigger ---
                const tween = gsap.fromTo(
                    wrapperEl,
                    {
                        x: () => window.innerWidth,
                    },
                    {
                        x: () => {
                            const containerWidth = wrapperEl.scrollWidth;
                            return -containerWidth;
                        },
                        ease: "none",
                        scrollTrigger: {
                            trigger: "#SwiperDiv",
                            start: "top center",
                            end: "95% center",
                            scrub: true,
                            markers: false,
                            invalidateOnRefresh: true,
                        },
                    }
                );

                setScrollTween(tween);

                // ---- Scale animation for project cards ----

                projectRefs.current.forEach((project, idx) => {
                    if (!project) return;

                    gsap.fromTo(
                        project,
                        { scale: 0.85 },
                        {
                            scale: 1,
                            duration: 1,
                            ease: "linear",
                            scrollTrigger: {
                                trigger: project,
                                containerAnimation: tween,
                                start: "left 100%",
                                end: "left 30%",
                                scrub: true,
                                markers: false,
                            },
                        }
                    );
                });

                // ---- SplitText & scrub for titles ----

                titleRefs.current.forEach((title, idx) => {
                    if (!title) return;
                    // Mask lines for better effect
                    const split = SplitText.create(title, {
                        type: "lines",
                        mask: "lines",
                    });
                    allSplits.push(split);

                    gsap.fromTo(
                        split.lines,
                        { yPercent: 100 },
                        {
                            yPercent: 0,
                            ease: "none",
                            scrollTrigger: {
                                trigger: title,
                                containerAnimation: tween,
                                start: "left 85%",
                                end: "left 55%",
                                scrub: true,
                                //markers: true,
                            },
                        }
                    );
                });

                // ---- SplitText & scrub for subtitles ----

                subtitleRefs.current.forEach((subtitle, idx) => {
                    if (!subtitle) return;
                    const split = SplitText.create(subtitle, {
                        type: "lines",
                        mask: "lines",
                    });
                    allSplits.push(split);

                    gsap.fromTo(
                        split.lines,
                        { yPercent: 100 },
                        {
                            yPercent: 0,
                            ease: "none",
                            scrollTrigger: {
                                trigger: subtitle,
                                containerAnimation: tween,
                                start: "left 82%",
                                end: "left 52%",
                                scrub: true,
                                //markers: true,
                            },
                        }
                    );
                });
            });

            // GSAP strongly recommends this after font-ready & DOM split
            ScrollTrigger.refresh();
        };

        setup();

        return () => {
            isUnmounted = true;
            // SplitText cleanup: revert all mutated DOMs
            allSplits.forEach((s) => s && s.revert && s.revert());
            ctx && ctx.revert && ctx.revert();
            // Remove all scroll triggers to avoid leftovers
            ScrollTrigger.getAll().forEach((st) => st.kill());
            ScrollTrigger.refresh();
        };
    }, []);

    return (
        <section
            id="AgencyProof"
            className="h-fit relative z-200  py-[10vw] gap-[2vw] flex flex-col w-full items-center justify-center max-md:hidden"
        >
            <SplitLine as="p"
                className="text22 text-light-grey">
                Agency Proof
            </SplitLine>

            <RandomBlur as="h2" className="text140 text-center w-[80vw]">
                A public proof of how Hyperiux thinks about digital experience.
            </RandomBlur>

            <SplitLine
                delay={0.3}
                as="p"
                className="text34 text-center mt-[4vw] w-[80vw]"
            >
                The Vault is a public slice of Hyperiux’s interaction design and
                creative frontend thinking - the same discipline used for premium
                websites, product experiences, SaaS landing pages, and immersive digital
                systems.
            </SplitLine>
            <div className="w-full flex justify-end px-[10vw] mt-[2vw] fadeup">
                <Button text="Work with Hyperiux" />
            </div>

            <div id="SwiperDiv" className="h-[500vh] w-full relative">
                <div className="w-full flex sticky top-[10vw] h-fit gap-[2.5vw] items-end mt-[4vw] flex-col overflow-hidden">
                    <div
                        ref={wrapperRef}
                        className="w-full flex h-fit items-center gap-[2vw] relative"
                    >
                        <div
                            ref={swiperTranslateWrapper}
                            className="flex h-full w-full gap-[2vw] items-center relative"
                        >
                            {/* Floating cursor per card */}
                            {agencyProjects.map((project, idx) => (
                                <ProjectCard
                                    key={idx}
                                    project={project}
                                    idx={idx}
                                    projectRef={(el) => (projectRefs.current[idx] = el)}
                                    titleRef={(el) => (titleRefs.current[idx] = el)}
                                    subtitleRef={(el) => (subtitleRefs.current[idx] = el)}
                                />
                            ))}

                            <div className="w-[310vw] flex items-center justify-center h-full shrink-0">
                                <TextConvergence
                                    text="Prediction is not decoration. It's a core interaction design principle."
                                    containerAnimation={scrollTween}
                                    className="text180"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
