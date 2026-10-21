// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { FadeUp, MaskReveal, MediaReveal } from "../Animations/gsapAnim";
import NavButtons from "../Buttons/NavButtons";
import PixelButton from "../Buttons/PixelButton";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import { ROUTES } from "../../routes";

type Post = {
  category: string;
  date: string;
  dateTime: string;
  title: string;
  excerpt: string;
  image: StaticImageData;
};

type PostCardProps = {
  post: Post;
  index?: number;
};

function PostCard({ post, index = 0 }: PostCardProps) {
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const hover = (active: boolean) => {
    const duration = prefersReducedMotion() ? 0 : 1;
    gsap.to(zoomRef.current, { scale: active ? 1.05 : 1, duration: duration * 1.2, ease: "power3.out" });
  };

  return (
    <FadeUp delay={(index % 3) * 0.1} className="w-[38%] shrink-0 snap-start max-lg:w-[65%] max-md:w-[85%]">
      <Link
        href={ROUTES.article}
        data-cursor="Read"
        onMouseEnter={() => hover(true)}
        onMouseLeave={() => hover(false)}
        onFocus={() => hover(true)}
        onBlur={() => hover(false)}
        className="flex flex-col gap-4 max-lg:gap-5 max-md:gap-4"
      >
        <div className="aspect-[7/5] w-full overflow-hidden rounded-lg bg-mpx-surface">
          <MediaReveal className="h-full w-full">
            <div ref={zoomRef} className="h-full w-full">
              <Image
                src={post.image}
                alt=""
                sizes="(max-width: 768px) 90vw, (max-width: 1025px) 45vw, 30vw"
                className="h-full w-full object-cover"
              />
            </div>
          </MediaReveal>
        </div>
        <div className="flex w-full justify-between px-2 gap-4 text-14 text-mpx-muted max-lg:gap-5 max-md:gap-4">
          <span>{post.category}</span>
          <time dateTime={post.dateTime}>{post.date}</time>
        </div>
        <h3 className="text-30 tracking-tight px-2">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-22 w-[90%] px-2 text-mpx-muted leading-[1.2]">{post.excerpt}</p>
      </Link>
    </FadeUp>
  );
}

const Journal = () => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, scrollLeft: 0, moved: false });

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(distance) < 5) return;
    const slider = event.currentTarget;
    if (!drag.moved) {
      drag.moved = true;
      slider.setPointerCapture(event.pointerId);
      slider.style.scrollSnapType = "none";
      slider.classList.add("cursor-grabbing");
    }
    event.preventDefault();
    slider.scrollLeft = drag.scrollLeft - distance;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    drag.pointerId = -1;
    const slider = event.currentTarget;
    if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
    slider.style.scrollSnapType = "";
    slider.classList.remove("cursor-grabbing");
  };
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const update = () => {
      setEdges({
        start: slider.scrollLeft <= 1,
        end: slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1,
      });
    };
    update();
    slider.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(slider);
    return () => {
      slider.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const slide = (direction: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const first = slider.children[0] as HTMLElement;
    const second = slider.children[1] as HTMLElement;
    const distance = second ? second.offsetLeft - first.offsetLeft : slider.clientWidth;
    slider.scrollBy({ left: distance * direction, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  };

  return (
  <section
    id="journal"
    className="mpx-container mpx-section flex flex-col gap-14 border-t border-black/10 max-lg:gap-11 max-md:gap-11"
  >
    <div className="flex flex-col gap-6 max-lg:gap-5">
      <MaskReveal as="h2">Notes from the studio</MaskReveal>
      <FadeUp className="flex w-[42%] flex-col items-start gap-6 max-lg:w-[70%] max-md:w-full">
        <p className="text-28 text-mpx-muted">Opinions, process and the occasional confession.</p>
      </FadeUp>
      <FadeUp className="flex w-full items-center justify-between gap-5">
        <PixelButton label="Read The Journal" href={ROUTES.journal} variant="outline" size="sm" />
        <NavButtons
          onPrev={() => slide(-1)}
          onNext={() => slide(1)}
          prevDisabled={edges.start}
          nextDisabled={edges.end}
          prevLabel="Previous journal post"
          nextLabel="Next journal post"
        />
      </FadeUp>
    </div>
    <div
      ref={sliderRef}
      data-mpx-journal-slider
      aria-label="Journal posts"
      tabIndex={0}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onPointerLeave={(event) => {
        if (!dragRef.current.moved) endDrag(event);
      }}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        if (!dragRef.current.moved) return;
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.moved = false;
      }}
      className="relative flex cursor-grab select-none snap-x snap-mandatory gap-9 overflow-x-auto overscroll-x-contain max-lg:gap-6 max-md:gap-4"
    >
      {POSTS.map((post, index) => (
        <PostCard key={post.title} post={post} index={index} />
      ))}
    </div>
  </section>
  );
};

export default Journal;

const POSTS: Post[] = [
  {
    category: "Branding",
    date: "Sep 24, 2026",
    dateTime: "2026-09-24",
    title: "Your brand guidelines are too long. Nobody reads page 74.",
    excerpt:
      "The longer the rulebook, the less your brand looks like itself. How we write guidelines people open on purpose.",
    image: cloudline,
  },
  {
    category: "Process",
    date: "Sep 9, 2026",
    dateTime: "2026-09-09",
    title: "We rebuilt a bank in twelve weeks. Here’s what broke first.",
    excerpt:
      "A hard deadline, a cautious board and one very long spreadsheet. The schedule forced better decisions.",
    image: kickflip,
  },
  {
    category: "Design",
    date: "Aug 27, 2026",
    dateTime: "2026-08-27",
    title: "If your logo can’t move, it’s only half a logo.",
    excerpt: "Your brand lives on screens now. A still logo is a photo of a dancer.",
    image: northway,
  },
];