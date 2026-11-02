import Link from "next/link";
import { createPageMetadata } from "@/lib/seo-metadata";


// The new shader backgrounds aren't in the registry yet - this indexes their /demo pages
const BACKGROUNDS = [
  { slug: "aurora-ribbon", title: "Aurora Ribbon", author: "Hitesh", description: "A drifting ribbon of aurora light with film grain that the pointer stirs." },
  { slug: "violet-arc", title: "Violet Arc", author: "Hitesh", description: "A soft violet arc of light that the pointer stirs like ink in water." },
  { slug: "ascii-band", title: "ASCII Band", author: "Hitesh", description: "A band of light drawn in flickering ASCII characters." },
  { slug: "ascii-dome", title: "ASCII Dome", author: "Hitesh", description: "A red-to-violet dome of light rendered in flickering ASCII characters." },
  { slug: "flower-field", title: "Flower Field", author: "Hitesh", description: "A 3D meadow of wood anemones that bloom and sway under the pointer." },
  { slug: "moss-grid", title: "Moss Grid", author: "Hitesh", description: "Rolling hills of shimmering grid lights revealed around the pointer." },
  { slug: "neon-streak", title: "Neon Streak", author: "Hitesh", description: "The pointer draws twisting pink-violet light streaks over drifting smoke; idle, it draws a neon ring." },
  { slug: "opal-flow", title: "Opal Flow", author: "Hitesh", description: "A periwinkle ground with a pink-to-peach ribbon and cyan wisps that smear under the pointer." },
  { slug: "creepy-bg", title: "Creepy BG", author: "Ishita", description: "Warped clouds that burn from blue to red, with coloured smoke trailing the cursor." },
  { slug: "grassy-bg", title: "Grassy BG", author: "Ishita", description: "Wind-blown grass over slowly shifting rolling hills." },
];


export const metadata = createPageMetadata({
  title: "Shader Backgrounds | Hyperiux Vault",
  description: "New WebGL shader backgrounds from the Hyperiux Vault team.",
  path: "/shader-background",
  robots: { index: false, follow: false },
});


export default function ShaderBackgroundPage() {
  return (
    <main className="min-h-screen w-full bg-black px-[5vw] py-[8vw] text-white max-md:py-[20vw]">
      <h1 className="text-[3.5vw] font-bold leading-[1.1] max-md:text-[9vw]">Shader Backgrounds</h1>
      <p className="mt-[1vw] text-[1.1vw] text-white/60 max-md:mt-[3vw] max-md:text-[4vw]">
        {BACKGROUNDS.length} new backgrounds by Hitesh and Ishita.
      </p>


      <ol className="mt-[3vw] grid grid-cols-2 gap-[1.2vw] max-md:mt-[8vw] max-md:grid-cols-1 max-md:gap-[4vw]">
        {BACKGROUNDS.map((bg, i) => (
          <li key={bg.slug}>
            <Link
              href={`/demo/${bg.slug}`}
              className="flex h-full flex-col gap-[0.6vw] rounded-[0.8vw] border border-white/10 p-[1.6vw] transition-colors hover:border-white/40 hover:bg-white/5 max-md:gap-[2vw] max-md:rounded-[3vw] max-md:p-[5vw]"
            >
              <span className="flex items-baseline justify-between text-[0.9vw] text-white/40 max-md:text-[3.5vw]">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>by {bg.author}</span>
              </span>
              <span className="text-[1.6vw] font-semibold max-md:text-[6vw]">{bg.title}</span>
              <span className="text-[1vw] text-white/60 max-md:text-[3.8vw]">{bg.description}</span>
              <span className="mt-auto pt-[0.6vw] text-[0.9vw] text-white/40 max-md:pt-[2vw] max-md:text-[3.5vw]">/demo/{bg.slug} →</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}