"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "./styles.module.css";
gsap.registerPlugin(ScrollTrigger);

const ShowCase = () => {
  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = videoRef.current;
            if (video && !videoLoaded) {
              video.src = "/assets/dmtca-video.mp4";
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
            trigger: "#showcase",
            start: "top 60%",
            end: "bottom bottom",
            scrub: 0.25,
          },
        });
        tl.to(".video-block", {
          width: "90vw",
          height: "40vw",
          yPercent: 30,
          right: "5%",
          ease: "power1.out",
          borderRadius: "50px",
          duration: 5,
        });
        tl.to(".inner-detail", {
          opacity: 1,
          duration: 1,
        });
      });
      return () => ctx.revert();
    }
  }, []);

  return (
    <section
      id="showcase"
      className="py-[10%] bg-white relative z-[5] tablet:pb-[15%]"
      data-scroll
      data-scroll-speed={isMobile ? undefined : "-0.3"}
    >
      <div className={`${styles["container-lg"]} h-full relative`}>
        <div className="flex w-full gap-[10vw] tablet:flex-col">
          <h2 data-para-anim className={`w-[50%] ${styles["title-2"]} tablet:w-full`}>
            A Showcase of Craft
          </h2>
          <div className="w-[25vw] h-[25vw] overflow-hidden rounded-[1000px] video-block absolute right-[10%] rtl:left-[10%] rtl:right-auto tablet:w-[90vw] tablet:h-[50vw] tablet:static tablet:rounded-[4vw]">
            <video
              ref={videoRef}
              poster="/assets/video-poster.webp"
              muted
              loop
              playsInline
              className="w-full h-full aspect-video object-cover"
            ></video>
            <div className={`w-[50vw] bg-white/50 ${styles.glassmorphism} flex justify-around rounded-full py-[2vw] absolute bottom-[7%] left-[50%] translate-x-[-50%] opacity-0 inner-detail z-[6]`}>
              <p data-para-anim>Design</p>
              <p data-para-anim>Build</p>
              <p data-para-anim>Deliver</p>
            </div>
          </div>
        </div>

        <div className="w-full h-full mt-[48vw] flex justify-end tablet:mt-[7vw]">
          <p data-para-anim className="w-[50%] tablet:w-full ">
            A look inside our process, from first sketch to final walkthrough.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShowCase;
