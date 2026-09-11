"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

// The featured block sets its date in mono and zero-pads the day, with no
// space after the comma - "September 09,2026".
function formatFeaturedDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");

  return `${month} ${day},${date.getFullYear()}`;
}

function FeaturedBlogContent({ featuredPost }) {
  const sectionRef = useRef(null);

  // Scoped to this section so it claims only its own `.fadeup` elements -
  // useFadeUp falls back to scanning the whole document when the ref is
  // empty, which would otherwise steal the listing's cards.
  useFadeUp(sectionRef);

  return (
    <section ref={sectionRef} className="space-y-[8vw] max-md:mt-[6vw]">
      <div className="space-y-[2vw]">
        <HeadAnim>
          <h2 className="t96 font-neue-haas text-center">Our Latest Blog</h2>
        </HeadAnim>
        <Copy delay={0.5}>
          <p className="t22 mt-[1.5vw] text-center text-white max-md:mt-[4vw] max-md:text-[2.4vw] max-sm:text-[4vw]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </Copy>
      </div>

      <div className="mt-[5vw] flex items-start gap-[4vw] max-[1025px]:flex-col max-md:mt-[10vw] max-md:gap-[6vw]">
        {featuredPost.coverImage?.url && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="fadeup group block  shrink-0 h-[80vh] w-[55%] bg-[#1a1a1a] p-[1.8vw] max-[1025px]:w-full max-md:p-[4vw]"
          >
            <div className="relative h-full w-full overflow-hidden bg-grey">
              <Image
                src={featuredPost.coverImage.url}
                alt={featuredPost.coverImage.alt || featuredPost.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Link>
        )}

        <div className="flex w-[45%] grow flex-col gap-2 items-start justify-start my-4 max-[1025px]:w-full">
          <p className="text-[1vw] font-geist-mono text-light-grey max-md:text-[2.2vw] max-sm:text-[4vw]">
            {formatFeaturedDate(featuredPost.publishedAt)}
          </p>

          <Link href={`/blog/${featuredPost.slug}`}>
            <HeadAnim className='w-[85%]'>
              <h3 className="t56 font-neue-haas mt-[1.2vw]  max-md:mt-[4vw] max-sm:text-[7.5vw]">
                {featuredPost.title}
              </h3>
            </HeadAnim>
          </Link>

          {featuredPost.summary && (
            <Copy delay={0.5}>
              <p className="text-[1.3vw] mt-[1.8vw] text-white w-[85%] max-md:mt-[4vw] max-md:text-[2.2vw] max-sm:text-[4vw]">
                {featuredPost.summary}
              </p>
            </Copy>
          )}

          <ButtonV3
            text="Read More"
            href={`/blog/${featuredPost.slug}`}
            variant="orange"
            className="fadeup mt-[2.5vw] w-fit max-md:mt-[6vw]"
          />
        </div>
      </div>
    </section>
  );
}

export default function FeaturedBlog({ featuredPost = null }) {
  if (!featuredPost) return null;

  return <FeaturedBlogContent featuredPost={featuredPost} />;
}
