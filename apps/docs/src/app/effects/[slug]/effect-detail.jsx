"use client";

import {
  useRef,
  useState,
  useEffect,
  Suspense,
  forwardRef,
} from "react";
import Link from "next/link";
import Image from "next/image";

import { motion } from "framer-motion";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { VaultHeader } from "@/components/layout/VaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import Footer from "@/components/Footer";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { fadeUp } from "@/components/Animations/gsapAnimations";
import styles from "./effect-content.module.css";

export function EffectDetailContent({
  slug,
  categorySlug,
  effect,
  content,
  relatedEffects = [],
  effectCounts,
  totalEffects,
  isLocked = false,
  userPlan = "free",
}) {
  fadeUp();
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const videoPreviewUrl = resolveEffectVideoUrl(effect);

  const componentName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const usageCode = `import { ${componentName} } from "@/components/effects/${slug}";

export default function MyComponent() {
  return (
    <${componentName}>
      Your content here
    </${componentName}>
  );
}`;

  const installCode = `npx hyperiux add ${slug}`;

  const showVideo = videoPreviewUrl && !videoError && videoReady;

  const handleVideoReady = () => {
    const video = videoRef.current;

    setVideoReady(true);

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.play?.().catch(() => {});
  };

  const previewHref = getEffectPreviewHref({
    ...effect,
    effectSlug: slug,
    categorySlug,
  });

  const sidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={previewHref}
          target="_blank"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md text-foreground bg-primary duration-300 ease-in-out hover:bg-primary/80 hover:text-white rounded-md hover:border-transparent transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>

          Live Preview
        </Link>
      </div>

      <div className="bg-secondary-surface/60 backdrop-blur-md rounded-md border border-border/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Resource details</h3>
          {effect.tier === "pro" && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pro
            </span>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-6">
            <span className="text-muted">Category</span>

            <span className="text-foreground capitalize text-right">
              {(effect.categories?.length
                ? effect.categories
                : [effect.category]
              ).join(", ")}
            </span>
          </div>

          <div className="flex justify-between gap-6">
            <span className="text-muted">Dependencies</span>

            <span className="text-foreground text-right">
              {effect.dependencies?.join(", ") || "None"}
            </span>
          </div>

          <div className="flex justify-between gap-6">
            <span className="text-muted">License</span>

            <span className="text-foreground text-right">
              MIT
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/60">
          <div className="flex flex-wrap gap-2">
            {(effect.categories?.length
              ? effect.categories
              : [effect.category]
            ).map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 border border-border/60 rounded-full text-xs text-white/80 capitalize"
              >
                {cat}
              </span>
            ))}

            {effect.dependencies?.map((dep) => (
              <span
                key={dep}
                className="px-2.5 py-1 capitalize border border-border/60 rounded-full text-xs text-white/80"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VaultLayout
      effectCounts={effectCounts}
      totalEffects={totalEffects}
      bgImageSrc=""
      activeCategory={
        effect.categories?.[0] || effect.category
      }
    >
      <div className="min-h-screen bg-black text-foreground px-15 max-md:px-2 max-sm:px-6">
        <Suspense fallback={<div className="h-12" />}>
          <VaultHeader
            effectName={effect.title}
            showSearch={false}
          />
        </Suspense>

        <div className="mx-auto px-8 pt-28 pb-8 max-sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div>
                {categorySlug && (
                  <Copy>
                  <p className="text-sm uppercase tracking-[0.18em] text-primary mb-4 max-sm:text-center">
                    {categorySlug.replaceAll("-", " ")}
                  </p>
                  </Copy>
                )}
               <HeadAnim>
                <h1 className="text-5xl max-sm:text-center text-foreground mb-4">
                  {content?.title || effect.title}
                </h1>
                </HeadAnim>
               <Copy delay={0.5}>
                <p className="text-[#d2d2d2] w-[80%] max-sm:w-full max-sm:text-center">
                  {content?.summary ||
                    effect.description}
                </p>
                </Copy>
              </div>

              <div className="aspect-video w-full overflow-hidden relative bg-black/20 fadeup">
                <Image
                  src={
                    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
                      defaultDirectory: "vault-listing-images",
                      defaultExtension: "png",
                    }) ||
                    "/assets/img/image01.webp"
                  }
                  alt={effect.title || slug}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className={`object-contain transition-all duration-500 ${showVideo ? "opacity-0" : "opacity-100"
                    }`}
                />

                {videoPreviewUrl && !videoError && (
                  <video
                    key={videoPreviewUrl}
                    ref={videoRef}
                    src={videoPreviewUrl}
                    autoPlay
                    loop
                    muted
                    defaultMuted
                    playsInline
                    preload="auto"
                    onLoadedMetadata={handleVideoReady}
                    onLoadedData={handleVideoReady}
                    onCanPlay={handleVideoReady}
                    onPlaying={handleVideoReady}
                    onError={() => setVideoError(true)}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${showVideo
                      ? "opacity-100"
                      : "opacity-0"
                      }`}
                  />
                )}
              </div>

              <div className="sm:hidden">
                {sidebarContent}
              </div>

              {/* {isLocked ? ( */}
                {/* <div className="relative rounded-xl border border-white/10 bg-white/5 overflow-hidden min-h-80 flex items-center justify-center">
                
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none select-none blur-sm opacity-30 p-8 space-y-6"
                  >
                    <div className="h-10 bg-white/20 rounded-md w-1/3" />
                    <div className="h-32 bg-white/10 rounded-xl" />
                    <div className="h-10 bg-white/20 rounded-md w-1/4" />
                    <div className="h-48 bg-white/10 rounded-xl" />
                  </div>

                  <UpgradeCard effectTitle={effect.title} />
                </div> */}
              {/* ) : ( */}
                <EffectDynamicContent
                  ref={contentRef}
                  content={content}
                />
              {/* )} */}
            </div>

            <div className="lg:col-span-1 self-stretch max-sm:hidden fadeup">
              <div className="sticky top-28 h-fit">
                {sidebarContent}
                <TableOfContents
                  containerRef={contentRef}
                  watchKey={slug}
                />
              </div>
            </div>

          </div>

          {relatedEffects?.length > 0 && (
            <div className="my-16 space-y-6">
              <HeadAnim>
              <h2 className="text-4xl font-semibold text-foreground tracking-tighter">
                Related Effects
              </h2>
              </HeadAnim>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fadeup">
                {relatedEffects.map((relatedEffect) => (
                  <EffectCard
                    key={relatedEffect.name}
                    effect={relatedEffect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </VaultLayout>
  );
}
const EffectDynamicContent = forwardRef(function EffectDynamicContent(
  {
    content,
  },
  ref
) {
  if (!content) return null;

  return (
    <div ref={ref} className={`space-y-8 ${styles.content}`}>
      <SanityBodyRenderer body={content.body} />
    </div>
  );
});

function SanityBodyRenderer({ body = [] }) {
  if (!body.length) return null;

  const groupedBlocks = groupBodyBlocks(body);

  return (
    <div className="space-y-6">
      {groupedBlocks.map((block, index) => (
        <SanityBodyBlock
          key={block._key || block._groupKey || `${block._type}-${index}`}
          block={block}
        />
      ))}
    </div>
  );
}

function SanityBodyBlock({ block }) {
  if (!block) return null;

  if (block._type === "block") {
    return <PortableTextBlock block={block} />;
  }

  if (block._type === "listGroup") {
    const ListTag = block.listItem === "number" ? "ol" : "ul";
    const listClassName =
      block.listItem === "number"
        ? `fadeup ${styles.numberList}`
        : "fadeup";

    return (
      <ListTag className={listClassName}>
        {block.items.map((item, index) => (
          <li key={item._key || `${block._groupKey}-${index}`}>
            {buildMarkedChildren(item)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block._type === "effectImage") {
    return (
      <figure className="fadeup">
        <div className={styles.imageFrame}>
          <img
            src={block.url}
            alt={block.alt || ""}
            className={styles.image}
          />
        </div>

        {block.caption && (
          <figcaption className={styles.caption}>{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (block._type === "effectCodeBlock") {
    return (
      <div className="fadeup">
        <CodeBlock
          code={normalizeCodeString(block.code || "")}
          language={block.language || "jsx"}
          filename={block.filename}
        />
      </div>
    );
  }

  if (block._type === "effectTableBlock") {
    return (
      <div className="space-y-3 fadeup">
        {block.caption && (
          <h3 className="text-xl tracking-tighter text-foreground">
            {block.caption}
          </h3>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {(block.headers || []).map((header, index) => (
                  <th key={`${header}-${index}`}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(block.rows || []).map((row, rowIndex) => (
                <tr key={row._key || rowIndex}>
                  {(row.cells || []).map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block._type === "effectCalloutBlock") {
    const toneClass =
      block.tone === "info"
        ? styles.calloutInfo
        : block.tone === "warning"
          ? styles.calloutWarning
          : block.tone === "success"
            ? styles.calloutSuccess
            : "";

    const shouldRenderAsCardGrid =
      !block.tone ||
      block.tone === "default";

    return (
      <section className={`fadeup ${styles.callout} ${toneClass}`}>
        {block.title && (
          <h3 className={styles.calloutTitle}>{block.title}</h3>
        )}

        {shouldRenderAsCardGrid ? (
          <CalloutCardGrid body={block.content || []} />
        ) : (
          <SanityBodyRenderer body={block.content || []} />
        )}
      </section>
    );
  }

  return null;
}

function CalloutCardGrid({ body = [] }) {
  const items = body
    .map((block) => extractPlainBlockText(block))
    .filter(Boolean);

  if (!items.length) {
    return <SanityBodyRenderer body={body} />;
  }

  return (
    <div className={styles.calloutGrid}>
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={styles.calloutGridItem}>
          {item}
        </div>
      ))}
    </div>
  );
}

function PortableTextBlock({ block }) {
  if (isCodeOnlyBlock(block)) {
    const code = normalizeCodeString(getBlockText(block));

    if (!code.trim()) return null;

    return (
      <div className="fadeup">
        <CodeBlock
          code={code}
          language={inferCodeLanguage(code)}
        />
      </div>
    );
  }

  const children = buildMarkedChildren(block);
  const style = block.style || "normal";

  if (style === "h2") {
    return <h2 className="fadeup">{children}</h2>;
  }

  if (style === "h3") {
    return <h3 className="fadeup">{children}</h3>;
  }

  if (style === "blockquote") {
    return <blockquote className="fadeup">{children}</blockquote>;
  }

  if (block.listItem === "bullet") {
    return (
      <ul className="fadeup">
        <li>{children}</li>
      </ul>
    );
  }

  if (block.listItem === "number") {
    return (
      <ol className="fadeup">
        <li>{children}</li>
      </ol>
    );
  }

  return <p className="fadeup">{children}</p>;
}

function groupBodyBlocks(body) {
  const grouped = [];

  for (const block of body) {
    if (block?._type === "block" && block.listItem) {
      const previous = grouped[grouped.length - 1];

      if (
        previous?._type === "listGroup" &&
        previous.listItem === block.listItem &&
        (previous.level || 1) === (block.level || 1)
      ) {
        previous.items.push(block);
        continue;
      }

      grouped.push({
        _type: "listGroup",
        _groupKey: `list-${block._key || grouped.length}`,
        listItem: block.listItem,
        level: block.level || 1,
        items: [block],
      });
      continue;
    }

    grouped.push(block);
  }

  return grouped;
}

function isCodeOnlyBlock(block) {
  const children = block?.children || [];

  if (!children.length) return false;

  return children.every((child) => {
    if (child?._type !== "span") return false;

    const marks = child.marks || [];

    return marks.includes("code");
  });
}

function getBlockText(block) {
  return (block?.children || [])
    .map((child) => child?.text || "")
    .join("");
}

function extractPlainBlockText(block) {
  if (block?._type !== "block") return "";

  const text = getBlockText(block).trim();

  if (!text) return "";

  return text;
}

function inferCodeLanguage(code) {
  const trimmed = code.trim();

  if (
    trimmed.startsWith("npm ") ||
    trimmed.startsWith("npx ") ||
    trimmed.startsWith("pnpm ") ||
    trimmed.startsWith("yarn ")
  ) {
    return "bash";
  }

  return "jsx";
}

function normalizeCodeString(code) {
  return code
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function buildMarkedChildren(block) {
  const markDefs = block.markDefs || [];

  return (block.children || []).map((child, index) => {
    if (!child?.text) return null;

    let node = child.text;

    for (const mark of child.marks || []) {
      if (mark === "strong") {
        node = <strong key={`strong-${index}`}>{node}</strong>;
        continue;
      }

      if (mark === "em") {
        node = <em key={`em-${index}`}>{node}</em>;
        continue;
      }

      if (mark === "code") {
        node = (
          <code key={`code-${index}`} className={styles.contentInlineCode}>
            {node}
          </code>
        );
        continue;
      }

      const markDef = markDefs.find((item) => item._key === mark);

      if (markDef?._type === "link" && markDef.href) {
        node = (
          <a
            key={`link-${index}`}
            href={markDef.href}
            target="_blank"
            rel="noreferrer"
          >
            {node}
          </a>
        );
      }
    }

    return <span key={child._key || index}>{node}</span>;
  });
}

function TableOfContents({ containerRef, watchKey }) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState("");

  const activeLockRef = useRef({
    id: "",
    targetTop: 0,
    timeoutId: null,
  });

  const onTocClick = (e, id) => {
    e.preventDefault();

    const el = document.getElementById(id);

    if (!el) return;

    const topOffset = window.innerHeight * 0.2;

    const targetTop =
      el.getBoundingClientRect().top +
      window.scrollY -
      topOffset;

    if (activeLockRef.current.timeoutId) {
      window.clearTimeout(
        activeLockRef.current.timeoutId
      );
    }

    activeLockRef.current = {
      id,
      targetTop,
      timeoutId: null,
    };

    setActiveId(id);

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    window.history.pushState(null, "", `#${id}`);

    const releaseWhenSettled = (
      startedAt = performance.now()
    ) => {
      const isSettled =
        Math.abs(window.scrollY - targetTop) < 2;

      const timedOut =
        performance.now() - startedAt > 1800;

      if (isSettled || timedOut) {
        activeLockRef.current = {
          id: "",
          targetTop: 0,
          timeoutId: null,
        };

        return;
      }

      activeLockRef.current.timeoutId =
        window.setTimeout(
          () => releaseWhenSettled(startedAt),
          80
        );
    };

    activeLockRef.current.timeoutId =
      window.setTimeout(
        () => releaseWhenSettled(),
        120
      );
  };

  useEffect(() => {
    const root = containerRef?.current;

    if (!root) return;

   const headings = Array.from(
  root.querySelectorAll("h2")
).map((el, index) => {
  if (!el.id) {
    el.id =
      el.textContent
        ?.toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^\w-]/g, "") ||
      `section-${index}`;
  }

  return {
    id: el.id,
    text: el.textContent || "",
    level: el.tagName.toLowerCase(),
  };
});

    setItems(headings);
  }, [containerRef, watchKey]);

  useEffect(() => {
    const root = containerRef?.current;

    if (!root) return;

   const headings = Array.from(
  root.querySelectorAll("h2")
);

headings.forEach((el, index) => {
  if (!el.id) {
    el.id =
      el.textContent
        ?.toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^\w-]/g, "") ||
      `section-${index}`;
  }
});
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (activeLockRef.current.id) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top >
              b.boundingClientRect.top
              ? 1
              : -1
          )[0];

        const id = visible?.target?.id;

        if (id) {
          setActiveId(id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    headings.forEach((h) =>
      observer.observe(h)
    );

    return () => observer.disconnect();
  }, [containerRef, items.length]);

  useEffect(() => {
    return () => {
      if (activeLockRef.current.timeoutId) {
        window.clearTimeout(
          activeLockRef.current.timeoutId
        );
      }
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rounded-md border border-border/60 bg-black/20 backdrop-blur-md p-5 mt-6">
      <p className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
        On this page
      </p>

      <ul className="space-y-3 mt-8">
  {items.map((it) => (
    <li
      key={it.id}
      className="text-[0.95vw] max-sm:text-sm cursor-pointer"
    >
      <a
        href={`#${it.id}`}
        className={[
          "flex items-center gap-3 origin-left transition-all duration-300 ease-out will-change-transform",
          activeId === it.id
            ? "text-foreground scale-[1.06]"
            : "text-foreground/65 hover:text-foreground hover:scale-[1.04]",
        ].join(" ")}
        onClick={(e) => onTocClick(e, it.id)}
      >
        <span className="relative h-2 w-2 shrink-0">
          {activeId === it.id ? (
            <motion.span
              layoutId="toc-dot"
              className="absolute inset-0 rounded-full bg-primary"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 45,
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          ) : (
            <span className="absolute inset-0 rounded-full bg-white/0" />
          )}
        </span>

        <span className="transition-all duration-300">
          {it.text}
        </span>
      </a>
    </li>
  ))}
</ul>
    </div>
  );
}
