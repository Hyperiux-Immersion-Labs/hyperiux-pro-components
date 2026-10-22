// Built using Hyperiux Vault: https://vault.hyperiux.com
import Image from "next/image";
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import { FadeUp, MaskReveal, PAGE_DELAY } from "../components/Animations/gsapAnim";
import TeamGrid from "../components/about/TeamGrid";
import Breadcrumb from "../components/shared/Breadcrumb";
import ParallaxImage from "../components/effects/parallax-image";
import SectionHead from "../components/shared/SectionHead";
import StatsRow from "../components/shared/StatsRow";
import founder from "../assets/founder.webp";
import studio1 from "../assets/studio-1.webp";
import studio2 from "../assets/studio-2.webp";

export const metadata = pageMetadata(
  "About | The Missing Pixel",
  "A senior brand and digital studio with homes in Delhi, London, Dubai and New York. Meet the team and what we believe.",
  "/about",
);

const page = () => (
  <>
    <section className="mpx-container flex flex-col gap-11 py-[3vw] max-lg:gap-8 max-lg:py-[6vw] max-md:gap-9 max-md:py-[10vw]">
      <div aria-hidden className="h-[12vh] max-lg:h-[8vh] max-md:h-[9vh]" />
      <Breadcrumb crumbs={[{ label: "Home", href: ROUTES.home }, { label: "About" }]} />
      <div className="grid grid-cols-12 items-end gap-x-12 gap-y-10 max-lg:gap-x-8">
        <MaskReveal as="h1" delay={PAGE_DELAY} className="col-span-8 max-lg:col-span-12">
          We noticed one missing pixel. Twelve years later, we’re still looking.
        </MaskReveal>
        <ParallaxImage
          image={founder}
          alt="Naina Sethi, founder of The Missing Pixel"
          sizes="(max-width: 768px) 90vw, (max-width: 1025px) 56vw, 31vw"
          priority
          className="col-span-4 col-start-9 row-span-2 aspect-[4/5] self-start rounded-2xl max-lg:col-span-12 max-lg:col-start-1 max-lg:row-auto max-lg:w-[56%] max-md:w-full"
        />
        <FadeUp delay={PAGE_DELAY + 0.3} className="col-span-6 flex flex-col gap-7 max-lg:col-span-12">
          <p className="text-28">
            I started the studio in Delhi in 2014 with one client and a hunch: small, senior teams make braver work than big agencies. Four cities and sixty people later, the hunch has held up.
          </p>
          <p className="text-28 text-mpx-muted">
            We work with founders, scale-ups and the occasional bank. What they share is something worth saying and the patience to say it properly.
          </p>
          <div className="flex flex-col gap-6">
            <div className="h-px w-full bg-black/10" />
            <div className="flex items-center gap-4">
              <div className="aspect-square h-[5.8vh] shrink-0 overflow-hidden rounded-full max-lg:h-[4.4vh] max-md:h-[6.2vh]">
                <Image src={founder} alt="" sizes="6vw" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <strong className="text-22 font-medium">Naina Sethi</strong>
                <span className="text-14 text-mpx-muted">Founder and chief creative officer</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>

    <div className="mpx-container">
      <div className="grid grid-cols-[7fr_5fr] gap-12 max-lg:gap-8 max-md:grid-cols-1 max-md:gap-5">
        <ParallaxImage
          image={studio1}
          alt="A design review in the London studio"
          className="aspect-[16/11] rounded-2xl"
          sizes="(max-width: 768px) 90vw, 56vw"
        />
        <ParallaxImage
          image={studio2}
          alt="Three colleagues by the window in the Dubai studio"
          className="rounded-2xl max-md:aspect-[16/11]"
          sizes="(max-width: 768px) 90vw, 40vw"
        />
      </div>
    </div>

    <section className="mpx-container mpx-section flex flex-col gap-14 max-lg:gap-11">
      <SectionHead title="What we believe" />
      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
        {VALUES.map((value, index) => (
          <FadeUp
            as="li"
            key={value.title}
            delay={index * 0.1}
            className="flex flex-col gap-6"
          >
            <div className="h-px w-full bg-black/30" />
            <div className="flex flex-col gap-3.5">
              <h3 className="text-30">{value.title}</h3>
              <p className="text-28 text-mpx-muted">{value.text}</p>
            </div>
          </FadeUp>
        ))}
      </ul>
      <StatsRow columns={4} items={STATS} />
    </section>

    <section id="team" className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead
        title="The people you’ll actually meet"
        text="Everyone on your project is in the first meeting. Nobody hands you to a junior team after the pitch."
      />
      <TeamGrid />
    </section>

    <section className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead title="Shelf space" text="Awards matter less than results. We keep these anyway." />
      <FadeUp>
        <ul className="flex flex-col border-b border-black/10">
          {AWARDS.map((award) => (
            <li
              key={`${award.year}-${award.name}`}
              className="flex items-start justify-between gap-9 border-t border-black/10 py-[1.4vw] max-lg:py-[2.6vw] max-md:flex-col max-md:gap-1 max-md:py-[5vw]"
            >
              <span className="w-[14%] text-28 text-mpx-muted max-md:w-full">{award.year}</span>
              <span className="font-mpx-head w-[46%] text-28 font-medium max-md:w-full">{award.name}</span>
              <span className="w-[30%] text-right text-28 text-mpx-muted max-md:w-full max-md:text-left">
                {award.project}
              </span>
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;

const VALUES = [
  {
    title: "Senior hands only",
    text: "Every project is led by a partner and staffed by people with at least six years behind them. The faces at the pitch are the faces doing the work.",
  },
  {
    title: "Fewer clients, fuller attention",
    text: "We cap ourselves at twelve live projects across four studios. Timelines stay honest and the phone always gets answered.",
  },
  {
    title: "Pretty isn’t the brief",
    text: "Beautiful is the minimum. We agree measurable goals on day one and report back after launch, good news or not.",
  },
];

const STATS = [
  { value: "2014", label: "founded in Delhi" },
  { value: "4", label: "studios: Delhi, London, Dubai, New York" },
  { value: "60", label: "people, all of them opinionated" },
  { value: "19", label: "languages spoken in the group chat" },
];

const AWARDS = [
  { year: "2026", name: "Pentawards, Silver", project: "Cloudline packaging" },
  { year: "2026", name: "Awwwards, Site of the Day", project: "Drift Campers" },
  { year: "2025", name: "D&AD, Wood Pencil", project: "Northway Records" },
  { year: "2025", name: "Brand New, Best of the Year", project: "Kickflip Supply" },
  { year: "2024", name: "Cannes Lions, Bronze", project: "Lumen Mobile launch" },
  { year: "2024", name: "Type Directors Club, Excellence", project: "Orbit Labs" },
];
