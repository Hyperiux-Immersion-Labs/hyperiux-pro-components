"use client";
import { DraggableMarquee } from"@/components/DraggableMarquee/DraggableMarquee";
import React from"react";

const marqueeImages = [
 {
 id: 1,
 src:"/assets/parallax-img/p-img-1.jpg",
 alt:"Image 1",
 title:"image 1",
 width: 420,
 height: 520,
 imageClassName:"w-[24vw] h-[30vw] rounded-2xl max-md:w-[40vw] max-md:h-[60vw]    object-cover",
 },
 {
 id: 2,
 src:"/assets/parallax-img/p-img-2.jpg",
 alt:"Image 2",
 title:"image 2",
 width: 420,
 height: 520,
 imageClassName:"w-[24vw] h-[30vw] rounded-2xl max-md:w-[40vw] max-md:h-[60vw]    object-cover",
 },
 {
 id: 3,
 src:"/assets/parallax-img/p-img-3.jpg",
 alt:"Image 3",
 title:"image 3",
 width: 420,
 height: 520,
 imageClassName:"w-[24vw] h-[30vw] rounded-2xl max-md:w-[40vw] max-md:h-[60vw]    object-cover",
 },
 {
 id: 4,
 src:"/assets/parallax-img/p-img-4.jpg",
 alt:"Image 4",
 title:"image 4",
 width: 420,
 height: 520,
 imageClassName:"w-[24vw] h-[30vw] rounded-2xl max-md:w-[40vw] max-md:h-[60vw]    object-cover",
 },
];
const page = () => {
 return (
 <>
 <section className="w-screen h-screen bg-black text-white flex flex-col justify-center items-center">
 <DraggableMarquee
 items={marqueeImages}
 speed={7.2}
 gapClassName="gap-[2vw] max-md:gap-[4vw]"
 className="py-10"
 itemClassName="select-none"
 />
	<div className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-white text-[1.1vw] max-md:hidden shadow-lg">
		Drag the strip left or right to reveal the scenes.
	</div>
 </section>
 </>
 );
};

export default page;
