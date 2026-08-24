"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import styles from "./styles.module.css";

interface GalleryFeature {
  name: string;
  icon: string;
  image: string;
  color: string;
}

const features: GalleryFeature[] = [
  {
    name: "Architecture",
    icon: "/assets/icons/area.svg",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    color: "#E0D4C6",
  },
  {
    name: "Interiors",
    icon: "/assets/icons/beds.svg",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop",
    color: "#D8CEBF",
  },
  {
    name: "Landscape",
    icon: "/assets/icons/location.svg",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
    color: "#DED2C2",
  },
  {
    name: "Lighting",
    icon: "/assets/icons/tub.svg",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop",
    color: "#E4D9CB",
  },
];

const Gallery = () => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement>(null);

  const handleImageHover = (feature: GalleryFeature) => {
    const { image: imgSrc, color } = feature;

    if (bodyRef.current) {
      gsap.to(bodyRef.current, { backgroundColor: color, duration: 0.5 });
    }

    const previewContainer = previewContainerRef.current;
    if (!previewContainer) return;

    const currentLastImg = previewContainer.querySelector("img:last-child");

    if (currentLastImg) {
      gsap.to(currentLastImg, { duration: 1, scale: 1.2, left: "100%" });
    }

    const newImg = document.createElement("img");
    newImg.src = imgSrc;
    newImg.style.position = "absolute";
    newImg.style.left = "-100%";
    newImg.style.width = "100%";
    newImg.style.height = "100%";
    newImg.style.objectFit = "cover";

    previewContainer.appendChild(newImg);

    gsap.to(newImg, { duration: 1, left: "0%" });
  };

  const renderHeadings = () => {
    return (
      <div className="w-full mt-[10vw] grid grid-cols-2 gap-x-[42%] justify-between tablet:flex tablet:flex-col tablet:order-1 mobile:gap-[5vw] mobile:mt-[12vw] tablet:gap-0 tablet:mt-0">
        {features.map((feature, index) => (
          <div
            key={index}
            className="mb-[3vw] cursor-pointer"
            onMouseEnter={() => handleImageHover(feature)}
          >
            <div className="fadeup flex gap-[2vw] items-center mb-[0.5vw] px-[1vw] mobile:gap-[4vw] tablet:mb-[1.5vw]">
              <div className="h-[2.5vw] w-[2.5vw] mobile:w-[10vw] mobile:h-[10vw] tablet:w-[3vw] tablet:h-[3vw]">
                <div className="w-full h-full relative">
                  <Image
                    quality={100}
                    loading="lazy"
                    src={feature.icon}
                    fill
                    alt={feature.name}
                  />
                </div>
              </div>
              <h4 className="font-head uppercase text-[1.25vw] mobile:text-[4.5vw] tablet:text-[2vw]">
                {feature.name}
              </h4>
            </div>
            <div className="bg-black/40 w-full h-[1px] lineDraw"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-[8%] bg-[#E0D4C6] relative z-10 mobile:py-[20%] tablet:py-[10%]" ref={bodyRef}>
      <div className={styles["container-lg"]}>
        <h2 data-title-anim className={`${styles["title-2"]} mb-[2vw]`}>
          Studio Gallery
        </h2>
        <p data-para-anim className="w-[40%] tablet:w-full">
          A glimpse into the disciplines we bring together on every project.
        </p>
        <div className="w-full mt-[12vw] mb-[8vw] relative tablet:flex mobile:flex-col tablet:gap-[4vw]">
          {renderHeadings()}
          <div className="w-[35%] h-[45vw] z-10 overflow-hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fadeup tablet:static tablet:translate-x-0 tablet:translate-y-0 mobile:w-[90vw] mobile:h-[120vw] tablet:w-[90vw] tablet:h-[70vw]">
            <div className="w-full h-full relative overflow-hidden" ref={previewContainerRef}>
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
                alt="Image"
                fill
                quality={100}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
