import React from "react";
import ScrollFrameSlider from "./FrameSlider";


const FrameSlider = () => {
  return (
    <>
 

    <div className="min-h-screen">
      <ScrollFrameSlider images={images} bgColor="#111111" />
    </div>
      
    </>
  );
};

export default FrameSlider;

const images = [
  "/assets/nature/nature01.png",
  "/assets/nature/nature02.png",
  "/assets/nature/nature03.png",
  "/assets/nature/nature04.png",
  "/assets/nature/nature05.png",
  "/assets/nature/nature06.png",
];
