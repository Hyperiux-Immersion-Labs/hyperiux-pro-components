"use client";

import { useRef } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp } from "@/components/Animations/gsapAnimations";
import { getReadingTime } from "@/lib/blog-content";
import BlogHeroTags from "./BlogHeroTags";

// Client component so the heading/copy/fadeup animations can run - the page
// itself is an async server component and can't call hooks.
// Matches the mono, zero-padded date the listing cards use.
function formatHeroDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");

  return `${month} ${day},${date.getFullYear()}`;
}

export default function BlogDetailHero({ post }) {
  const heroRef = useRef(null);
  const readingTime = getReadingTime(post.body || []);

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

        {(post.categories?.length > 0 || post.tags?.length > 0) && (
          <div className="fadeup flex w-full items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {post.categories?.map((category) => (
                <span
                  key={category.slug}
                  className="bg-[#2B2B2B] px-[0.4vw] py-[0.1vw] text18 font-geist-mono text-white/90 max-md:px-3 max-md:py-1 max-md:text-[3vw]!"
                >
                  {category.title}
                </span>
              ))}
            </div>

            <BlogHeroTags tags={post.tags} />
          </div>
        )}
      </header>

      <div className="mt-[3vw] flex w-full items-center justify-between gap-4 max-md:mt-[8vw] max-[1025px]:mt-[5vh] max-[1025px]:gap-8 max-md:gap-8">
        {post.publishedAt && (
          <Copy delay={0.5}>
            <time
              dateTime={post.publishedAt}
              className="text18 font-geist-mono text-light-grey max-md:text-[3vw]!"
            >
              Published on {formatHeroDate(post.publishedAt)}
            </time>
          </Copy>
        )}

        <Copy delay={0.5}>
          <span className="text18 font-geist-mono text-light-grey max-md:text-[3vw]!">
            {readingTime.minutes} min read
          </span>
        </Copy>
      </div>

      {post.coverImage?.url && (
        <div className="fadeup relative mt-[1.2vw] h-[42vw] w-full overflow-hidden max-md:mt-[4vw] max-[1025px]:mt-[3vh] max-md:h-[60vw] rounded-md">
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
