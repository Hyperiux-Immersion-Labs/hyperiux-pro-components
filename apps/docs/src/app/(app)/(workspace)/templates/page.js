import { Breadcrumb } from "@/components/ui/Breadcrumb";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { createPageMetadata } from "@/lib/seo-metadata";
import { TEMPLATES } from "@/lib/mock-templates";
import { TemplatesGrid } from "./TemplatesGrid";

// Design-only for now, per the Figma listing page (Enigma-Redesign,
// node 4304:231) - mock data, no real registry/Sanity backing, no
// purchase flow. Noindex until real templates exist. Access control
// (annual-Pro included, everyone else buys separately) is a per-template
// detail-page concern, not a listing-page one - see md/sections-templates-plan.md.
//
// Header block (breadcrumb / heading / description) reuses the exact
// classNames from effects/vault-content.jsx so this page matches /effects
// pixel-for-pixel. The filter chip row + grid live in TemplatesGrid (a
// client component, styled the same way as vault-content.jsx's own category
// chips) since this file stays a server component for its `metadata` export.
export const metadata = createPageMetadata({
  title: "Templates | Hyperiux Vault",
  description: "Full page templates for React & Next.js - agency, portfolio, and industry-specific starters.",
  path: "/templates",
  robots: { index: false, follow: false },
});

const DESCRIPTION =
  "Full page templates for React & Next.js - agency, portfolio, and industry-specific starters. Preview live, then buy and download.";

export default function TemplatesPage() {
  return (
    <div className="relative min-h-screen text-foreground effects-comp border-b border-white/10">
      <div className="px-14 pt-28 pb-12 space-y-8 max-md:px-7 max-md:pt-32 max-md:pb-16">
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

      <TemplatesGrid templates={TEMPLATES} />
    </div>
  );
}
