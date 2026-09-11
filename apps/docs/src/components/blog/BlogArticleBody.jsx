"use client";

import { useRef } from "react";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { useFadeUp } from "@/components/Animations/gsapAnimations";
import BlogAuthor from "./BlogAuthor";
import BlogSharePopover from "./BlogSharePopover";
import styles from "@/app/(marketing)/blog/[slug]/blog-content.module.css";


export default function BlogArticleBody({
  slug,
  author,
  shareUrl,
  shareTitle,
  children,
  afterContent,
}) {
  const contentRef = useRef(null);
  const stopRef = useRef(null);
  const articleRef = useRef(null);

  // Scoped to the article: useFadeUp falls back to scanning the whole
  // document when the ref is empty, which would claim the hero's elements.
  useFadeUp(articleRef, [slug]);

  return (
    <div ref={articleRef} className="relative flex mt-[4vw] max-md:mt-[10vw]">
      {/* No `items-start` on the row above: that shrink-wraps each column to
          its own content height, leaving the sticky rail no distance to
          travel. Stretching gives it the article's full height.

          Author, share button and TOC share the one sticky container and all
          stay visible for the article's full height. */}
      <div className="w-[32%] shrink-0 pl-[2vw] max-[1025px]:hidden">
        {/* No negative translate: that shifts the rail up out of its sticky
            box, letting it ride over the hero image above. A plain top offset
            keeps it clamped inside the article column. */}
        <div className="sticky top-[22vh] flex flex-col gap-[2vw]">
          <BlogAuthor author={author} />

          <BlogSharePopover url={shareUrl} title={shareTitle} />

          <div className="w-fit">
            <TableOfContents
              containerRef={contentRef}
              stopRef={stopRef}
              watchKey={slug}
              side="left"
              alwaysVisible
            />
          </div>
        </div>
      </div>

      <div className="w-[68%] min-w-0 max-[1025px]:w-full">
        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
        <div ref={stopRef}>{afterContent}</div>
      </div>
    </div>
  );
}
