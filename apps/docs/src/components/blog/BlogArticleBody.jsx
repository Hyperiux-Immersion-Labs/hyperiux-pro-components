"use client";

import { useRef } from "react";
import { TableOfContents } from "@/components/ui/TableOfContents";

// Thin client boundary so the (server) detail page can use the site's
// existing TableOfContents widget - it needs real refs (containerRef to scan
// for h2s + scroll-spy, stopRef to know where to stop showing), which means
// a client component. `children` is the server-rendered body, `afterContent`
// is whatever marks "the article is over" (tags/related posts) - both cross
// the server/client boundary fine since they're already-rendered elements,
// not functions.
export default function BlogArticleBody({ slug, children, afterContent }) {
  const contentRef = useRef(null);
  const stopRef = useRef(null);

  return (
    <>
      <div className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
        <TableOfContents containerRef={contentRef} stopRef={stopRef} watchKey={slug} />
      </div>

      <div ref={contentRef}>{children}</div>
      <div ref={stopRef}>{afterContent}</div>
    </>
  );
}
