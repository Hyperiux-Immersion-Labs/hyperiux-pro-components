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
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { VaultHeader } from "@/components/layout/VaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { CodeBlock } from "@/components/ui/CodeBlock";
import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";
import { getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import Button from "@/components/WebsiteComps/Button";
import CircularButton from "@/components/WebsiteComps/CirclularButton";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp, useLineAnim } from "@/components/Animations/gsapAnimations";
import styles from "./effect-content.module.css";
import { ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";

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
  useFadeUp();
  useLineAnim();
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const relatedEffectsRef = useRef(null);
  const relatedSliderRef = useRef(null);
  const relatedSliderDragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });
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
  const showRelatedSliderControls = relatedEffects.length > 3;
  const pageTitle = content ? content.title?.trim() : effect.title;
  const pageSummary = content ? content.summary?.trim() : effect.description;
  const categoryLabel = categorySlug?.replaceAll("-", " ");
  const categoryHref = categorySlug ? `/effects/${categorySlug}` : "/effects";
  const hasCtaSection = Boolean(
    content?.ctaBanner?.heading || content?.ctaBanner?.buttonText
  );

  const scrollRelatedEffects = (direction) => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.86;

    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handleRelatedPointerDown = (event) => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    relatedSliderDragRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: slider.scrollLeft,
      hasDragged: false,
    };

    slider.setPointerCapture?.(event.pointerId);
  };

  const handleRelatedPointerMove = (event) => {
    const slider = relatedSliderRef.current;
    const dragState = relatedSliderDragRef.current;

    if (!slider || !dragState.isDragging) return;

    const deltaX = event.clientX - dragState.startX;

    if (Math.abs(deltaX) > 5) {
      dragState.hasDragged = true;
    }

    slider.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const handleRelatedPointerEnd = (event) => {
    const slider = relatedSliderRef.current;
    const dragState = relatedSliderDragRef.current;

    if (!dragState.isDragging) return;

    dragState.isDragging = false;
    slider?.releasePointerCapture?.(event.pointerId);
  };

  const handleRelatedClickCapture = (event) => {
    const dragState = relatedSliderDragRef.current;

    if (!dragState.hasDragged) return;

    event.preventDefault();
    event.stopPropagation();
    dragState.hasDragged = false;
  };

  const handleVideoReady = () => {
    const video = videoRef.current;

    setVideoReady(true);

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.play?.().catch(() => { });
  };

  const previewHref = getEffectPreviewHref({
    ...effect,
    effectSlug: slug,
    categorySlug,
  });
  const dependencies = effect.dependencies || [];
  const coverImage =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) ||
    "/assets/img/image01.webp";

  const sidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={previewHref}
          target="_blank"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md text-foreground bg-primary duration-300 ease-in-out hover:bg-primary/80 hover:text-white rounded-md hover:border-transparent transition-colors "
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
      <div className="min-h-screen text-foreground ">
        <Suspense fallback={<div className="h-12" />}>
          <VaultHeader
            effectName={effect.title}
            showSearch={false}
          />
        </Suspense>

        <main className="mx-auto w-full relative   px-15 max-md:px-0 pt-28 pb-12  max-sm:pt-50">
          <section className="space-y-7 ">
            <div className="flex items-start max-sm:px-[7vw] max-md:px-[6vw]  justify-between gap-5">
              <div className="w-full space-y-5 ">
                
                  <nav
                    aria-label="Breadcrumb"
                    className="mb-3 flex w-fit max-w-full flex-wrap items-center gap-2 text-sm text-muted max-md:mx-auto max-md:justify-center max-sm:text-xs fadeup"
                  >
                    <Link
                      href="/"
                      className="transition-colors hover:text-primary"
                    >
                      Home
                    </Link>
                    <span className="text-white/25">/</span>
                    <Link
                      href="/effects"
                      className="transition-colors hover:text-primary"
                    >
                      Effects
                    </Link>
                    {categorySlug && (
                      <>
                        <span className="text-white/25">/</span>
                        <Link
                          href={categoryHref}
                          className="capitalize transition-colors hover:text-primary"
                        >
                          {categoryLabel}
                        </Link>
                      </>
                    )}
                    {pageTitle && (
                      <>
                        <span className="text-white/25">/</span>
                        <span className="max-w-[32vw] truncate text-primary max-md:max-w-[72vw]">
                          {pageTitle}
                        </span>
                      </>
                    )}
                  </nav>
                

                {pageTitle && (
                  <HeadAnim>
                    <h1 className="w-full max-sm:text-[6vw] max-md: max-sm:font-bold max-md:w-[90%] max-sm:w-[80%] max-md:mx-auto max-md:text-center font-semibold leading-[1.05] max-sm:leading-[1.3] text-foreground text80 ">
                      {pageTitle}
                    </h1>
                  </HeadAnim>
                )}

                

                {pageSummary && (
                  <Copy delay={0.5}>
                    <p className="mt-4 w-full max-md:text-center max-md:w-[90%] max-md:mx-auto text-foreground opacity-90 text22 leading-relaxed max-md:leading-[1.3]">
                      {pageSummary}
                    </p>
                  </Copy>
                )}
                <div className="mt-12 flex w-full items-center justify-between gap-3 fadeup">
                  {(dependencies.length > 0 || effect.tier === "pro") && (
                    <div className="flex flex-wrap items-center gap-2">
                      {dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="rounded-full bg-[#272727] px-4 py-2 text20 capitalize text-foreground max-sm:text-muted"
                        >
                          {dep}
                        </span>
                      ))}

                      {effect.tier === "pro" && (
                        <span className="rounded-full bg-primary px-4 py-2 max-sm:px-[7vw] max-md:px-[6vw]   text-xs max-md:text-xl max-sm:text-xs font-medium text-white">
                          Pro
                        </span>
                      )}
                    </div>
                  )}

                  <div className="ml-auto shrink-0 max-sm:hidden">
                    <Button
                      text="Live Preview"
                      href={previewHref}
                      target_blank ={true}
                      target="_blank"
                      variant="orange"
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="fadeup max-sm:px-[7vw] max-md:px-[6vw]  h-[46vw] rounded-sm w-full">
              <div className="relative h-full w-full aspect-video overflow-hidden rounded-sm bg-black isolate">
                <Image
                  src={coverImage}
                  alt={effect.title || slug}
                  fill
                  sizes="(max-width: 1024px) 100vw, 980px"
                  priority
                  className={`rounded-[inherit] object-cover transition-all duration-500 ${showVideo ? "opacity-0" : "opacity-100"
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
                    playsInline
                    preload="auto"
                    onLoadedMetadata={handleVideoReady}
                    onLoadedData={handleVideoReady}
                    onCanPlay={handleVideoReady}
                    onPlaying={handleVideoReady}
                    onError={() => setVideoError(true)}
                    className={`absolute inset-0 h-full w-full rounded-[inherit] object-cover transition-opacity duration-500 ${showVideo
                      ? "opacity-100"
                      : "opacity-0"
                      }`}
                  />
                )}
              </div>

            </div>

            <div className="max-sm:flex max-sm:px-[7vw] max-md:px-[6vw]  w-full max-sm:pt-4 justify-center shrink-0  hidden">
              <Button
                text="Live Preview"
                href={previewHref}
                target="_blank"
                variant="orange"
                className="shrink-0"
              />
            </div>
            <>
                <div className="relative max-sm:px-[7vw] max-md:px-[6vw] pt-[1.5vw] ">
                  <div className="fixed  right-8 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
                    <TableOfContents
                      containerRef={contentRef}
                      stopRef={hasCtaSection ? ctaSectionRef : relatedEffectsRef}
                      watchKey={slug}
                    />
                  </div>

                  <EffectDynamicContent
                    ref={contentRef}
                    content={content}
                    isLocked={isLocked}
                  />
                </div>

                <div className="w-[70%] max-md:w-full max-sm:px-[7vw] max-md:px-[6vw]">
                  <EffectCtaSection
                    cta={content?.ctaBanner}
                    sectionRef={ctaSectionRef}
                  />
                </div>

                {relatedEffects?.length > 0 && (
                  <section ref={relatedEffectsRef} className="my-20  relative   max-sm:pt-[5vh] space-y-10 max-md:space-y-16">
                    <div className="flex items-center justify-between gap-5 max-md:flex-col">
                      <HeadAnim>
                        <h2 className="text-center text-[3.32vw] max-md:text-[5vw] max-sm:text-[2rem] font-medium text-foreground">
                          Related Effects
                        </h2>
                      </HeadAnim>

                      <div className="fadeup flex max-md:hidden flex-col justify-center items-end gap-5 max-md:w-full max-md:items-stretch">
                        <Button
                          text="Explore all effects"
                          href='/effects'
                          variant="orange"
                          className="shrink-0"
                        />

                      
                      </div>

                      
                    </div>

                    <div className="max-md:hidden">
                        {showRelatedSliderControls && (
                          <div className="flex items-center  justify-end gap-2 max-md:justify-center">
                            <CircularButton
                              onClick={() => scrollRelatedEffects("previous")}
                              aria-label="Show previous related effects"
                              className="h-11 w-11 p-4 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                              bgColor="#ff5f00"
                            >
                              <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                            </CircularButton>
                            <CircularButton
                              onClick={() => scrollRelatedEffects("next")}
                              aria-label="Show next related effects"
                              className="h-11 p-4 w-11 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                              bgColor="#ff5f00"
                            >
                              <ChevronRight className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                            </CircularButton>
                          </div>
                        )}
                    </div>

                    <div className="rounded-xl fadeup">
                      <div
                        ref={relatedSliderRef}
                        onPointerDown={handleRelatedPointerDown}
                        onPointerMove={handleRelatedPointerMove}
                        onPointerUp={handleRelatedPointerEnd}
                        onPointerLeave={handleRelatedPointerEnd}
                        onPointerCancel={handleRelatedPointerEnd}
                        onClickCapture={handleRelatedClickCapture}
                        onDragStart={(event) => event.preventDefault()}
                        className="flex cursor-grab  snap-x snap-mandatory select-none gap-6 overflow-x-auto max-sm:gap-6 max-md:gap-2 scroll-smooth pb-4 active:cursor-grabbing "
                      >
                        {relatedEffects.map((relatedEffect) => (
                          <div
                            key={relatedEffect.name}
                            className="min-w-[31vw] max-sm:px-[7vw] max-md:px-[6vw]   snap-start max-lg:min-w-[44vw] max-md:min-w-[55vw]! max-sm:min-w-full!"
                          >
                            <EffectCard
                              effect={relatedEffect}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                      <div className="hidden max-md:block">
                        {showRelatedSliderControls && (
                          <div className="flex items-center  justify-end gap-2 max-md:justify-center">
                            <CircularButton
                              onClick={() => scrollRelatedEffects("previous")}
                              aria-label="Show previous related effects"
                              className="h-11 w-11 p-4 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                              bgColor="#ff5f00"
                            >
                              <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                            </CircularButton>
                            <CircularButton
                              onClick={() => scrollRelatedEffects("next")}
                              aria-label="Show next related effects"
                              className="h-11 p-4 w-11 border-white/12 bg-[#272727] text-white hover:border-[#ff5f00]"
                              bgColor="#ff5f00"
                            >
                              <ChevronRight className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                            </CircularButton>
                          </div>
                        )}
                    </div>

                     <div className="fadeup max-md:mx-auto max-md:flex hidden flex-col justify-center items-end gap-5 max-md:w-fit max-md:items-stretch">
                        <Button
                          text="Explore all effects"
                          href='/effects'
                          variant="orange"
                          className="shrink-0"
                        />

                      
                      </div>

                  </section>
                )}
              </>
          </section>
        </main>
      </div>
    </VaultLayout>
  );
}
const EffectDynamicContent = forwardRef(function EffectDynamicContent(
  {
    content,
    isLocked = false,
  },
  ref
) {
  if (!content) return null;

  return (
    <div ref={ref} className={`space-y-8 w-[70%] max-md:w-full ${styles.content}`}>
      <SanityBodyRenderer body={content.body} isLocked={isLocked} />
    </div>
  );
});

function EffectCtaSection({ cta, sectionRef }) {
  if (!cta?.heading && !cta?.buttonText) return null;

  const buttonLink = cta.buttonLink || "#";
  const isExternalLink = /^https?:\/\//.test(buttonLink);

  return (
    <section ref={sectionRef} className={`fadeup ${styles.ctaBanner}`}>
      {cta.heading && (
        <h2 className={styles.ctaBannerHeading}>{cta.heading}</h2>
      )}

       {cta.description && (
        <p className={styles.ctaBannerDescription}>{cta.description}</p>
      )}


      <div className="w-fit ">

      {cta.buttonText && (
        <Button
        text={cta.buttonText}
        href={buttonLink}
        scaleClass='group-hover:scale-[100]!'
        target="_blank"
        variant="white"
        className="shrink-0"
        />
      )}
      </div>
    </section>
  );
}

function SanityBodyRenderer({ body = [], isLocked = false }) {
  if (!body.length) return null;

  const groupedBlocks = groupBodyBlocks(body);

  return (
    <div className="space-y-6 max-sm:px-2">
      {groupedBlocks.map((block, index) => (
        <SanityBodyBlock
          key={block._key || block._groupKey || `${block._type}-${index}`}
          block={block}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}

function SanityBodyBlock({ block, isLocked = false }) {
  if (!block) return null;

  if (block._type === "block") {
    return <PortableTextBlock block={block} isLocked={isLocked} />;
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
    if (isLocked) {
      return (
        <LockedCodePlaceholder
          filename={block.filename}
          language={block.language || "jsx"}
        />
      );
    }

    return (
      <div className="fadeup">
        <CodeBlock
          code={normalizeCodeString(block.code || "")}
          language={block.language || "jsx"}
          filename={block.filename}
          hideHeaderWhenNoFilename
          className={!block.filename ? styles.contentCodeBlockNoFilename : ""}
        />
      </div>
    );
  }

  if (block._type === "horizontalRule") {
    return <hr className={`fadeup ${styles.contentDivider}`} />;
  }

  if (block._type === "effectFaqAccordion") {
    const faqItems = block.items || [];

    if (!faqItems.length) return null;

    return (
      <section className={`fadeup ${styles.faqAccordion}`}>
        {block.title && (
          <h2 className={styles.faqAccordionTitle}>{block.title}</h2>
        )}

        <FAQGroup
          allowMultiple={false}
          defaultOpenItems={faqItems[0]?._key ? [faqItems[0]._key] : []}
        >
          <div className={styles.faqAccordionItems}>
            {faqItems.map((item, index) => {
              const itemId = item._key || `faq-${index}`;

              return (
                <FAQWrapper
                  key={itemId}
                  itemId={itemId}
                  className={styles.faqAccordionItem}
                  titleClassName={styles.faqAccordionQuestion}
                  iconClassName={styles.faqAccordionIcon}
                  iconSize={18}
                  iconStrokeWidth={1.8}
                >
                  <FAQTitle className="pb-0 justify-start gap-3" iconPosition="left" iconMode="rotate-left-down">
                    <h3 className={styles.faqAccordionQuestionHeading}>
                      {item.question}
                    </h3>
                  </FAQTitle>
                  <FAQContent className={`${styles.faqAccordionAnswer} pl-10`}>
                    {item.answer}
                  </FAQContent>
                </FAQWrapper>
              );
            })}
          </div>
        </FAQGroup>
      </section>
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
          <SanityBodyRenderer body={block.content || []} isLocked={isLocked} />
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

function LockedCodePlaceholder({ filename, language = "jsx" }) {
  return (
    <section className="fadeup overflow-hidden rounded-xl border border-white/10 bg-[#171717] text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#202020] px-5 py-3 max-sm:flex-col max-sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
          </span>

          <div className="min-w-0 flex flex-col items-start justify-between space-y-[-1vw]!">
            <p className="text-sm font-medium text-white">
              Pro source code locked
            </p>

            <p className="truncate text-xs text-white/45">
              {`Protected ${language.toUpperCase()} snippet`}
            </p>
          </div>
        </div>

        <Button
          text="Unlock Code"
          href="#"
          variant="orange"
          className="shrink-0"
          hoverTextClassName="group-hover:!text-primary group-hover:underline-none!"
          pillClassName="px-5 py-2 text-sm"
          circleWrapperClassName="hidden"
          showArrow={false}
          disableHoverShift
        />
      </div>

      <div className="relative p-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#171717]/50 to-[#171717]" />

        <div className="space-y-3 opacity-55 blur-[1px]">
          <div className="h-3 w-4/5 rounded-full bg-white/12" />
          <div className="h-3 w-3/5 rounded-full bg-white/10" />
          <div className="h-3 w-11/12 rounded-full bg-white/12" />
          <div className="h-3 w-2/3 rounded-full bg-white/10" />
          <div className="h-3 w-5/6 rounded-full bg-white/12" />
        </div>

        <div className="relative z-10 mt-7 rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/70">
          You can read the full implementation notes for this Pro effect. The
          copy-paste source code is available after upgrading.
        </div>
      </div>
    </section>
  );
}

function PortableTextBlock({ block, isLocked = false }) {
  if (isCodeOnlyBlock(block)) {
    const code = normalizeCodeString(getBlockText(block));

    if (!code.trim()) return null;

    if (isLocked) {
      return (
        <LockedCodePlaceholder language={inferCodeLanguage(code)} />
      );
    }

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

function TableOfContents({ containerRef, stopRef, watchKey }) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  const activeLockRef = useRef({
    id: "",
    targetTop: 0,
    timeoutId: null,
  });
  const scrollTweenRef = useRef(null);

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

    scrollTweenRef.current?.kill();

    const scrollState = {
      y: window.scrollY,
    };

    scrollTweenRef.current = gsap.to(scrollState, {
      y: targetTop,
      duration: 1.15,
      ease: "power3.out",
      onUpdate: () => {
        if (lenis) {
          lenis.scrollTo(scrollState.y, {
            immediate: true,
            force: true,
          });
          return;
        }

        window.scrollTo(0, scrollState.y);
      },
      onComplete: () => {
        scrollTweenRef.current = null;
      },
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

    const updateVisibility = () => {
      const rect = root.getBoundingClientRect();
      const stopRect = stopRef?.current?.getBoundingClientRect();
      const hasReachedStop = stopRect
        ? stopRect.top <= window.innerHeight * 0.65
        : false;

      setIsVisible(
        !hasReachedStop &&
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
  }, [containerRef, stopRef, watchKey]);

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
      scrollTweenRef.current?.kill();

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
                  "block h-0.5 rounded-full transition-all duration-300 ease-out",
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
