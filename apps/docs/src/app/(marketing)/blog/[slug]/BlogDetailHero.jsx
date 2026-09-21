"use client";

import { useRef } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import LineWipe from "@/components/Animations/LineWipe";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

export default function BlogDetailHero({ post }) {
  const heroRef = useRef(null);


  useFadeUp(heroRef);

  return (
    <div ref={heroRef}>
      <header className="flex flex-col gap-[1.5vw] max-[1025px]:gap-[6vw] max-md:gap-[8vw]">
        <Breadcrumb maxWords={3} />

        <LineWipe>
          <h1 className="text-[3.2vw] max-[1025px]:text-[6vw] max-md:text-[9vw] font-neue-haas leading-[1.2]! text-foreground w-[80%] max-[1025px]:w-full">
            {post.title}
          </h1>
        </LineWipe>

        {post.summary && (
          <LineWipe delay={0.5}>
            <p className="t24 leading-relaxed max-[1025px]:leading-[1.2] w-[60%] max-[1025px]:w-full text-white">
              {post.summary}
            </p>
          </LineWipe>
        )}

      </header>

      {post.coverImage?.url && (
        <div className="fadeup relative group mt-[5vw] h-[42vw] w-full overflow-hidden max-md:mt-[8vw] max-[1025px]:mt-[6vh] max-md:h-[60vw] ">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            width={1600}
            height={900}
            priority
            className="h-full w-full group-hover:scale-[1.02] duration-300 ease-in-out transition-all object-cover"
          />
        </div>
      )}

    </div>
  );
}
