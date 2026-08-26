import { EffectCard } from "@/components/ui/EffectCardNew";

export const metadata = {
  title: "Template Card (Test)",
  robots: { index: false, follow: false },
};

// Scratch verification page for the Templates listing-card visual, per the
// Figma design (Enigma-Redesign, node 4304:231). No real template data or
// backend yet - screenshots are placeholder art, not real Hyperiux
// templates. Card component work lives in EffectCardNew.jsx (screenshots/
// href/previewHref props); this page only exists to render it for review.
const MOCK_TEMPLATES = [
  {
    effect: { title: "Sample Template One", category: "Portfolio", tier: "pro", tags: ["WebGL", "Scroll"], installCount: 1400 },
    screenshots: ["/mock/templates/t1-main.png", "/mock/templates/t1-collage-1.png", "/mock/templates/t1-collage-2.png"],
  },
  {
    effect: { title: "Sample Template Two", category: "SaaS", tier: "pro", tags: ["WebGL"], installCount: 860 },
    screenshots: ["/mock/templates/t2-main.png"],
  },
  {
    effect: { title: "Sample Template Three", category: "Real Estate", tier: "free", tags: ["Scroll Effects"], installCount: 320 },
    screenshots: ["/mock/templates/t3-main.png"],
  },
  {
    effect: { title: "Sample Template Four", category: "SaaS", tier: "free", tags: ["Section Transition"], installCount: 95 },
    screenshots: ["/mock/templates/t4-main.png"],
  },
];

export default function TemplateCardTestPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold md:text-4xl">Template Card (scratch)</h1>
        <p className="mt-2 text-sm text-white/50">
          Visual check only - placeholder images, no real template content or purchase flow yet.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {MOCK_TEMPLATES.map((item, i) => (
            <EffectCard
              key={i}
              effect={item.effect}
              screenshots={item.screenshots}
              href="#"
              previewHref="#"
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
