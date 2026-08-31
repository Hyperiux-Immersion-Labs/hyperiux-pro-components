"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TemplateCard } from "@/components/ui/TemplateCard";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp, useLineAnim } from "@/components/Animations/gsapAnimations";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";

// Design-only for now, per the Figma template detail page (Enigma-Redesign,
// node 4304:540) - mock data, no real registry/Sanity backing, no purchase
// flow. The Figma frame is a half-migrated duplicate of the Effect Detail
// page: only the breadcrumb/heading/description/dates/category badge were
// actually updated for a template (ElenaVoss); the big preview area and the
// entire "Related" section still showed leftover Arrow-Fill-Button/Related
// Effects content, so this mirrors effect-detail.jsx's structure/classNames
// instead of that stale markup, swapped to template-specific copy. The big
// preview area embeds the real, live template (/template-demo/<slug>) in an
// iframe with a device-size toggle, per md/sections-templates-plan.md §3's
// "iframe the existing live route" recommendation - same-origin, so no
// CSP/X-Frame-Options changes were needed (frame-src already allows 'self').
//
// The live templates size everything in vw/vh, calibrated against a real
// device viewport - so the iframe can't just be fluid-width'd to whatever
// the outer container happens to be (that reads as an arbitrary in-between
// width to the template's own CSS and its media queries). Each preset here
// is instead a genuine device viewport; the iframe always renders at that
// exact size, and the wrapper is CSS-scaled down to fit the visible box, so
// 1vw inside the frame always means "1% of a real 1920/768/390px device".
const DEVICE_PRESETS = {
  web: { label: "Web", icon: Monitor, width: 1920, height: 1080 },
  tablet: { label: "Tablet", icon: Tablet, width: 768, height: 1024 },
  mobile: { label: "Mobile", icon: Smartphone, width: 390, height: 844 },
};

function formatTemplateDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TemplateDetail({ template, relatedTemplates = [] }) {
  useFadeUp();
  useLineAnim();

  const [device, setDevice] = useState("web");
  const [scale, setScale] = useState(1);
  const previewBoxRef = useRef(null);

  const publishedLabel = formatTemplateDate(template.publishedAt);
  const updatedLabel = formatTemplateDate(template.updatedAt);
  const preset = DEVICE_PRESETS[device];

  useEffect(() => {
    const box = previewBoxRef.current;

    if (!box) return;

    const updateScale = () => {
      const nextScale = Math.min(
        box.clientWidth / preset.width,
        box.clientHeight / preset.height,
        1
      );

      setScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(box);

    return () => observer.disconnect();
  }, [preset.width, preset.height]);

  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto w-full relative px-14 max-[1025px]:px-0 pt-25 pb-12 max-md:pt-36">
        <section className="space-y-7">
          <div className="flex items-start max-md:px-[7vw] max-[1025px]:px-[6vw] justify-between gap-5">
            <div className="w-full space-y-5">
              <Breadcrumb />

              <HeadAnim>
                <h1 className="w-full max-md:text-[6vw] max-md:font-bold max-[1025px]:w-[90%] max-md:w-[80%] max-[1025px]:mx-auto max-[1025px]:text-center font-semibold leading-[1.3]! text-foreground text80">
                  {template.title}
                </h1>
              </HeadAnim>

              {template.tagline && (
                <Copy delay={0.5}>
                  <p className="mt-4 w-full max-[1025px]:text-center max-[1025px]:w-[90%] max-[1025px]:mx-auto text-foreground opacity-90 text22 leading-relaxed max-[1025px]:leading-[1.3]">
                    {template.tagline}
                  </p>
                </Copy>
              )}

              {(publishedLabel || updatedLabel) && (
                <div className="mt-5 flex flex-wrap items-start gap-x-5 gap-y-1 text18 text-white/80 max-sm:text-[3vw]!">
                  {publishedLabel && (
                    <div className="fadeup">
                      <span className="font-laygrotesk">Published On: </span>
                      {publishedLabel}
                    </div>
                  )}
                  {updatedLabel && (
                    <div className="fadeup">
                      <span className="font-laygrotesk">Last Updated: </span>
                      {updatedLabel}
                    </div>
                  )}
                </div>
              )}

              {template.category && (
                <div className="fadeup mt-5 inline-block w-fit bg-[#272727] px-3 py-1.5 text20 text-foreground">
                  {template.category}
                </div>
              )}
            </div>
          </div>

          <div className="fadeup max-md:px-[7vw] max-[1025px]:px-[6vw] w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-1 bg-[#161616] p-1">
                {Object.entries(DEVICE_PRESETS).map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDevice(key)}
                    aria-pressed={device === key}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 text18 transition-colors ${device === key ? "bg-primary text-white" : "text-white/60 hover:text-white"
                      }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              <ButtonV3
                text="Open in New Tab"
                href={template.previewHref}
                target_blank={true}
                target="_blank"
                variant="orange"
                className="shrink-0"
              />
            </div>

            <div
              ref={previewBoxRef}
              className="relative flex h-[46vw] max-h-[820px] min-h-[520px] w-full items-center justify-center overflow-hidden bg-[#111111] max-md:h-[70vh]"
            >
              <div
                style={{
                  width: preset.width,
                  height: preset.height,
                  transform: `scale(${scale})`,
                }}
                className="shrink-0 origin-center bg-white transition-transform duration-300"
              >
                <iframe
                  key={`${template.previewHref}-${device}`}
                  src={template.previewHref}
                  title={`${template.title} live preview`}
                  width={preset.width}
                  height={preset.height}
                  className="block border-0"
                />
              </div>
            </div>
          </div>

          {template.overview?.length > 0 && (
            <div className="relative max-md:px-[7vw] max-[1025px]:px-[6vw] pt-[1.5vw]">
              <div className="space-y-6 w-[70%] max-[1025px]:w-full">
                <HeadAnim>
                  <h2 className="text32 font-medium text-foreground">Overview</h2>
                </HeadAnim>

                <div className="fadeup space-y-4">
                  {template.overview.map((paragraph, index) => (
                    <p key={index} className="text18 text-muted leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {relatedTemplates.length > 0 && (
            <section className="my-20 relative max-md:pt-[5vh] space-y-10 max-[1025px]:space-y-16">
              <div className="flex items-center justify-between gap-5 max-[1025px]:flex-col">
                <HeadAnim>
                  <h2 className="text-[3.32vw] max-[1025px]:text-[5vw] max-md:text-[2rem] font-medium text-foreground">
                    Related Templates
                  </h2>
                </HeadAnim>

                <div className="fadeup flex flex-col justify-center items-end gap-5 max-[1025px]:w-full max-[1025px]:items-stretch">
                  <ButtonV3
                    text="Explore all templates"
                    href="/templates"
                    variant="orange"
                    className="shrink-0"
                  />
                </div>
              </div>

              <div className="fadeup grid grid-cols-2 gap-6 max-md:px-[7vw] max-[1025px]:px-[6vw] max-md:grid-cols-1">
                {relatedTemplates.map((relatedTemplate) => (
                  <TemplateCard key={relatedTemplate.slug} template={relatedTemplate} />
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
