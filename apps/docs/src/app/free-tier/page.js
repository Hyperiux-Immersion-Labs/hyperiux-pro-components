import Link from "next/link";

export const metadata = {
  title: "Free Tier | Hyperiux UI",
  description: "Quick links for what’s available on the free tier",
};

const FREE_TIER_LINKS = [
  { label: "Helix Slider", href: "/effects/scroll-effects/helix-slider" },
  { label: "Milkyway Galaxy", href: "/effects/webgl-effects/milkyway" },
  { label: "Book flip", href: "/effects/webgl-effects/book-flip" },
  { label: "Split Canvas", href: "/effects/scroll-effects/split-canvas" },
  { label: "Stick Content Wrapper", href: "/effects/scroll-effects/sticky-content-wrapper" },
  { label: "Horizontal Scroll", href: "/effects/scroll-effects/horizontal-feature-reveal" },
  { label: "Infinite Perspective Slider", href: "/effects/scroll-effects/infinite-perspective-slider" },
  { label: "Phantom Image Trail", href: "/effects/cursor-effects/phantom-image-trail" },
  { label: "Pixelate Image Effect", href: "/effects/cursor-effects/pixelated-image-effect" },
  { label: "Spider Particles", href: "/effects/backgrounds/spider-particles" },
  { label: "Dotted Grid", href: "/effects/backgrounds/dotted-grid" },
  { label: "Chess Grid", href: "/effects/page-transitions/chess-grid-transition" },
  { label: "Overflow Stagger Text", href: "/effects/text-animations/overflow-stagger-text" },
  { label: "Text Convergence", href: "/effects/scroll-effects/text-convergence" },
  { label: "Rectangular Text Reveal", href: "/effects/text-animations/rectangular-text-reveal" },
  { label: "Scramble link Button", href: "/effects/buttons/scramble-link-button" },
  { label: "Link Button", href: "/effects/buttons/link-button" },
  { label: "Arrow Fill button", href: "/effects/buttons/arrow-fill-button" },
  { label: "Rotation slider", href: "/effects/scroll-effects/rotation-slider" },
 { label: "Circular Split Roll", href: "/effects/scroll-effects/circular-split-roll" },
  { label: "Zoom Slider", href: "/effects/carousels/zoom-slider" },
  { label: "Interactive List Preview", href: "/effects/components/interactive-list-preview" },
  { label: "Stack hovered cards", href: "/effects/components/hover-stack" },
  { label: "Gooey Counter", href: "/effects/components/gooey-counter" },
  { label: "Directional Menu", href: "/effects/navigation/directional-menu" },
  { label: "Elevate Navbar", href: "/effects/navigation/elevate-navbar" },
  { label: "Full Screen Navigation", href: "/effects/navigation/immersive-full-screen-nav" },
  { label: "Numeric Tunnel", href: "/effects/loaders/numeric-tunnel" },
  { label: "Stack loader", href: "/effects/loaders/stack-loader/" },
  { label: "Interactive Blur Reveal", href: "/effects/webgl-effects/interactive-blur-reveal" },
  { label: "Scroll Distortion", href: "/effects/scroll-effects/scroll-distortion" },
  { label: "Mouse Pixelation", href: "/effects/webgl-effects/mouse-pixelation" },
];

export default function FreeTierPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-semibold">Free tier</h1>
        <ul className="space-y-3">
          {FREE_TIER_LINKS.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
