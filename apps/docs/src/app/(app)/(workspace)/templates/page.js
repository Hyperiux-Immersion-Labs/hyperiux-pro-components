import { EffectCard } from "@/components/ui/EffectCardNew";
import { createPageMetadata } from "@/lib/seo-metadata";

// Design-only for now, per the Figma listing page (Enigma-Redesign,
// node 4304:231) - mock data, no real registry/Sanity backing, no
// purchase flow. Noindex until real templates exist. Access control
// (annual-Pro included, everyone else buys separately) is a per-template
// detail-page concern, not a listing-page one - see md/sections-templates-plan.md.
export const metadata = createPageMetadata({
  title: "Templates | Hyperiux Vault",
  description: "Full page templates for React & Next.js - agency, portfolio, and industry-specific starters.",
  path: "/templates",
  robots: { index: false, follow: false },
});

// Placeholder art, not real Hyperiux templates - swap for real entries once
// the registry/Sanity side of the plan is built.
const MOCK_TEMPLATES = [
  {
    slug: "sample-template-one",
    title: "Sample Template One",
    category: "Portfolio",
    tier: "pro",
    tags: ["WebGL", "Scroll"],
    installCount: 1400,
    screenshots: ["/mock/templates/t1-main.png", "/mock/templates/t1-collage-1.png", "/mock/templates/t1-collage-2.png"],
  },
  {
    slug: "sample-template-two",
    title: "Sample Template Two",
    category: "SaaS",
    tier: "pro",
    tags: ["WebGL"],
    installCount: 860,
    screenshots: ["/mock/templates/t2-main.png"],
  },
  {
    slug: "sample-template-three",
    title: "Sample Template Three",
    category: "Real Estate",
    tier: "free",
    tags: ["Scroll Effects"],
    installCount: 320,
    screenshots: ["/mock/templates/t3-main.png"],
  },
  {
    slug: "sample-template-four",
    title: "Sample Template Four",
    category: "SaaS",
    tier: "free",
    tags: ["Section Transition"],
    installCount: 95,
    screenshots: ["/mock/templates/t4-main.png"],
  },
];

export default function TemplatesPage() {
  return (
    <main className="w-full px-[3.5vw] pb-[6vw] pt-[9vw] max-[1025px]:pt-[14vw] max-md:px-6 max-md:pt-24">
      <p className="text18 text-white/50">Home / Templates</p>
      <h1 className="mt-2 font-sans text-[3.5vw] font-medium leading-[1.1] text-white max-md:text-4xl">
        Hyperiux Vault Templates
      </h1>
      <p className="mt-4 max-w-2xl text18 text-white/60">
        Full page templates for React &amp; Next.js - agency, portfolio, and industry-specific
        starters. Design preview only for now - purchase and download aren&apos;t live yet.
      </p>

      <div className="mt-[3vw] grid grid-cols-1 gap-x-[1.5vw] gap-y-[3vw] sm:grid-cols-2 max-md:mt-10 max-md:gap-y-10">
        {MOCK_TEMPLATES.map((template, index) => (
          <EffectCard
            key={template.slug}
            effect={{
              name: template.slug,
              title: template.title,
              category: template.category,
              tier: template.tier,
              tags: template.tags,
              installCount: template.installCount,
            }}
            screenshots={template.screenshots}
            href="#"
            previewHref="#"
            priority={index === 0}
          />
        ))}
      </div>
    </main>
  );
}
