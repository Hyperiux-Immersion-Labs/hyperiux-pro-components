import Image from "next/image";
import Link from "next/link";
import ContextShiftMenu from "@/components/contect-shift-menu";

const WORK = [
  {
    title: "Spotlight Text",
    category: "Text",
    year: "2026",
    src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Unfold Navbar",
    category: "Navigation",
    year: "2026",
    src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Arc Flow Carousel",
    category: "Carousels",
    year: "2025",
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Block Transition",
    category: "Transitions",
    year: "2025",
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80",
  },
];

const STATS = [
  { value: "120+", label: "Production effects" },
  { value: "12", label: "Categories" },
  { value: "MIT", label: "Licensed" },
];

export default function Page() {
  return (
    <ContextShiftMenu>
      {/* Hero */}
      <section className="flex min-h-screen flex-col justify-end gap-[3vw] px-[2.1vw] py-[6vw] max-[1025px]:px-[3vw] max-md:gap-[8vw] max-md:px-[5vw] max-md:py-[16vw]">
        <p className="text-[0.8vw] font-normal tracking-[0.18em] text-[#111111]/50 uppercase max-[1025px]:text-[1.5vw] max-md:text-[3vw]">
          Hyperiux — Pro Components
        </p>
        <h1 className="m-0 max-w-[75vw] text-[7vw] leading-[0.92] font-light tracking-[-0.04em] text-[#111111] max-[1025px]:max-w-full max-[1025px]:text-[9vw] max-md:text-[13vw]">
          Motion components
          <br />
          you can ship
          <br />
          the same day.
        </h1>
        <div className="flex items-end justify-between gap-[2vw] max-md:flex-col max-md:items-start max-md:gap-[5vw]">
          <p className="max-w-[28vw] text-[1vw] leading-[1.6] font-light text-[#111111]/60 max-[1025px]:max-w-[50vw] max-[1025px]:text-[1.8vw] max-md:max-w-full max-md:text-[3.8vw]">
            A library of production-ready GSAP and React effects — copy the
            source, drop it in, keep the motion.
          </p>
          <span className="text-[0.75vw] tracking-[0.14em] text-[#111111]/40 uppercase max-[1025px]:text-[1.4vw] max-md:text-[3vw]">
            Scroll
          </span>
        </div>
      </section>

      {/* Selected effects */}
      <section className="flex flex-col gap-[3vw] px-[2.1vw] py-[6vw] max-[1025px]:px-[3vw] max-md:gap-[8vw] max-md:px-[5vw] max-md:py-[16vw]">
        <div className="flex items-baseline justify-between gap-[2vw] border-t border-[#111111]/15 py-[1.5vw] max-md:py-[4vw]">
          <h2 className="m-0 text-[2.4vw] leading-[1.1] font-light tracking-[-0.03em] text-[#111111] max-[1025px]:text-[4vw] max-md:text-[7vw]">
            Selected work
          </h2>
          <span className="text-[0.75vw] tracking-[0.14em] text-[#111111]/40 uppercase max-[1025px]:text-[1.4vw] max-md:text-[3vw]">
            {WORK.length} effects
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[2vw] max-md:grid-cols-1 max-md:gap-[8vw]">
          {WORK.map((item) => (
            <article key={item.title} className="group flex flex-col gap-[1vw] max-md:gap-[3vw]">
              <div className="h-[24vw] w-full overflow-hidden bg-[#111111]/5 max-md:h-[60vw]">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={1400}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-800 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-[1vw]">
                <h3 className="m-0 text-[1.3vw] font-normal tracking-[-0.02em] text-[#111111] max-[1025px]:text-[2.2vw] max-md:text-[5vw]">
                  {item.title}
                </h3>
                <span className="text-[0.75vw] tracking-[0.12em] text-[#111111]/45 uppercase max-[1025px]:text-[1.4vw] max-md:text-[3vw]">
                  {item.category} — {item.year}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="flex flex-col gap-[2vw] px-[2.1vw] py-[6vw] max-[1025px]:px-[3vw] max-md:gap-[6vw] max-md:px-[5vw] max-md:py-[16vw]">
        <div className="grid grid-cols-3 gap-[2vw] border-t border-[#111111]/15 py-[3vw] max-md:grid-cols-1 max-md:gap-[6vw] max-md:py-[8vw]">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-[0.5vw] max-md:gap-[2vw]">
              <span className="text-[4vw] leading-[1] font-light tracking-[-0.04em] text-[#111111] max-[1025px]:text-[6vw] max-md:text-[14vw]">
                {stat.value}
              </span>
              <span className="text-[0.8vw] tracking-[0.12em] text-[#111111]/50 uppercase max-[1025px]:text-[1.5vw] max-md:text-[3.2vw]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="flex min-h-screen flex-col justify-between gap-[4vw] px-[2.1vw] py-[6vw] max-[1025px]:px-[3vw] max-md:gap-[10vw] max-md:px-[5vw] max-md:py-[16vw]">
        <h2 className="m-0 max-w-[70vw] text-[4.5vw] leading-[1.02] font-light tracking-[-0.04em] text-[#111111] max-[1025px]:max-w-full max-[1025px]:text-[6.5vw] max-md:text-[11vw]">
          Open the menu — the page holds its place.
        </h2>
        <div className="flex items-end justify-between gap-[2vw] border-t border-[#111111]/15 py-[1.5vw] max-md:flex-col max-md:items-start max-md:gap-[4vw] max-md:py-[5vw]">
          <Link
            href="mailto:hello@hyperiux.com"
            className="text-[1.6vw] font-light tracking-[-0.02em] text-[#111111] no-underline max-[1025px]:text-[2.8vw] max-md:text-[6vw]"
          >
            hello@hyperiux.com
          </Link>
          <span className="text-[0.75vw] tracking-[0.14em] text-[#111111]/40 uppercase max-[1025px]:text-[1.4vw] max-md:text-[3vw]">
            © 2026 Hyperiux
          </span>
        </div>
      </section>
    </ContextShiftMenu>
  );
}
