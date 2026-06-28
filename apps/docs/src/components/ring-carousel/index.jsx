"use client";

import { useEffect, useState } from"react";
import RingCarouselComp from "./RingCarouselComp";

export default function RingCarousel() {
 const [galleryConfig, setGalleryConfig] = useState({
 itemWidth: 720,
 itemHeight: 450,
 radius: 700,
 dragSensitivity: 0.45,
 momentum: 1.2,
 friction: 0.94,
 });

 useEffect(() => {
 const updateGalleryConfig = () => {
 const width = window.innerWidth;

 if (width <= 540) {
 setGalleryConfig({
 itemWidth: 540,
 itemHeight: 320,
 radius: 500,
 dragSensitivity: 0.5,
 momentum: 1.05,
 friction: 0.92,
 });
 return;
 }

  if (width <= 1024) {
 setGalleryConfig({
 itemWidth: 650,
 itemHeight: 450,
 radius: 600,
 dragSensitivity: 0.46,
 momentum: 1.12,
 friction: 0.935,
 });
 return;
 }

 
 setGalleryConfig({
 itemWidth: 720,
 itemHeight: 450,
 radius: 700,
 dragSensitivity: 0.45,
 momentum: 1.2,
 friction: 0.94,
 });
 };

 updateGalleryConfig();
 window.addEventListener("resize", updateGalleryConfig);

 return () => window.removeEventListener("resize", updateGalleryConfig);
 }, []);

 return (
 <section className="flex min-h-[40vh] w-full flex-col items-center justify-start overflow-hidden bg-black px-4 max-md:px-0  pb-8 max-md:pt-10 max-md:pb-8 max-sm:px-0 max-sm:pt-6 max-sm:pb-4">
 <div className="relative w-full">
 <RingCarouselComp
 items={imageItems}
 itemWidth={galleryConfig.itemWidth}
 itemHeight={galleryConfig.itemHeight}
 radius={galleryConfig.radius}
 gap={0}
 dragSensitivity={galleryConfig.dragSensitivity}
 momentum={galleryConfig.momentum}
 friction={galleryConfig.friction}
 snap={true}
 autoPlay={true}
 autoPlayInterval={800}
 pauseOnHover={true}
 />
 </div>
 </section>
 );
}

const imageItems = [
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg",
 alt: "Sticky section preview 1",
 },
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg",
 alt: "Sticky section preview 2",
 },
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg",
 alt: "Sticky section preview 3",
 },
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg",
 alt: "Sticky section preview 4",
 },
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg",
 alt: "Sticky section preview 5",
 },
 {
 src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
 alt: "Sticky section preview 6",
 },
];
