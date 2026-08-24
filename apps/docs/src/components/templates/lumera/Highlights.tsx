"use client";

import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import Image from "next/image";

const highlightPlaces = [
  {
    img: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1600&auto=format&fit=crop",
    distance: "5km",
    location: "Palm Jumeirah",
  },
  {
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
    distance: "10km",
    location: "Dubai Marina",
  },
  {
    img: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1600&auto=format&fit=crop",
    distance: "2km",
    location: "Business Bay",
  },
  {
    img: "https://images.unsplash.com/photo-1518990609874-1c98c8d84a52?q=80&w=1600&auto=format&fit=crop",
    distance: "6km",
    location: "Downtown Dubai",
  },
  {
    img: "https://images.unsplash.com/photo-1580996452196-abe95c3c5d2c?q=80&w=1600&auto=format&fit=crop",
    distance: "8km",
    location: "Burj Al Arab",
  },
  {
    img: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1600&auto=format&fit=crop",
    distance: "12km",
    location: "Jumeirah Beach Residence",
  },
  {
    img: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=1600&auto=format&fit=crop",
    distance: "7km",
    location: "DIFC",
  },
  {
    img: "https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?q=80&w=1600&auto=format&fit=crop",
    distance: "14km",
    location: "Dubai Creek Harbour",
  },
];

const Highlights = () => {
  return (
    <>
      <section className="pb-[7%] pt-[5%] overflow-hidden mobile:py-[15%]" id="highlights">
        <div className={`px-[5%] mb-[2.5vw] flex flex-col gap-[1.5vw]`}>
          <h2
            data-para-anim
            className="font-heading font-medium text-[3.2vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw]"
          >
            Nearby Highlights
          </h2>
        </div>
        <div
          className={`w-screen h-full mt-[5vw] swipe fadeup tablet:w-[100vw] mobile:mt-[10vw] tablet:mt-[5vw] [&_.swiper-scrollbar]:!bg-[#e5e5e5] [&_.swiper-scrollbar]:!rounded-full [&_.swiper-scrollbar]:!h-[0.35vw] [&_.swiper-scrollbar-drag]:!bg-black [&_.swiper-scrollbar-drag]:!rounded-full`}
        >
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
            className={`pb-[3vw]! overflow-visible! w-full h-[25vw] !px-[4vw] tablet:px-[6vw] mobile:px-[10vw]`}
          >
            {highlightPlaces.map((place, index) => (
              <SwiperSlide
                key={index}
                className="w-[40vw] h-[25vw] rounded-[2vw] overflow-hidden relative tablet:h-[70vw]"
              >
                <Image
                  src={place.img}
                  alt={place.location}
                  fill
                  className="object-cover hover:scale-110 transition-all ease-in-out duration-500"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 p-[1.8vw] mobile:p-[5vw]">
                  <p className="text-[1.1vw] text-white/80 mobile:text-[3.2vw]">
                    <span className="font-semibold text-white">{place.distance}</span> away from
                  </p>
                  <p className="font-heading uppercase text-white text-[2.2vw] leading-[1.1] mobile:text-[6vw]">
                    {place.location}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default Highlights;
