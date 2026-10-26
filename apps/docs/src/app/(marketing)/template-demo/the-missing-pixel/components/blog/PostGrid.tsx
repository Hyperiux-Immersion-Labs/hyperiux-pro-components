// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { FadeUp } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import PixelReveal from "../effects/pixel-reveal";
import FilterBar from "../shared/FilterBar";
import { postPath } from "../../routes";
import { POSTS, type Post } from "./posts";

export const PostCard = ({ post, index = 0 }: { post: Post; index?: number }) => {
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const hover = (active: boolean) => {
    const duration = prefersReducedMotion() ? 0 : 1;
    gsap.to(zoomRef.current, { scale: active ? 1.05 : 1, duration: duration * 1.2, ease: "power3.out" });
  };

  return (
    <Link
      href={postPath(post.slug)}
      data-cursor="Read"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      className="group flex flex-col gap-4"
    >
        <FadeUp delay={(index % 3) * 0.1} className="aspect-[7/5] w-full overflow-hidden rounded-lg">
          <div ref={zoomRef} className="h-full w-full">
            <PixelReveal gridSize={26} edgeHeight={0.4} direction="down" start="top 85%" className="h-full w-full">
              <Image
                quality={95}
                src={post.image}
                alt=""
                sizes="(max-width: 768px) 90vw, (max-width: 1025px) 45vw, 30vw"
                className="h-full w-full object-cover"
              />
            </PixelReveal>
          </div>
        </FadeUp>
        <FadeUp delay={(index % 3) * 0.1} className="flex flex-col gap-4">
          <div className="flex gap-4 text-14 text-mpx-muted">
            <span>{post.category}</span>
            <time dateTime={post.dateTime}>{post.date}</time>
          </div>
          <h3 className="text-28">{post.title}</h3>
          <p className="text-14 text-mpx-muted">{post.excerpt}</p>
        </FadeUp>
    </Link>
  );
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "branding", label: "Branding" },
  { value: "design", label: "Design" },
  { value: "process", label: "Process" },
  { value: "studio", label: "Studio" },
];

const VISIBLE = 6;

const PostGrid = () => {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const pool = POSTS.filter((post) => filter === "all" || post.category.toLowerCase() === filter);
  const changeFilter = (value: string) => {
    if (value === filter) return;
    const cards = gridRef.current ? Array.from(gridRef.current.children) : [];
    if (prefersReducedMotion() || !cards.length) {
      setFilter(value);
      return;
    }
    gsap.to(cards, {
      opacity: 0,
      scale: 0.96,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setFilter(value),
    });
  };

  const showOlder = () => {
    setExpanded(true);
    requestAnimationFrame(() => {
      const links = gridRef.current?.querySelectorAll<HTMLElement>("a");
      links?.[VISIBLE]?.focus({ preventScroll: true });
    });
  };

  const collapsed = filter === "all" && !expanded;
  const shown = collapsed ? pool.slice(0, VISIBLE) : pool;

  return (
    <div className="flex flex-col gap-18 max-lg:gap-12">
      <div className="flex flex-col gap-16 max-lg:gap-10">
        <FilterBar
          label="Filter articles by topic"
          options={FILTERS}
          value={filter}
          onChange={changeFilter}
          countText={`${shown.length} ${shown.length === 1 ? "article" : "articles"}`}
        />
        <div ref={gridRef} key={filter} className="grid grid-cols-3 gap-x-12 gap-y-18 max-lg:grid-cols-2 max-lg:gap-x-8 max-lg:gap-y-12 max-md:grid-cols-1">
          {shown.map((post, index) => (
            <PostCard key={post.title} post={post} index={index} />
          ))}
        </div>
      </div>
      {collapsed && pool.length > VISIBLE && (
        <div className="flex justify-center">
          <PixelButton label="Show Older Essays" variant="outline" onClick={showOlder} />
        </div>
      )}
    </div>
  );
};

export default PostGrid;
