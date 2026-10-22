// Built using Hyperiux Vault: https://vault.hyperiux.com
import Link from "next/link";
import { pageMetadata } from "../../metadata";
import { ROUTES } from "../../routes";
import { FadeUp, MaskReveal } from "../../components/Animations/gsapAnim";
import AnimatedFaq from "../../components/effects/animated-faq";
import PixelButton from "../../components/Buttons/PixelButton";
import { ArrowRight, Check } from "../../components/Buttons/icons";
import Facts from "../../components/shared/Facts";
import PageHero from "../../components/shared/PageHero";
import ParallaxImage from "../../components/effects/parallax-image";
import Pricing from "../../components/services/Pricing";
import QuoteBlock from "../../components/shared/QuoteBlock";
import SectionHead from "../../components/shared/SectionHead";
import Split from "../../components/shared/Split";
import SubNav from "../../components/services/SubNav";
import { WorkListCard, type Project } from "../../components/work/WorkGrid";
import northway from "../../assets/w-northway.webp";
import cloudline from "../../assets/w-cloudline.webp";
import drift from "../../assets/w-drift.webp";
import founder from "../../assets/founder.webp";

export const metadata = pageMetadata(
  "Brand identity | The Missing Pixel",
  "A complete brand identity from first conversation to last guideline, built to work everywhere your brand turns up.",
  "/services/brand-identity",
);

