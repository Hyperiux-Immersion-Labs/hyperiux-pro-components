// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import UnderlineLink from "../Buttons/UnderlineLink";
import PixelReveal from "../effects/pixel-reveal";
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
  index: number;
};

function PostCard({ post, index }: PostCardProps) {
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const hover = (active: boolean) => {
    gsap.to(zoomRef.current, {
      scale: active ? 1.05 : 1,
      duration: prefersReducedMotion() ? 0 : 1.2,
      ease: "power3.out",
    });
  };

  return (
    <Link
      href={ROUTES.article}
      data-cursor="Read"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      className="flex flex-col gap-[1.2vw] max-lg:gap-[2vw] max-md:gap-4"
    >
      <PixelReveal
        gridSize={26}
        edgeHeight={0.4}
        direction="up"
        className="aspect-7/5 w-full rounded-[1.4vw] max-lg:rounded-[2.5vw] max-md:rounded-[4vw]"
      >
        <div ref={zoomRef} className="h-full w-full">
          <Image
            src={post.image}
            alt=""
            sizes="(max-width: 768px) 90vw, (max-width: 1025px) 45vw, 30vw"
            className="h-full w-full object-cover"
          />
        </div>
      </PixelReveal>
      <FadeUp delay={0.2 + (index % 3) * 0.1} className="flex flex-col gap-[1.2vw] max-lg:gap-[2vw] max-md:gap-4">
        <div className="flex gap-[1vw] text-[1vw] text-mpx-muted max-lg:gap-4 max-lg:text-[2vw] max-md:text-[3.4vw]">
          <span>{post.category}</span>
          <time dateTime={post.dateTime}>{post.date}</time>
        </div>
        <h3 className="text-[1.75vw] leading-[1.2] tracking-tight max-lg:text-[3.2vw] max-md:text-[5.6vw]">
          {post.title}
        </h3>
        <p className="text-[1vw] leading-[1.5] text-mpx-muted max-lg:text-[2vw] max-md:text-[3.6vw]">
          {post.excerpt}
        </p>
      </FadeUp>
    </Link>
  );
}

const Journal = () => (
  <section
    id="journal"
    className="flex flex-col gap-[4.5vw] px-[5vw] py-[9vw] max-lg:gap-[8vw] max-lg:px-[4vw] max-lg:py-[12vw] max-md:gap-10 max-md:px-[5vw] max-md:py-[16vw]"
  >
    <div className="grid grid-cols-[1fr_31%] items-end gap-x-[2vw] gap-y-[1vw] max-lg:grid-cols-1 max-lg:gap-y-4">
      <MaskReveal
        as="h2"
        className="[.mpx-page_&]:text-[2.9vw] [.mpx-page_&]:tracking-[-0.1vw] max-lg:[.mpx-page_&]:text-[5vw] max-md:[.mpx-page_&]:text-[8vw]"
      >
        Notes from the studio
      </MaskReveal>
      <p className="w-[83%] text-[1vw] leading-[1.55] text-mpx-muted max-lg:w-[70%] max-lg:text-[2vw] max-md:w-full max-md:text-[3.6vw]">
        Opinions, process and the occasional confession.
      </p>
      <UnderlineLink
        href={ROUTES.journal}
        className="font-mpx-head text-[1vw] font-medium text-mpx-ink max-lg:text-[2vw] max-md:text-[3.6vw]"
      >
        Read the journal
      </UnderlineLink>
    </div>
    <div className="grid grid-cols-3 gap-x-[3.3vw] gap-y-[5vw] max-lg:grid-cols-2 max-lg:gap-x-[4vw] max-lg:gap-y-[8vw] max-md:grid-cols-1 max-md:gap-y-12">
      {POSTS.map((post, index) => (
        <PostCard key={post.title} post={post} index={index} />
      ))}
    </div>
  </section>
);

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
