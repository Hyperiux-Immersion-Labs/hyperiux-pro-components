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
import { useLenis } from "lenis/react";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { VaultHeader } from "@/components/layout/VaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import Button from "@/components/Reusable/Button";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { fadeUp } from "@/components/Animations/gsapAnimations";
import styles from "./effect-content.module.css";
import Footer from "@/components/LandingPage/Footer";

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
  const categories = (effect.categories?.length
    ? effect.categories
    : [effect.category]
  ).filter(Boolean);
  const dependencies = effect.dependencies || [];
  const coverImage =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) ||
    "/assets/img/image01.webp";

  return (
    <VaultLayout
      effectCounts={effectCounts}
      totalEffects={totalEffects}
      bgImageSrc=""
      activeCategory={
        effect.categories?.[0] || effect.category
      }
    >
      <div className="min-h-screen bg-black text-foreground">
        <Suspense fallback={<div className="h-12" />}>
          <VaultHeader
            effectName={effect.title}
            showSearch={false}
          />
        </Suspense>

        <main className="mx-auto w-full  px-15 pt-28 pb-12 max-sm:px-4 max-sm:pt-24">
          <section className="space-y-7">
            <div className="flex  items-start justify-between gap-5">
              <div className="w-full">
                {categorySlug && (
                  <Copy>
                    <p className="mb-3 text20 font-medium capitalize text-primary">
                      {categorySlug.replaceAll("-", " ")}
                    </p>
                  </Copy>
                )}

                <HeadAnim>
                  <h1 className="w-full text-[4.05vw] font-medium leading-[1.05] text-foreground md:text-5xl">
                    {content?.title || effect.title}
                  </h1>
                </HeadAnim>

                <Copy delay={0.5}>
                  <p className="mt-4 w-full text-foreground text22 leading-relaxed">
                    {content?.summary || effect.description}
                  </p>
                </Copy>
                <div className="mt-5 flex w-full items-center justify-between gap-3 fadeup">
                {(dependencies.length > 0 || effect.tier === "pro") && (
                  <div className="flex flex-wrap items-center gap-2">
                    {dependencies.map((dep) => (
                      <span
                        key={dep}
                        className="rounded-full bg-[#161616] px-4 py-2 text-20 capitalize text-foreground"
                      >
                        {dep}
                      </span>
                    ))}

                    {effect.tier === "pro" && (
                      <span className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white">
                        Pro
                      </span>
                    )}
                  </div>
                )}
                  <div className="ml-auto shrink-0">
                    <Button
                      text="Live Preview"
                      href={previewHref}
                      variant="orange"
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>

            
            </div>

            <div className="rounded-xl  bg-[#272727] p-5 fadeup h-[48vw]">
              <div className="aspect-video w-full overflow-hidden relative rounded-lg bg-black h-full">
                <Image
                  src={coverImage}
                  alt={effect.title || slug}
                  fill
                  sizes="(max-width: 1024px) 100vw, 980px"
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
            </div>

            <div className="relative">
              <div className="fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
                <TableOfContents
                  containerRef={contentRef}
                  watchKey={slug}
                />
              </div>

              <EffectDynamicContent
                ref={contentRef}
                content={content}
              />
            </div>

          {relatedEffects?.length > 0 && (
            <section className="my-20 space-y-20">
              <div className="flex items-center justify-between">
                <HeadAnim>
                  <h2 className="text-center text-[3.32vw] font-medium text-foreground">
                    Related Effects
                  </h2>
                </HeadAnim>
                <div className="justify-self-end">
                  <Button
                    text="Live Preview"
                    href={previewHref}
                    variant="orange"
                    className="shrink-0"
                  />
                </div>
              </div>

              <div className="rounded-xl  bg-[#272727] p-5 fadeup">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {relatedEffects.map((relatedEffect) => (
                  <EffectCard
                    key={relatedEffect.name}
                    effect={relatedEffect}
                  />
                ))}
                </div>
              </div>
            </section>
          )}
          </section>
        </main>

       <Footer/>
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
    <div ref={ref} className={`space-y-8 w-[70%] ${styles.content}`}>
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
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

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

    if (lenis) {
      lenis.scrollTo(targetTop, {
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }

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

    const updateVisibility = () => {
      const rect = root.getBoundingClientRect();

      setIsVisible(
        rect.top <= window.innerHeight * 0.45 &&
        rect.bottom >= window.innerHeight * 0.25
      );
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [containerRef, watchKey]);

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

  if (items.length === 0 || !isVisible) return null;

  return (
    <div className="group relative flex items-center gap-4">
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 h-full min-h-48 w-8 -translate-y-1/2"
      />
      <div className="pointer-events-none absolute right-[calc(100%+1.5rem)] top-1/2 w-[18vw] -translate-y-1/2 rounded-md bg-[#272727] p-2 py-4 opacity-0 shadow-2xl transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={[
                  "block rounded-sm px-3 py-2 text20 font-medium leading-none text-white transition-colors duration-300 ease-out",
                  activeId === it.id
                    ? "bg-black"
                    : "hover:bg-black/55",
                ].join(" ")}
                onClick={(e) => onTocClick(e, it.id)}
              >
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex w-12 flex-col items-end gap-5">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-label={it.text}
              className="block cursor-pointer py-1"
              onClick={(e) => onTocClick(e, it.id)}
            >
              <span
                className={[
                  "block h-[2px] rounded-full transition-all duration-300 ease-out",
                  activeId === it.id
                    ? "w-8 bg-primary"
                    : "w-8 bg-[#272727] hover:w-8 hover:bg-[#272727]",
                ].join(" ")}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}