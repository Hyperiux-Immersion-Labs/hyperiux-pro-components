import Link from "next/link";
import VaultShell from "@/Layouts/VaultShell";
import Hero from "@/components/Pricing/Hero";
import Pricing from "@/components/LandingPage/Pricing";
import GlowingPlates from "@/Experience/GlowingPlates";
import CTA from "@/components/LandingPage/CTA";
import Footer from "@/components/LandingPage/Footer";

export const metadata = {
  title: "Hyperiux Vault Pricing | Pro React Effects Library",
  description: "Get unlimited access to premium, highly interactive React and Tailwind components. Elevate your website design with fluid animations, custom cursors, and advanced WebGL components.",
};

const PRIORITY_CATEGORIES = [
  {
    title: "Scroll Effects",
    description: "Immersive fanning stacks, pinning chapters, and direction-aware layout stories.",
    href: "/effects/scroll-effects",
    badge: "Most Popular",
  },
  {
    title: "Cursor Effects",
    description: "Tactile glass lenses, WebGL physics trails, and image-following fluid depth.",
    href: "/effects/cursor-effects",
    badge: "Atmospheric",
  },
  {
    title: "WebGL & 3D",
    description: "Advanced shader-led components, fractal bloom tunnels, and interactive scenes.",
    href: "/effects/webgl-effects",
    badge: "Ultra Premium",
  },
  {
    title: "Text Animations",
    description: "Scramble decodes, clip-path slide reveals, and real semantic typographic reveals.",
    href: "/effects/text-animations",
    badge: "Sleek Polish",
  },
];

export default function PricingPage() {
  return (
    <>
      <VaultShell>
        <Hero />
        <GlowingPlates waitForLoader={false} />
        <Pricing enableColorSwitch={false} />

        {/* Priority Pro Categories Grid Section */}
        <section className="mx-auto max-w-6xl px-10 py-24 text-center max-md:px-6 max-sm:px-7">
          <h2 className="text-3xl font-semibold text-white tracking-tight sm:text-4xl">
            Explore Pro Categories
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Get complete source access and CLI install keys for all interactions under our core premium categories.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRIORITY_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#111111] p-6 text-left transition-all duration-300 hover:border-primary/40 hover:bg-[#161616]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {cat.badge}
                    </span>
                    <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary">
                      →
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white transition-colors group-hover:text-primary">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        <CTA />
        <Footer />
      </VaultShell>
    </>
  );
}
