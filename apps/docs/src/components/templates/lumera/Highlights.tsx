"use client";

import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import Image from "next/image";
import styles from "./styles.module.css";

const highlightImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop",
];

const Highlights = () => {
  return (
    <>
      <section className="pb-[7%] pt-[5%] overflow-hidden mobile:py-[15%]" id="highlights">
        <div className={`${styles["container-lg"]} mb-[4vw] flex flex-col gap-[1.5vw]`}>
          <h2 data-para-anim className={styles["title-2"]}>
            Project Highlights
          </h2>
          <div className="bg-black h-[1px] w-full lineDraw"></div>
        </div>
        <div className="w-[100vw]  h-full swipe fadeup tablet:w-[100vw] mobile:mt-[10vw] tablet:mt-[5vw]">
          <Swiper
            breakpoints={{
              320: { slidesPerView: 1.5, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 10 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
              1280: { slidesPerView: 2.5, spaceBetween: 20 },
            }}
            spaceBetween={20}
            freeMode={true}
            grabCursor={true}
            scrollbar={{ draggable: true }}
            modules={[Scrollbar, FreeMode]}
            className={`${styles["highlights-swiper"]} w-full h-[25vw] !px-[4vw] tablet:px-[6vw] mobile:px-[10vw]`}
          >
            {highlightImages.map((src, index) => (
              <SwiperSlide
                key={index}
                className="w-[40vw] h-[25vw] rounded-[2vw] overflow-hidden relative tablet:h-[70vw]"
              >
                <Image
                  src={src}
                  alt={`highlights-img-${index + 1}`}
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
};

export default Highlights;
