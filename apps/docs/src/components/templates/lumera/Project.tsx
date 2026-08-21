"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from "react";
import Image from "next/image";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import BlackButton from "./BlackButton";
import styles from "./styles.module.css";

gsap.registerPlugin(ScrollTrigger);

const interiorImages = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
];

export default function Project() {
  useEffect(() => {
    if (globalThis.innerWidth > 1024) {
      const ctx = gsap.context(() => {
        const body = document.body;
        const changeBodyColor = (color: string) => {
          gsap.to(body, {
            backgroundColor: color,
            duration: 1,
            ease: "power2.out",
          });
        };

        ScrollTrigger.create({
          trigger: "#project",
          start: "top 60%",
          end: "bottom 20%",
          onEnter: () => changeBodyColor("#ffffff"),
          onLeaveBack: () => changeBodyColor("#1C1B1A"),
        });
      });
      return () => ctx.revert();
    }
  });

  return (
    <>
      <section id="project" className="pt-[10%] pb-[20%] mobile:pt-[20%] mobile:pb-[10%] tablet:py-[10%] w-screen overflow-hidden">
        <div className={styles["container-lg"]}>
          <h2 data-para-anim className={styles["title-2"]}>
            Recent Projects
          </h2>
          <div className="w-full h-[1px] bg-black/30 my-[4vw] lineDraw mobile:my-[8vw] tablet:my-[5vw]"></div>
          <div className="w-full flex justify-end mb-[5vw]">
            <div className="w-[75%] flex justify-between px-[2vw] tablet:w-full tablet:flex-col tablet:gap-[7vw]">
              <div className="fadeup tablet:order-1">
                <BlackButton btnText="View All Projects" link={"#"} />
              </div>
              <p data-para-anim className="w-[60%] tablet:w-full">
                A curated selection of interiors that pair restraint with warmth.
              </p>
            </div>
          </div>
        </div>
        <div className="w-[70%] ml-auto rtl:mr-auto rtl:ml-0 h-full swipe fadeup tablet:w-[100vw] mobile:mt-[15vw] tablet:mt-[5vw]">
          <Swiper
            slidesPerView={1.5}
            spaceBetween={20}
            freeMode={true}
            grabCursor={true}
            scrollbar={{ draggable: true }}
            modules={[Scrollbar, FreeMode]}
            className="mySwiper w-full tablet:!px-[5vw] mobile:!px-[5vw]"
          >
            {interiorImages.map((src, index) => (
              <SwiperSlide
                key={index}
                className="w-[40vw] h-[30vw] rounded-[2vw] overflow-hidden relative tablet:h-[70vw]"
              >
                <Image
                  src={src}
                  alt={`interior-img-${index + 1}`}
                  fill
                  className="object-cover hover:scale-110 transition-all ease-in-out duration-500"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
}
