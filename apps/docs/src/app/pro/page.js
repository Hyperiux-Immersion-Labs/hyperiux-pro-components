import Link from "next/link";
import { createPageMetadata } from "@/lib/seo-metadata";

export const metadata = createPageMetadata({
  title: "Pro | Hyperiux UI",
  description: "Browse all pro component demos",
  path: "/demo",
});

const PRO_ROUTES = [
  "/3d-portfolio-slider",
  "/book-flip",
  "/svg-brush-transition",
  "/page-flip-transition",
  "/parallax-gallery",
  "/full-screen-crosshair",
  "/glitchy-text",
  "/infinite-grid-gallery",
  "/hover-slider",
  "/magnetic-image-trail",
  "/mask-text-reveal",
  "/modal",
  "/noise-ripple-cursor",
  "/overflow-text-reveal",
  "/parallax-footer",
  "/parallax-image-animation",
  "/perspective-text-reveal",
  "/radial-slice-transition",
  "/pixel-bloom",
  "/pixel-random",
  "/pixels",
  "/ribbon-drift",
  "/ring-carousel",
  "/scramble-text",
  "/scroll-shuffled-cards",
  "/slide-text-reveal",
  // "/smooth-scroll-animation",
  "/spotlight-text",
  "/square-translate",
  "/stacking-cards",
  "/strip-slider",
  "/svg-path",
  "/svg-pixel-reveal",
  "/tabs",
  "/testimonial",
  "/text-cloning",
  "/text-hover",
  "/text-stream",
  "/video-player",
  "/webgl-slider",
];

function formatLabel(route) {
  return route
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(" / ");
}

export default function ProPage() {
  const routes = [...PRO_ROUTES].sort((a, b) => a.localeCompare(b));

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 text-4xl font-semibold">Pro components</h1>
        <p className="mb-8 text-sm text-black/70">
          {routes.length} static routes
        </p>

        <ul className="space-y-5">
          {routes.map((route) => (
            <li
              key={route}
              className="rounded-2xl border border-black/10 px-4 py-3 transition-colors hover:bg-black/3 text-center"
            >
              <Link
                target="_blank"
                href={`/demo${route}`}
                className="flex flex-col gap-1  transition-opacity hover:opacity-70"
              >
                <span className="text-lg font-medium">{formatLabel(route)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
