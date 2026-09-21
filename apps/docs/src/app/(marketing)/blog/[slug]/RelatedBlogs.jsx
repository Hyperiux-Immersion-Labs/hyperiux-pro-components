"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeadAnim from "@/components/Animations/HeadAnim";
import { useFadeUp } from "@/components/Animations/gsapAnimations";
import { ArrowIcon } from "@/components/WebsiteComps/Icons";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";
import BlogCard from "../BlogCard";

// Same drag/snap/arrow-scroll slider effect-detail.jsx runs for "Related
// Effects" - reproduced here rather than imported since that one is wired
// directly into effect-detail's own refs and router, with no standalone
// export. Behaviour is identical: pointer-drag scrolling, scroll-snapped
// cards, and prev/next buttons that disable at either end.
export default function RelatedBlogs({ posts = [] }) {
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const dragRef = useRef({
    isPointerDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useFadeUp(sectionRef);

  const safePosts = Array.isArray(posts) ? posts : [];
  const showSliderControls = safePosts.length > 2;

  const updateScrollState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;

    // Not `scrollLeft > 8` (what effect-detail.jsx uses): that slider starts at
    // scrollLeft 0, but this one has snap-mandatory plus scroll-pl/pl gutters,
    // so the browser performs an initial snap that scrolls the container to a
    // non-zero resting offset. Comparing against a flat 8px reads that resting
    // position as "already scrolled" and the prev button never disables.
    // The first card's own offset IS the resting position, whatever the
    // gutters add up to, so measure it instead of hardcoding a threshold.
    const firstCard = slider.firstElementChild;
    const restingOffset = firstCard
      ? firstCard.offsetLeft - slider.offsetLeft
      : 0;

    setCanScrollPrev(scrollLeft > restingOffset + 8);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  const scrollRelated = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.86;

    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });

    requestAnimationFrame(updateScrollState);
    setTimeout(updateScrollState, 250);
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    queueMicrotask(updateScrollState);

    slider.addEventListener("scroll", updateScrollState, { passive: true });

    return () => slider.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, safePosts.length]);

  const handlePointerDown = (event) => {
    const slider = sliderRef.current;

    if (!slider) return;

    dragRef.current = {
      isPointerDown: true,
      isDragging: false,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: slider.scrollLeft,
    };
  };

  const handlePointerMove = (event) => {
    const slider = sliderRef.current;
    const dragState = dragRef.current;

    if (!slider || !dragState.isPointerDown) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const isHorizontalDrag =
      Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY);

    if (!isHorizontalDrag && !dragState.isDragging) return;

    dragState.isDragging = true;
    event.preventDefault();
    slider.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const handlePointerEnd = () => {
    const dragState = dragRef.current;

    dragState.isPointerDown = false;

    window.setTimeout(() => {
      dragState.isDragging = false;
    }, 0);
  };

  if (!safePosts.length) return null;

  const arrowButtons = (
    <>
      <button
        type="button"
        onClick={() => scrollRelated("previous")}
        disabled={!canScrollPrev}
        aria-label="Show previous related blogs"
        className={`group relative flex h-8 w-8 items-center justify-center overflow-hidden bg-[#161616] transition-colors duration-300 max-[1025px]:size-10 ${!canScrollPrev ? "cursor-not-allowed text-white/25" : "cursor-pointer text-white hover:bg-[#ff5f00] hover:text-black"}`}
      >
        <ArrowIcon className={`h-4.5 w-4.5 max-md:size-4 -rotate-135 ${!canScrollPrev ? "" : "group-hover:translate-x-[-180%] duration-300 ease-in-out"}`} />
        <ArrowIcon className={`h-4.5 w-4.5 max-md:size-4 -rotate-135 absolute translate-x-[180%] ${!canScrollPrev ? "" : "group-hover:translate-x-0 duration-300 ease-in-out"}`} />
      </button>

      <button
        type="button"
        onClick={() => scrollRelated("next")}
        disabled={!canScrollNext}
        aria-label="Show next related blogs"
        className={`group relative flex h-8 w-8 items-center justify-center overflow-hidden bg-[#161616] transition-colors duration-300 max-[1025px]:size-10 ${!canScrollNext ? "cursor-not-allowed text-white/25" : "cursor-pointer text-white hover:bg-[#ff5f00] hover:text-black"}`}
      >
        <ArrowIcon className={`h-4.5 w-4.5 max-md:size-4 rotate-45 ${!canScrollNext ? "" : "group-hover:translate-x-[180%] duration-300 ease-in-out"}`} />
        <ArrowIcon className={`h-4.5 w-4.5 max-md:size-4 rotate-45 absolute translate-x-[-180%] ${!canScrollNext ? "" : "group-hover:translate-x-0 duration-300 ease-in-out"}`} />
      </button>
    </>
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 relative space-y-10 max-md:py-10  max-[1025px]:space-y-16"
    >
      <div className="flex px-[5vw] items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <HeadAnim>
          <h2 className="text-[4.2vw] max-[1025px]:text-[5vw] max-md:text-[9vw] font-medium text-foreground">
            Related Blogs
          </h2>
        </HeadAnim>

        {/* Desktop only - below 1025px the same controls render under the
            slider instead, matching effect-detail.jsx's related-effects layout. */}
        {showSliderControls && (
          <div className="fadeup flex items-center gap-2 max-[1025px]:hidden">
            {arrowButtons}
          </div>
        )}
      </div>

      <div className="fadeup">
        <div
          ref={sliderRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onDragStart={(event) => event.preventDefault()}
         
          // Below 1025px the cards carry their own px- gutters (matching
          // effect-detail.jsx), so the container's padding and edge spacers are
          // zeroed out there to avoid doubling the margin.
          className="flex cursor-grab snap-x snap-mandatory select-none gap-[2vw] overflow-x-auto scroll-smooth pb-4 pl-[4vw] scroll-pl-[5vw] active:cursor-grabbing before:h-px before:w-[5vw] before:shrink-0 before:content-[''] after:h-px after:w-[5vw] after:shrink-0 after:content-[''] max-[1025px]:gap-2 max-[1025px]:pl-0 max-[1025px]:scroll-pl-0 max-[1025px]:before:w-0 max-[1025px]:after:w-0 max-md:gap-6"
        >
          {safePosts.map((post, index) => (
            <div
              key={post.slug}
              className="w-[30vw] shrink-0 snap-start max-[1025px]:w-[55vw] max-[1025px]:px-[3vw] max-md:w-full max-md:px-[7vw]"
            >
              <BlogCard post={post} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      {showSliderControls && (
        <div className="fadeup hidden items-center justify-center gap-2 max-[1025px]:flex">
          {arrowButtons}
        </div>
      )}

      <div className="fadeup flex justify-center">
        <ButtonV3 text="View All Blogs" href="/blog" variant="orange" />
      </div>
    </section>
  );
}
