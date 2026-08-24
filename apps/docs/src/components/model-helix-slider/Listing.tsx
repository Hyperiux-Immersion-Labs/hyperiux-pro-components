"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import data from "./data";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { ReactLenis } from "lenis/react";
import * as THREE from "three";
import { HyperiuxGlassHeroModel } from "./MyModel";

const ListingLoco = () => {
  const text = "hyperiux-labs";
  const groupRef = useRef<THREE.Group>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Split text animation
  useEffect(() => {
    const chars = document.querySelectorAll(".hero-text");
    if (chars.length > 0) {
      gsap.fromTo(
        chars,
        {
          y: "100%",
        },
        {
          y: 0,
          duration: 0.8,
          delay: 0,
          ease: "power2.inOut",
          stagger: 0.04,
        }
      );
    }
  }, []);

  // Drive 3D rotation using the page scroll (Lenis/native scroll),
  // normalized to 0..1 across the full document scroll range.
  useEffect(() => {
    const update = () => {
      const maxScroll = Math.max(
        1,
        (document.documentElement?.scrollHeight || 0) - window.innerHeight
      );
      const next = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
      setScrollOffset(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <section
        className="w-screen h-fit min-h-[100dvh] overflow-hidden relative bg-black"
        id="new-listing"
      >
        <div className="h-screen w-full fixed z-1 top-0 left-0 ">
          <Canvas camera={{ position: [0, 0, 35], fov: 22 }}>
            <Environment preset="studio" environmentIntensity={0.5} />
            <ambientLight intensity={10} />
            <spotLight
              position={[3.87, -3.73, 1.93]}
              intensity={10.0}
              angle={0.22}
              distance={20.0}
              penumbra={1.0}
              decay={0.0}
              color="#000FFF"
            />
            <group ref={groupRef}>
              <HyperiuxGlassHeroModel
                scrollOffset={scrollOffset}
                enableScrollMove={false}
                scale={0.12}
                thickness={0.5}
                position={[0, 0, 1.4]}
              />
            </group>
          </Canvas>
        </div>
        <div className="w-full h-fit relative z-[5]">
          <div className="w-full flex  text-white items-center mb-[10%] justify-center relative h-screen">
            <h1 className=" leading-[1.25] overflow-hidden text-[11vw] z-10 relative font-bold">
              {text.split("").map((char, index) => (
                <span
                  key={index}
                  className="hero-text inline-block translate-y-full"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          <div className="grid grid-cols-2 mobile:grid-cols-1 gap-[10vw] mobile:gap-[50vw] px-[5vw] py-[6vw]">
            {data.map(({ id, src, className, href, title }, index) => (
              <Link
                key={id}
                href={href}
                className={`overflow-hidden mobile:rounded-[2vw] my-[8vw] mobile:my-0 h-fit group mobile:p-[5vw] gap-[3vw] ${className} flex flex-col `}
              >
                <div>
                  <p className="mobile:text-[5vw] text-[2vw] text-white">[ {index + 1} ]</p>
                </div>

                <div className="w-full aspect-video relative overflow-hidden rounded-[0vw]">
                  <Image
                    src={src}
                    alt={title}
                    className={`w-full h-full rounded-[2.5vw] object-cover parallax-images ${className}-img 
                        transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
                        group-hover:scale-110
                        group-hover:rotate-2
                      `}
                    width={400}
                    height={700}
                  />
                </div>

                <h2 className="text-white font-medium text-[3vw] mobile:text-[7vw]">{title}</h2>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </ReactLenis>
  );
};

export default ListingLoco;
