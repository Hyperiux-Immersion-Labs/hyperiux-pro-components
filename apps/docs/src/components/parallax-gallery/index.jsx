import React from "react";
import ScrollParallaxGallery from "./ParallaxGallery";


const ParallaxGallery = () => {
  return (
    <>
 

    <div className="min-h-screen">
      <ScrollParallaxGallery images={images} bgColor="#111111" />
    </div>
      
    </>
  );
};

export default ParallaxGallery;

const images = [
  "/assets/nature/nature01.png",
  "/assets/nature/nature02.png",
  "/assets/nature/nature03.png",
  "/assets/nature/nature04.png",
  "/assets/nature/nature05.png",
  "/assets/nature/nature06.png",
];
