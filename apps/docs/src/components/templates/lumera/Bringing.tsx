"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./styles.module.css";

gsap.registerPlugin(ScrollTrigger);

const Bringing = () => {
  const BringingRef = useRef<HTMLElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = videoRef.current;
            if (video && !videoLoaded) {
              video.src = "/videos/bringing.mp4";
              video.load();
              video.play();
              setVideoLoaded(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const videoElement = videoRef.current;
    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => {
      if (videoElement) observer.unobserve(videoElement);
    };
  }, [videoLoaded]);

  useEffect(() => {
    if (globalThis.innerWidth > 1024) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: BringingRef.current,
            pin: true,
            start: "top top",
            end: "+=2000 bottom",
            scrub: 0.5,
          },
          defaults: {
            ease: "none",
          },
        });
        tl.to(".video", {
          scale: 4,
          xPercent: -105,
          yPercent: -30,
          delay: 0.35,
          position: "absolute",
          duration: 5,
        }).from(".text-4", {
          y: 50,
          opacity: 0,
          duration: 1,
        });
        gsap.from(".text1", {
          xPercent: 120,
          duration: 3,
          scrollTrigger: {
            trigger: BringingRef.current,
            scrub: 0.5,
            start: "top 80%",
            end: "bottom bottom",
          },
          ease: "power2.inout",
        });
        gsap.from(".text2", {
          xPercent: -120,
          duration: 4,
          scrollTrigger: {
            trigger: BringingRef.current,
            scrub: 0.5,
            start: "top 80%",
            end: "bottom bottom",
          },
          ease: "power2.inout",
        });
        gsap.from(".text3", {
          xPercent: 120,
          duration: 5,
          scrollTrigger: {
            trigger: BringingRef.current,
            scrub: 0.5,
            start: "top 80%",
            end: "bottom bottom",
          },
          ease: "power2.inout",
        });
      });
      return () => ctx.revert();
    }
  });

  return (
    <section id="bringing" className="overflow-hidden bg-white" ref={BringingRef}>
      <div className={`${styles["container-lg"]} w-full h-full py-[10%] relative mobile:py-[20%] tablet:py-[10%]`}>
        <div className="flex flex-col items-center justify-center w-full h-full gap-[5vw]">
          <div className="flex flex-col items-center justify-center">
            <div className="text1">
              <p className={`text-[10.5vw] text-[#353430] leading-[1.1] ${styles["text-head"]} uppercase tablet:leading-[1.3] tablet:text-[9vw]`}>
                Bringing
              </p>
            </div>
            <div className="w-full h-full flex justify-center gap-[3vw] text2">
              <p className={`text-[10.5vw] text-[#353430] leading-[1.1] ${styles["text-head"]} uppercase tablet:leading-[1.3] tablet:text-[9vw]`}>
                Ideas
              </p>
              <div className="h-full w-[20vw] relative rounded-[20px] tablet:absolute mobile:top-[27%] tablet:w-[90vw] tablet:top-[35%]">
                <div className="w-[20vw] h-[10vw] absolute z-[100] top-0 rounded-xl overflow-hidden video tablet:w-[90vw] mobile:h-[70vw] tablet:h-[50vw]">
                  <video
                    ref={videoRef}
                    poster="/assets/video-poster-2.webp"
                    muted
                    loop
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-500`}
                  />
                </div>
              </div>
            </div>
            <div className="text3 relative z-[-1] tablet:z-[1]">
              <p className={`text-[10.5vw] text-[#353430] leading-[1.1] ${styles["text-head"]} uppercase tablet:leading-[1.3] tablet:text-[9vw]`}>
                To Life
              </p>
            </div>
          </div>
          <div className="w-[70%] mt-[0vw] mobile:mt-[85vw] tablet:w-full tablet:mt-[55vw]">
            <p className={`${styles["text-body"]} text-center tablet:text-start text-4`}>
              We turn early sketches into fully realized spaces, staying close to the original vision at every step.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bringing;
