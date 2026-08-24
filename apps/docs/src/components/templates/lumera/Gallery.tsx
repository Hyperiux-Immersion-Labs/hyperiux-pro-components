"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import gsap from "gsap";
import Image, { StaticImageData } from "next/image";

import squareIcon from "./assets/icons/square.svg";
import masterLivingRoomIcon from "./assets/icons/master-living-room.svg";
import privateStudyIcon from "./assets/icons/private-study.svg";
import waterPavilionIcon from "./assets/icons/water-pavilion.svg";
import spaIcon from "./assets/icons/spa.svg";
import sunkenSunIcon from "./assets/icons/sunken-sun.svg";
import beachLoungeIcon from "./assets/icons/beach-lounge.svg";
import poolAndBeachIcon from "./assets/icons/pool-and-beach.svg";
import privateBeachIcon from "./assets/icons/private-beach.svg";
import entranceLobby from "./assets/icons/entrance-lobby.svg";
import featureStaircase from "./assets/icons/feature-staircase.svg"

interface GalleryFeature {
  name: string;
  icon: StaticImageData;
  image: string;
  color: string;
}

const leftFeatures: GalleryFeature[] = [
  {
    name: "Entrance Lobby",
    icon: entranceLobby,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    color: "#E5DCCF",
  },
  {
    name: "Feature Staircase",
    icon: featureStaircase,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
    color: "#E0D4C6",
  },
  {
    name: "Private Master Living Room",
    icon: masterLivingRoomIcon,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop",
    color: "#DED2C2",
  },
  {
    name: "Private Study / Cigar Bar",
    icon: privateStudyIcon,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop",
    color: "#E4D9CB",
  },
  {
    name: "Water Pavilion",
    icon: waterPavilionIcon,
    image: "https://images.unsplash.com/photo-1600607687644-c7f34b5063c8?q=80&w=1600&auto=format&fit=crop",
    color: "#DDD1C0",
  },
];

const rightFeatures: GalleryFeature[] = [
  {
    name: "Spa",
    icon: spaIcon,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1600&auto=format&fit=crop",
    color: "#E2D7C8",
  },
  {
    name: "Sunken Sun Bed Deck",
    icon: sunkenSunIcon,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop",
    color: "#E6DCCE",
  },
  {
    name: "Beach Lounge & Fireplace",
    icon: beachLoungeIcon,
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=1600&auto=format&fit=crop",
    color: "#DFD3C3",
  },
  {
    name: "Pool & Beach Shower",
    icon: poolAndBeachIcon,
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop",
    color: "#E3D8CA",
  },
  {
    name: "Private Beach",
    icon: privateBeachIcon,
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1600&auto=format&fit=crop",
    color: "#E7DDD0",
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

  const renderColumn = (columnFeatures: GalleryFeature[]) => {
    return (
      <div className="flex flex-col gap-[3vw] w-full max-[1025px]:gap-[4vw]">
        {columnFeatures.map((feature, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onMouseEnter={() => handleImageHover(feature)}
          >
            <div className="fadeup flex gap-[2vw]  items-center pb-[1vw] max-md:gap-[4vw] max-[1025px]:pb-[1.5vw]">
              <div className="h-[2.6vw] w-[2.6vw] shrink-0 max-md:w-[9vw] max-md:h-[9vw] max-[1025px]:w-[3.5vw] max-[1025px]:h-[3.5vw]">
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
              <h4 className="font-head uppercase text-[1.25vw] tracking-wide max-md:text-[3.8vw] max-[1025px]:text-[2.2vw]">
                {feature.name}
              </h4>
            </div>
            <div className="bg-black/20 w-full h-px lineDraw"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-[5%] bg-[#E0D4C6] relative z-10 max-md:py-[10%] max-[1025px]:py-[7%]" ref={bodyRef}>
      <div className="px-[5%] max-md:px-[6%]">
        <h2
          data-title-anim
          className={`font-heading font-medium text-[3.9vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw] mb-[2vw]`}
        >
          Core Features
        </h2>
        <p data-para-anim className="w-[40%] max-md:py-[3vw] max-[1025px]:text-[3.5vw] text-[1.25vw] tracking-wide max-[1025px]:w-full">
          The interiors of Lumera Heights reflect a refined balance of modern luxury and functional elegance.
        </p>
        <div className="w-full mt-[6vw]  mb-[2vw] relative flex items-start justify-between gap-[3vw] max-[1025px]:flex-col max-md:gap-[4vw]">
          <div className="w-[27%] my-auto max-[1025px]:w-full max-[1025px]:order-1">{renderColumn(leftFeatures)}</div>

          <div className="w-[33%] h-[45vw] shrink-0 z-10 overflow-hidden relative fadeup max-[1025px]:static max-[1025px]:w-full max-md:w-full max-md:h-[120vw] max-[1025px]:h-[70vw] max-[1025px]:order-0">
            <div className="w-full h-full relative overflow-hidden" ref={previewContainerRef}>
              <Image
                src={leftFeatures[0].image}
                alt="Core feature preview"
                fill
                quality={100}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="w-[27%] my-auto max-[1025px]:w-full max-[1025px]:order-2">{renderColumn(rightFeatures)}</div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
