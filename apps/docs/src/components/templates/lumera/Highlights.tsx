// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import Image from "next/image";

import InfiniteCarouselComp from "./VaultComp/InfiniteCarousel/InfiniteCarouselComp";
import highlightImage1 from "./assets/highlights/image1.png";
import highlightImage2 from "./assets/highlights/image2.png";

const highlightImages = [highlightImage1, highlightImage2];

const highlightPlaces = [
  { distance: "5km", location: "Palm Jumeirah" },
  { distance: "10km", location: "Dubai Marina" },
  { distance: "2km", location: "Business Bay" },
  { distance: "6km", location: "Downtown Dubai" },
  { distance: "8km", location: "Burj Al Arab" },
  { distance: "12km", location: "Jumeirah Beach Residence" },
  { distance: "7km", location: "DIFC" },
  { distance: "14km", location: "Dubai Creek Harbour" },
].map((place, index) => ({
  ...place,
  img: highlightImages[index % highlightImages.length],
}));

const Highlights = () => {
  return (
    <>
      <section className="pb-[7%] pt-[5%] space-y-[6vw]! max-[1025px]:space-y-[12vw]! overflow-hidden max-md:py-[15%]" id="highlights">
        <div className={`px-[5%] max-md:px-[6%] flex flex-col gap-[1.5vw]`}>
          <h2
            data-para-anim
            className="font-heading font-medium text-[3.5vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw]"
          >
            Nearby Highlights
          </h2>
        </div>

        <div className="">
          <InfiniteCarouselComp
            draggable
            loop={false}
            showNav={false}
            showProgress
            speed={0.8}
            smoothness={9}
            pauseOnHover
            wrapperClassName="fadeup pl-[5%] pr-[5%] pb-[1vw]"
            wrapperStyle={{ gap: "1.2vw" }}
            itemClassName="cursor-grab active:cursor-grabbing"
            progressTrackClassName="mt-[3.6vw] mx-[5%] h-[0.4vw] w-[90%] max-[1025px]:h-[1.5vw] max-md:mt-[7vw] max-md:w-[90vw]"
          >
            {highlightPlaces.map((place, index) => (
              <div
                key={index}
                className="relative h-[27vw] w-[40vw] shrink-0 overflow-hidden rounded-lg max-[1025px]:h-[50vw] max-[1025px]:w-[78vw] max-md:h-[62vw] max-md:w-[84vw]"
              >
                <Image
                  src={place.img}
                  alt={place.location}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 84vw, (max-width: 1024px) 72vw, 40vw"
                  className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-0 p-[2vw] max-md:p-[5vw]">
                  <p className="text-[1.3vw] text-white/80 max-md:text-[3.2vw]">
                    <span className="font-medium text-white">{place.distance}</span> away from
                  </p>
                  <p className="font-heading font-medium uppercase text-white text-[2vw] leading-[1.1] max-md:text-[6vw]">
                    {place.location}
                  </p>
                </div>
              </div>
            ))}
          </InfiniteCarouselComp>
        </div>
      </section>
    </>
  );
};

export default Highlights;
