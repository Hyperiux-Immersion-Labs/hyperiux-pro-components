"use client";
import { useRef } from "react";
import { useGlideRow } from "@/hooks/useGlideRow";
import BlogCard from "../BlogCard";
import { SliderArrowButton, SliderNav } from "@/components/ui/SliderArrowButton";
import { useFadeIn } from "@/components/Animations/gsapAnimations";
import LineWipe from "@/components/Animations/LineWipe";

const RELATED_BLOGS_HEADING_LINE_STYLE = { lineHeight: "1.5" };

export default function RelatedBlogsSlider({ posts = [] }) {
  const sectionRef = useRef(null);
  // The same free, smooth slider as the effects listing's Trending row
  const { ref: sliderRef, edges, step, handlers } = useGlideRow([posts.length]);
  const canScrollPrev = !edges.start;
  const canScrollNext = !edges.end;
  const scrollRelatedBlogs = (direction) => step(direction === "next" ? 1 : -1);

  useFadeIn(sectionRef, [posts.length]);

  if (!posts.length) return null;

  // Desktop/tablet only need the buttons once more than 3 cards overflow the
  // row - but mobile shows one full-width card at a time, so any post beyond
  // the first always needs a way to advance, regardless of total count.
  const showControls = posts.length > 3;
  const showMobileControls = posts.length > 1;

  return (
    <section ref={sectionRef} id="related-blogs" className="relative site-container section-x flex flex-col gap-[calc(var(--cvw)*2.8)] py-[7%] max-md:gap-[10vw] max-md:py-[12%]">
      <div className="flex items-center justify-between gap-[calc(var(--cvw)*1.4)] max-lg:flex-col max-lg:gap-[5vw] max-md:gap-[10vw] max-md:items-start">
        <LineWipe lineStyle={RELATED_BLOGS_HEADING_LINE_STYLE} lit="var(--ink)">
          <h2
            className="type-h1 text-center text-ink max-md:text-left"
            style={RELATED_BLOGS_HEADING_LINE_STYLE}
          >
            Related Blogs
          </h2>
        </LineWipe>

        <SliderNav
          className="max-lg:hidden"
          exploreText="Explore All Blogs"
          exploreHref="/blog"
          showArrows={showControls}
          onPrev={() => scrollRelatedBlogs("previous")}
          onNext={() => scrollRelatedBlogs("next")}
          canPrev={canScrollPrev}
          canNext={canScrollNext}
          prevLabel="Show previous related blogs"
          nextLabel="Show next related blogs"
        />
      </div>

      <div
        ref={sliderRef}
        {...handlers}
        // data-cursor-drag: the site cursor shows its drag state over the row.
        // overflow-y set explicitly so Lenis doesn't treat the row as a vertical scroller.
        data-cursor-drag
        // Padding gives the cards' hover shadow and lift room inside the clipped row (the shadow
        // reaches ~1.8cvw to the sides and ~3cvw below); the negative margins keep the cards in place.
        className="-mx-[calc(var(--cvw)*2)] -mt-[calc(var(--cvw)*1)] -mb-[calc(var(--cvw)*3.5)] flex cursor-grab select-none gap-[calc(var(--cvw)*1.5)] overflow-x-hidden overflow-y-hidden px-[calc(var(--cvw)*2)] pt-[calc(var(--cvw)*1)] pb-[calc(var(--cvw)*3.5)] touch-scrollbar max-lg:-m-[2vw] max-lg:gap-[2vw] max-lg:overflow-x-auto max-lg:p-[2vw] max-md:-m-[4vw] max-md:gap-[4vw] max-md:p-[4vw]"
      >
        {posts.map((post, index) => (
          <div
            key={post.slug}
            // Comes a touch towards the viewer on hover, like the effect cards (the card adds the shadow)
            className="w-[32%] flex-none transition-transform duration-500 transform-[perspective(1200px)_translateZ(0)] hover:transform-[perspective(1200px)_translateZ(calc(var(--cvw)*1))] max-lg:w-[60%] max-md:w-full"
          >
            <BlogCard post={post} priority={index === 0} light />
          </div>
        ))}
      </div>

      {showMobileControls && (
        <div className="hidden items-center justify-start gap-2 max-md:flex">
          <SliderArrowButton
            id="related-blogs-slider-show-previous-related-blogs"
            direction="prev"
            tone="light"
            disabled={!canScrollPrev}
            onClick={() => scrollRelatedBlogs("previous")}
            ariaLabel="Show previous related blogs"
          />
          <SliderArrowButton
            id="related-blogs-slider-show-next-related-blogs"
            direction="next"
            tone="light"
            disabled={!canScrollNext}
            onClick={() => scrollRelatedBlogs("next")}
            ariaLabel="Show next related blogs"
          />
        </div>
      )}
    </section>
  );
}
