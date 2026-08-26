import { EffectCard } from "@/components/ui/EffectCardNew";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { createPageMetadata } from "@/lib/seo-metadata";

// Design-only for now, per the Figma listing page (Enigma-Redesign,
// node 4304:231) - mock data, no real registry/Sanity backing, no
// purchase flow. Noindex until real templates exist. Access control
// (annual-Pro included, everyone else buys separately) is a per-template
// detail-page concern, not a listing-page one - see md/sections-templates-plan.md.
//
// Header block (breadcrumb / heading / description) and grid deliberately
// reuse the exact classNames from effects/vault-content.jsx so this page
// matches /effects pixel-for-pixel - filter/category chips and the layout
// (2/3 column) toggle are skipped for now, not enough templates yet to
// need them.
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

const DESCRIPTION =
  "Full page templates for React & Next.js - agency, portfolio, and industry-specific starters. Preview live, then buy and download.";

export default function TemplatesPage() {
  return (
    <div className="relative min-h-screen text-foreground effects-comp border-b border-white/10">
      <div className="px-8 pt-28 pb-12 space-y-8 max-md:px-7 max-md:pt-32 max-md:pb-16">
        <Breadcrumb className="fadeup" />

        <HeadAnim animateOnScroll={false} delay={0.3}>
          <h1
            className="mb-4 w-[80%] leading-normal t96 font-display font-normal text-foreground max-md:w-[90%] max-md:text-4xl"
            style={{ lineHeight: "1.3" }}
          >
            Hyperiux Vault Templates
          </h1>
        </HeadAnim>

        <div className="category-fadeup flex max-w-[55vw] flex-col text-lg text-muted max-[1025px]:max-w-full max-md:text-base">
          <Copy delay={0.6}>
            <p className="mt-3">{DESCRIPTION}</p>
          </Copy>
        </div>
      </div>

      <div className="mx-auto px-10 pt-20 pb-12 max-md:px-0 max-[1025px]:pt-10">
        <div className="grid grid-cols-2 gap-6 rounded-xl max-[1025px]:grid-cols-1 max-md:grid-cols-1 max-md:px-[7vw] max-[1025px]:gap-10 max-md:gap-16">
          {MOCK_TEMPLATES.map((template, index) => (
            <div key={template.slug} className="effect-card-shell">
              <EffectCard
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
