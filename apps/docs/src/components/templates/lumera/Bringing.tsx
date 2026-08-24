"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import BlackButton from "./BlackButton";

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
              video.src = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/VaultVideos/carousels/arc-flow-carousel.mp4";
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
          xPercent: -140,
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
      <div className={`px-[5%] w-full h-full py-[10%] relative max-md:py-[20%] max-[1025px]:py-[10%]`}>
        <div className="flex flex-col items-center justify-center w-full h-full gap-[5vw]">
          <div className="flex flex-col items-center justify-center">
            <div className="text1">
              <p className={`text-[9vw] font-medium text-[#353430] leading-[1.1] font-heading uppercase max-[1025px]:leading-[1.3] max-[1025px]:text-[9vw]`}>
                Better Way To
              </p>
            </div>
            <div className="w-full h-full flex justify-center gap-[3vw] text2">
              <p className={`text-[9vw] font-medium text-[#353430] leading-[1.1] font-heading uppercase max-[1025px]:leading-[1.3] max-[1025px]:text-[9vw]`}>
                Experience
              </p>
              <div className="h-full w-[20vw] relative rounded-lg max-[1025px]:absolute max-md:top-[30%] max-[1025px]:w-[90vw] max-[1025px]:top-[35%]">
                <div className="w-[20vw] h-[10vw] absolute z-100 top-0 rounded-lg overflow-hidden video max-[1025px]:w-[90vw] max-md:h-[70vw] max-[1025px]:h-[50vw]">
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
            <div className="text3 relative z-[-1] max-[1025px]:z-1">
              <p className={`text-[9vw] font-medium text-[#353430] leading-[1.1] font-heading uppercase max-[1025px]:leading-[1.3] max-[1025px]:text-[9vw]`}>
                Dubai Property
              </p>
            </div>
          </div>
          <div className="w-[60%] max-[1025px]:py-[8vw]  mt-0 max-md:mt-[85vw] max-[1025px]:w-full max-[1025px]:mt-[55vw] flex flex-col items-center gap-[2.5vw]">
            <p className={`font-body text-[1.2vw] max-[1025px]:text-[3.5vw] text-center text-4`}>
              We look beyond the listing to understand what makes a property worth considering — from its location and layout to its condition, positioning and long-term relevance. The result is a more focused property journey, built around better information and fewer distractions.
            </p>
            <div className="text-4 max-md:pt-4">
              <BlackButton
                btnText="Speak With an Advisor"
                link="#"
                className="bg-[#1c1b1a]"
                borderColor="#1c1b1a"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bringing;