const page = () => (
  <>
    <PageHero
      crumbs={[
        { label: "Home", href: ROUTES.home },
        { label: "Services", href: ROUTES.services },
        { label: "Brand identity" },
      ]}
      title="Brand identity"
      text="A complete identity, from the first conversation to the last guideline, built to work everywhere your brand turns up."
    >
      <div className="flex flex-wrap gap-3">
        <PixelButton label="Book An Intro Call" href={ROUTES.contact} icon />
        <PixelButton label="See Pricing" href="#pricing" variant="outline" />
      </div>
    </PageHero>
    <div className="mpx-container flex flex-col gap-14 max-lg:gap-11">
      <Facts
        items={[
          { label: "Timeline", value: "8 to 12 weeks" },
          { label: "From", value: "$18,000" },
          { label: "Team", value: "4 to 6 seniors" },
          { label: "Best for", value: "New brands and rebrands" },
        ]}
      />
      <ParallaxImage
        image={northway}
        alt="Portrait lit by a huge orange sun"
        className="aspect-video rounded-3xl"
        priority
      />
    </div>
    <div aria-hidden className="h-[8vh]" />
    <SubNav links={LINKS} />

    <section id="overview" className="mpx-container mpx-section flex flex-col gap-14 max-lg:gap-11">
      <FadeUp>
        <Split title="Overview">
          <p className="text-28">
            People judge your brand before they read a word. We make sure the first impression is the right one, and that it survives the second, third and hundredth.
          </p>
          <p className="text-28 text-mpx-muted">
            Every project starts with strategy, because no logo can rescue a muddled story. Once we know what you stand for, we design a system that says it everywhere, from a favicon to a trade-show stand.
          </p>
          <CheckList items={OUTCOMES} />
        </Split>
      </FadeUp>
      <FadeUp>
        <Split title="Who it’s for">
          <ul className="flex flex-col">
            {FIT.map((item) => (
              <li key={item.title} className="flex flex-col gap-3 border-t border-black/10 py-[1.6vw] max-lg:py-[3vw] max-md:py-[5vw]">
                <h3 className="text-30">{item.title}</h3>
                <p className="text-28 text-mpx-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </Split>
      </FadeUp>
    </section>

    <section id="deliverables" className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead
        title="What you get"
        text="Everything arrives as editable source files. The exact list depends on your tier."
      />
      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
        {DELIVERABLES.map((group, index) => (
          <FadeUp
            as="li"
            key={group.title}
            delay={index * 0.1}
            className="flex flex-col gap-5 border-t border-black/30 py-[1.4vw] max-lg:py-[3vw] max-md:py-[5vw]"
          >
            <h3 className="text-30">{group.title}</h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item} className="text-24 text-mpx-muted">
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>
        ))}
      </ul>
    </section>

    <section id="approach" className="mpx-container">
      <div className="flex flex-col gap-14 rounded-3xl bg-[#0a0a0a] px-[4vw] py-[5vw] text-[#f5f5f5] max-lg:gap-11 max-lg:px-[5vw] max-lg:py-[8vw] max-md:px-[6vw] max-md:py-[12vw]">
        <div className="flex items-end justify-between gap-9 max-lg:flex-col max-lg:items-start max-lg:gap-5">
          <MaskReveal as="h2" className="w-[55%] max-lg:w-full">
            Our approach
          </MaskReveal>
          <FadeUp className="w-[32%] max-lg:w-[70%] max-md:w-full">
            <p className="text-28 text-white/60">
              Five phases. Each ends with a decision you sign off, so nothing moves forward on a maybe.
            </p>
          </FadeUp>
        </div>
        <ol className="flex flex-col">
          {PHASES.map((phase) => (
            <FadeUp
              as="li"
              key={phase.title}
              className="flex items-start justify-between gap-9 border-t border-white/15 py-[2vw] max-lg:flex-col max-lg:gap-4 max-lg:py-[4vw] max-md:py-[6vw]"
            >
              <div className="flex w-[28%] flex-col gap-2 max-lg:w-full">
                <h3 className="text-30">{phase.title}</h3>
                <span className="text-14 text-white/60">{phase.time}</span>
              </div>
              <p className="w-[40%] text-28 text-white/80 max-lg:w-full">{phase.text}</p>
              <ul className="flex w-[22%] flex-col gap-1 text-24 text-white/60 max-lg:w-full">
                {phase.output.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </FadeUp>
          ))}
        </ol>
      </div>
    </section>

    <section className="mpx-container mpx-section flex flex-col gap-14 max-lg:gap-11">
      <FadeUp className="grid grid-cols-2 gap-9 max-lg:grid-cols-1 max-lg:gap-11">
        <div className="flex flex-col gap-6">
          <h3 className="text-30">What we need from you</h3>
          <CheckList items={NEED} />
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-30">Included as standard</h3>
          <CheckList items={INCLUDED} />
        </div>
      </FadeUp>
      <FadeUp className="flex flex-col gap-6">
        <h3 className="text-30">Tools we work in</h3>
        <ul className="flex flex-wrap gap-2">
          {TOOLS.map((tool) => (
            <li
              key={tool}
              className="inline-flex h-[5vh] items-center rounded-full border border-black/20 px-[1.2vw] text-22 max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw]"
            >
              {tool}
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>

    <section id="pricing" className="mpx-container py-[8%] max-lg:py-[11%] max-md:py-[20%]">
      <Pricing />
    </section>

    <section id="work" className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead title="Identity work" text="Recent identity projects.">
        <PixelButton label="All Projects" href={ROUTES.work} variant="outline" size="sm" />
      </SectionHead>
      <ul className="grid grid-cols-2 gap-9 max-lg:gap-6 max-md:grid-cols-1 max-md:gap-12">
        {WORK.map((project, index) => (
          <FadeUp as="li" key={project.title} delay={index * 0.1}>
            <WorkListCard project={project} offset={false} />
          </FadeUp>
        ))}
      </ul>
    </section>

    <div className="mpx-container py-[8%] max-lg:py-[11%] max-md:py-[20%]">
      <QuoteBlock
        quote="Our board was nervous. They treated that as a design problem, not an obstacle, and twelve weeks later every team wanted to use the brand."
        name="Daniel Cho"
        role="CEO, Orbit Labs"
        image={founder}
      />
    </div>

    <section id="faq" className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead title="Questions">
        <p className="text-28 text-mpx-muted">
          Something else?{" "}
          <Link href={ROUTES.contact} className="text-[#0a0a0a] underline underline-offset-4">
            Ask us directly.
          </Link>
        </p>
      </SectionHead>
      <FadeUp>
        <AnimatedFaq items={FAQ} />
      </FadeUp>
    </section>

    <section className="mpx-container flex flex-col gap-6">
      <h2 className="text-40">Related services</h2>
      <ul className="flex flex-col border-b border-black/10">
        {RELATED.map((label) => (
          <FadeUp as="li" key={label}>
            <Link
              href={ROUTES.service}
              className="group flex items-center justify-between gap-6 border-t border-black/10 py-[1.8vw] max-lg:py-[3.5vw] max-md:py-[6vw]"
            >
              <span className="font-mpx-head text-40 font-medium">{label}</span>
              <ArrowRight className="size-[1.6vw] transition-transform duration-500 group-hover:translate-x-2 max-lg:size-[2.8vw] max-md:size-[5.6vw]" />
            </Link>
          </FadeUp>
        ))}
      </ul>
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;

const CheckList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-3">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 text-24">
        <Check className="size-[1.2vw] shrink-0 text-mpx-accent max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
        {item}
      </li>
    ))}
  </ul>
);

const LINKS = [
  { label: "Overview", id: "overview" },
  { label: "What you get", id: "deliverables" },
  { label: "Approach", id: "approach" },
  { label: "Pricing", id: "pricing" },
  { label: "Work", id: "work" },
  { label: "FAQ", id: "faq" },
];

const OUTCOMES = [
  "A positioning your whole team can say in one breath",
  "A visual system that works from favicon to billboard",
  "Guidelines and templates people actually open",
  "Full ownership of every file and font licence",
];

const FIT = [
  {
    title: "Startups before launch",
    text: "You have a product and a name. You need to look like you’ve been here for years by Tuesday.",
  },
  {
    title: "Companies that outgrew their look",
    text: "Your brand was built for the company you were five years ago. It shows.",
  },
  {
    title: "Brands after a merger",
    text: "Two identities, one company. You need a system that respects both and belongs to neither.",
  },
];

const DELIVERABLES = [
  {
    title: "Strategy",
    items: [
      "Brand and competitor audit",
      "Customer interviews",
      "Positioning and brand idea",
      "Personality and tone of voice",
      "Messaging framework",
    ],
  },
  {
    title: "Identity",
    items: [
      "Logo and wordmark system",
      "Accessible colour palette",
      "Typography, licensed to you",
      "Graphic language and patterns",
      "Photography and illustration direction",
      "Icon set",
    ],
  },
  {
    title: "Rollout",
    items: [
      "Online brand guidelines",
      "Social, deck and document templates",
      "Stationery and email signatures",
      "Organised asset library",
      "Animated logo",
      "Two weeks of launch support",
    ],
  },
];

const PHASES = [
  {
    title: "Discovery",
    time: "Weeks 1 to 2",
    text: "We interview your leadership, your customers and your front line, audit everything you have and map the competition.",
    output: ["Research summary", "Audit deck"],
  },
  {
    title: "Strategy",
    time: "Weeks 2 to 3",
    text: "One workshop to agree the positioning, the personality and the single idea the brand stands on.",
    output: ["Positioning statement", "Creative brief"],
  },
  {
    title: "Concepts",
    time: "Weeks 4 to 6",
    text: "Two or three genuinely different routes, each shown on real touchpoints instead of a mood board.",
    output: ["Concept presentation", "Recorded walkthrough"],
  },
  {
    title: "Refinement",
    time: "Weeks 7 to 9",
    text: "We build the chosen route into a full system and try to break it with your hardest use cases.",
    output: ["Full identity system", "Two review rounds"],
  },
  {
    title: "Delivery",
    time: "Weeks 10 to 12",
    text: "Guidelines, templates and files handed over live, then two weeks of support while you launch.",
    output: ["Guidelines site", "Asset library"],
  },
];

const NEED = [
  "A decision maker in every review",
  "Two or three customers we can interview",
  "Your current brand files and any research",
  "Feedback within three working days",
];

const INCLUDED = [
  "Weekly check-ins and a shared project board",
  "Source files in Figma and Adobe formats",
  "Full copyright transfer on final payment",
  "Font licences for up to 50 users",
];

const TOOLS = ["Figma", "Illustrator", "After Effects", "Cinema 4D", "Glyphs", "Notion"];

const WORK: Project[] = [
  {
    title: "Cloudline",
    meta: "Identity, packaging, launch",
    year: "2026",
    cats: ["branding", "packaging"],
    image: cloudline,
    alt: "Model resting in soft pink clouds",
  },
  {
    title: "Orbit Labs",
    meta: "Brand system, website",
    year: "2024",
    cats: ["web", "branding"],
    image: drift,
    alt: "Mint camper van on a desert road",
  },
];

const FAQ = [
  {
    question: "How long does an identity take?",
    answer: "Eight to twelve weeks for most projects. Multi-market flagships can run to sixteen.",
  },
  {
    question: "Do we own everything at the end?",
    answer: "Yes. Copyright transfers on final payment, and fonts are licensed in your company’s name.",
  },
  {
    question: "How many concepts will we see?",
    answer: "Two or three, depending on the tier. Each is a genuine alternative, not one idea in three outfits.",
  },
  {
    question: "What if we hate all of them?",
    answer: "Rare, because strategy is agreed first. If it happens, we run a second round at no extra cost.",
  },
  {
    question: "Can you work with our in-house designers?",
    answer: "Gladly. We often set the system and then train your team to run it.",
  },
  {
    question: "How do payments work?",
    answer: "40% to start, 30% when you approve a concept, 30% on delivery. Retainers are billed monthly in advance.",
  },
];

const RELATED = ["Brand strategy", "Websites and products", "Motion and 3D"];
