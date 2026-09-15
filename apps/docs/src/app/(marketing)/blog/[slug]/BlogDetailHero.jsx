"use client";

import { useRef } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

// Client component so the heading/copy/fadeup animations can run - the page
// itself is an async server component and can't call hooks.
export default function BlogDetailHero({ post }) {
  const heroRef = useRef(null);

  // Scoped to this header: useFadeUp falls back to scanning the whole
  // document when the ref is empty, which would claim the article body's
  // own .fadeup blocks too.
  useFadeUp(heroRef);

  return (
    <div ref={heroRef}>
      <header className="flex flex-col gap-[1.5vw] max-[1025px]:gap-[6vw] max-md:gap-[8vw]">
        <Breadcrumb maxWords={3} />

        <HeadAnim>
          <h1 className="text-[3.2vw] max-[1025px]:text-[6vw] max-md:text-[9vw] font-neue-haas leading-[1.2]! text-foreground w-[80%] max-[1025px]:w-full">
            {post.title}
          </h1>
        </HeadAnim>

        {post.summary && (
          <Copy delay={0.5}>
            <p className="t24 leading-relaxed max-[1025px]:leading-[1.2] w-[60%] max-[1025px]:w-full text-white">
              {post.summary}
            </p>
          </Copy>
        )}

      </header>

      {post.coverImage?.url && (
        <div className="fadeup relative mt-[5vw] h-[42vw] w-full overflow-hidden max-md:mt-[8vw] max-[1025px]:mt-[6vh] max-md:h-[60vw] ">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            width={1600}
            height={900}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      )}

    </div>
  );
}
