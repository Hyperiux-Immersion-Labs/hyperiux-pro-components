'use client'
import  { useEffect, useRef } from"react";
import Link from "next/link";
import { gsap } from"gsap";
import { ScrollTrigger } from"gsap/dist/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const CircularSliderComp = ({ heading, para, data = [] }) => {
 const outerRef = useRef(null);
 const wheelRef = useRef(null);
 const reducedMotion = usePrefersReducedMotion();

 useEffect(() => {
 const ctx = gsap.context(() => {
 const wheel = wheelRef.current;
 const cards = gsap.utils.toArray(".wheel-card");

 const setup = () => {
 const radius = wheel.offsetWidth / 1.1;
 const center = wheel.offsetWidth / 2;
 const total = cards.length;
 const slice = (0.58 * Math.PI) / total;

 cards.forEach((item, i) => {
 const angle = i * slice;
 const x = center + radius * Math.sin(angle);
 const y = center - radius * Math.cos(angle);

 gsap.set(item, {
 rotation: `${angle}_rad`,
 xPercent: -50,
 yPercent: -50,
 x,
 y,
 });
 });
 };

 setup();
 window.addEventListener("resize", setup);

 gsap.to(wheel, {
 rotate: -87,
 ease:"none",
 scrollTrigger: {
 trigger: outerRef.current,
 start:"top top",
 end:"+=1500 top",
 scrub: 0.25,
 invalidateOnRefresh: true,
 },
 });

 return () => {
 window.removeEventListener("resize", setup);
 };
 }, outerRef);

 return () => ctx.revert();
 }, []);

 return (
 <>

 <section
 ref={outerRef}
 className="max-md:hidden relative h-[250vh]"
 >
 <div
 className="sticky top-0 h-screen flex flex-col items-center justify-between pb-[3%] overflow-hidden"
 >
 <div className="w-full flex justify-center pt-[6%] ">
 <h1 className="text-[2.5vw] uppercase tracking-widest text-center">
 {heading}
 </h1>
 </div>

 {/* Wheel */}
 <div className="absolute top-[65vw] w-full h-screen">
 <div
 ref={wheelRef}
 className="absolute flex items-center justify-center top-0 left-[49%] -translate-x-1/2 w-screen h-[100vw] max-w-[125vw] max-h-[125vw]"
 >
 {data.map((product, i) => (
 <div
 key={i}
 className="wheel-card absolute top-0 left-0"
 style={{ width:"23vw", height:"26vw" }}
 >
 <SliderCard
 heading={product.heading}
 text={product.text}
 link={product.link}
 bgColor={product.bgColor}
 textColor={product.textColor}
 />
 </div>
 ))}
 </div>
 </div>

 <div className="w-full flex justify-center pb-[2%]">
 <p className="font-light uppercase tracking-widest text-[2.2vw] text-center">
 {para}
 </p>
 </div>
 </div>
 </section>

 {/* Mobile / Tablet */}
 <section className="hidden max-md:block py-[16vw] max-sm:py-[22vw] px-[5vw]">
 <h2 className="text-center max-md:text-[4vw] max-sm:text-[7vw] font-extralight uppercase tracking-widest mb-[10vw]">
 {heading}
 </h2>
 <div className="flex flex-col items-center gap-[5vw] max-sm:gap-[10vw]">
 {data.map((product, i) => (
 <div
 key={i}
 className="w-[85vw] max-md:w-full rounded-[5vw] overflow-hidden"
 >
 <SliderCard
 heading={product.heading}
 text={product.text}
 link={product.link}
 bgColor={product.bgColor}
 textColor={product.textColor}
 />
 </div>
 ))}
 </div>
 <p className="text-center font-light uppercase tracking-widest max-md:text-[2.5vw] max-sm:text-[6vw] mt-[10vw]">
 {para}
 </p>
 </section>

 {reducedMotion && (
 <div
 aria-live="polite"
 className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
 >
 <h2 className="text-[clamp(1.25rem,3vw,2rem)] leading-none text-[#111111]">
 This effect can&apos;t be reduced.
 </h2>
 <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
 Reduced motion is enabled, but this effect relies on continuous
 scroll-driven rotation around the wheel, and can&apos;t be
 simplified to a fade without losing the effect entirely.
 </p>
 </div>
 )}
 </>
 );
};

export default CircularSliderComp;


const SliderCard = ({ heading, text, link, bgColor, textColor }) => {
 const cardContent = (
 <div
 className="w-full h-full max-md:h-auto rounded-[1.5vw] max-md:rounded-[5vw] max-sm:rounded-2xl flex flex-col items-stretch justify-between gap-10 max-md:gap-8 max-sm:gap-6 hover:shadow-xl transition-all duration-500 px-[10%] max-md:px-[8%] max-sm:px-6 py-20 max-md:py-12 max-sm:py-10"
 style={{
 backgroundColor: bgColor ||"rgba(255,255,255,0.7)",
 color: textColor ||"inherit",
 }}
 >
 <div className="flex flex-col items-center gap-4 max-sm:gap-4 justify-center">
 <h2
 className="text-center font-medium text-[1.8vw] max-md:text-3xl max-sm:text-2xl uppercase"
 style={{ color: textColor ||"inherit" }}
 >
 {heading}
 </h2>
 <p
 className="text-[1.15vw] max-sm:text-lg max-md:text-xl text-center mt-[0.5vw] max-sm:mt-1"
 style={{ color: textColor ||"inherit" }}
 >
 {text}
 </p>
 </div>

 <div className="mt-[1vw] max-sm:mt-2 flex items-center cursor-pointer justify-center gap-[0.5vw] max-sm:gap-2 group/btn">
 <span
 className="text-[1vw] max-sm:text-xs max-md:text-lg uppercase tracking-widest"
 style={{ color: textColor ||"inherit" }}
 >
 See More
 </span>
 <ArrowRight />
 </div>
 </div>
 );

 if (!link) {
 return cardContent;
 }

 return (
 <Link prefetch={false} href={link} className="block w-full h-full max-md:h-auto">
 {cardContent}
 </Link>
 );
 };
