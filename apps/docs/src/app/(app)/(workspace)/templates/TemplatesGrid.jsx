"use client";

import { useMemo, useState } from "react";
import { TemplateCard } from "@/components/ui/TemplateCard";

function formatLabel(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Client-only (page.js stays a server component so its `metadata` export
// keeps working) filter row + grid, styled and behaving like
// effects/vault-content.jsx's own category chips - `template.category` is
// templates' equivalent of an effect's category, doubling as the
// industry/vertical label ("Portfolio", "Healthcare", "Real Estate", ...).
// No dedicated per-category route exists for templates (unlike
// /effects/[slug]), so filtering is plain client-side state rather than a
// URL param - just the chip row's look/toggle behavior is what's being
// matched here.
export function TemplatesGrid({ templates }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const seen = new Set();
    const list = [];

    for (const template of templates) {
      if (template.category && !seen.has(template.category)) {
        seen.add(template.category);
        list.push(template.category);
      }
    }

    return list;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "all") return templates;
    return templates.filter((template) => template.category === activeCategory);
  }, [templates, activeCategory]);

  return (
    <>
      {categories.length > 1 && (
        <div className="mx-auto px-14 pb-7 pt-20 max-md:px-0 max-[1025px]:pt-10">
          <div className="relative max-[1025px]:w-full flex items-start gap-4">
            <div className="relative min-w-0 flex-1">
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 hidden w-12 max-[1025px]:block"
                style={{
                  background:
                    "linear-gradient(to left, var(--background, #000) 0%, transparent 100%)",
                }}
              />

              <div
                className={[
                  "flex items-center gap-2.5",
                  "flex-wrap",
                  "max-[1025px]:flex-nowrap max-[1025px]:overflow-x-auto max-[1025px]:px-6",
                  "scrollbar-thin [scrollbar-color:#CC4C04_transparent]",
                  "[&::-webkit-scrollbar]:h-1",
                  "[&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:",
                  "[&::-webkit-scrollbar-thumb]:bg-[#CC4C04] [&::-webkit-scrollbar-thumb]:",
                  "max-[1025px]:pb-3",
                ].join(" ")}
              >
                {categories.map((category) => {
                  const isSelected = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(isSelected ? "all" : category)
                      }
                      className={`
                        px-6 py-2.5 text-[1vw] text-center relative max-md:px-5 max-md:py-2
                        backdrop-blur-[6px] font-geistMono group flex items-center cursor-pointer
                        transition-colors duration-300
                        ${isSelected
                          ? "bg-[#ff5f00] text-black hover:text-black hover:bg-[#ff5f00]"
                          : "bg-[#161616] text-[#FFFFFF] hover:text-black hover:bg-[#ff5f00]"
                        }
                      `}
                    >
                      <span className="leading-none">{formatLabel(category)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto px-14 pb-12 max-md:px-0">
        <div className="grid grid-cols-2 gap-4 rounded-xl max-[1025px]:grid-cols-1 max-md:grid-cols-1 max-md:px-[7vw] max-[1025px]:gap-10 max-md:gap-16">
          {filteredTemplates.map((template, index) => (
            <TemplateCard key={template.slug} template={template} priority={index === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
