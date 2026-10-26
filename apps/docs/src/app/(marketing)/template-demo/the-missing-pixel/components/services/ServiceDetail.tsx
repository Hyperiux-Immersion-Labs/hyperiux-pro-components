// Built using Hyperiux Vault: https://vault.hyperiux.com
import Link from "next/link";
import { ROUTES, servicePath } from "../../routes";
import { FadeUp, MaskReveal, LineReveal, RuleDraw } from "../Animations/gsapAnim";
import AnimatedFaq from "../effects/animated-faq";
import PixelButton from "../Buttons/PixelButton";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ArrowUpRight, Check } from "../Buttons/icons";
import Facts from "../shared/Facts";
import PageHero from "../shared/PageHero";
import ParallaxImage from "../effects/parallax-image";
import Pricing from "./Pricing";
import QuoteBlock from "../shared/QuoteBlock";
import SectionHead from "../shared/SectionHead";
import Split from "../shared/Split";
import SubNav from "./SubNav";
import { WorkListCard } from "../work/WorkGrid";
import { PROJECTS } from "../work/projects";
import { DETAIL, SERVICES, type Service } from "./services";
import danielCho from "../../assets/pictures/q-1.webp";

const PX = "px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]";
const SECTION = `${PX} flex flex-col gap-14 py-[7%] max-lg:gap-11 max-lg:py-[12%] max-md:py-[15%]`;

const AccentLast = ({ text }: { text: string }) => {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.length > 0 && `${words.join(" ")} `}
      <span className="text-mpx-accent">{last}</span>
    </>
  );
};

const ServiceDetail = ({ service }: { service: Service }) => (
  <>
    <PageHero
      containerClassName={PX}
      crumbs={[
        { label: "Home", href: ROUTES.home },
        { label: "Services", href: ROUTES.services },
        { label: service.title },
      ]}
      title={<AccentLast text={service.title} />}
      text={service.description}
    >
      <div className="flex flex-wrap gap-3">
        <PixelButton label="Book An Intro Call" href={ROUTES.contact} icon />
        <PixelButton label="See Pricing" href="#pricing" variant="outline" />
      </div>
    </PageHero>

    <div
      className={`${PX} flex flex-col gap-14 py-[2vw] max-lg:gap-11 max-lg:py-[4vw]`}
    >
      <Facts items={DETAIL.facts} />
      <ParallaxImage
        pixel
        image={DETAIL.image}
        alt={DETAIL.alt}
        className="aspect-video rounded-lg"
        priority
      />
    </div>

    <SubNav links={links()} />

    <section id="overview" className={`${SECTION} gap-24 max-lg:gap-16`}>
      <FadeUp>
        <Split title="Overview">
          {DETAIL.overview.map((paragraph, index) => (
            <LineReveal
              key={paragraph}
              className={index === 0 ? "text-28" : "text-28 text-mpx-muted"}
            >
              {paragraph}
            </LineReveal>
          ))}
          <CheckList items={DETAIL.outcomes} />
        </Split>
      </FadeUp>
      <FadeUp>
        <Split title="Who it’s for">
          <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
            {DETAIL.fit.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-3 border-t border-(--mpx-ink)/30 py-5"
              >
                <h3 className="text-30">{item.title}</h3>
                <p className="text-24 text-mpx-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </Split>
      </FadeUp>
    </section>

    <section id="deliverables" className={SECTION}>
      <SectionHead
        stacked
        title="What you get"
        text="Everything arrives as editable source files. The exact list depends on your tier."
      />
      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
        {DETAIL.deliverables.map((group, index) => (
          <FadeUp
            as="li"
            key={group.title}
            delay={index * 0.1}
            className="flex flex-col gap-6 rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) px-[2.2vw] py-[2.2vw] max-lg:px-[5vw] max-lg:py-[5vw] max-md:px-[6vw] max-md:py-[7vw]"
          >
            <h3 className="text-30">{group.title}</h3>
            <ul className="flex flex-col">
              {group.items.map((item, itemIndex) => (
                <li key={item} className="relative py-3 text-24">
                  <RuleDraw
                    syncWithFade
                    delay={0.4 + itemIndex * 0.08}
                    className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>
        ))}
      </ul>
    </section>

    <section id="approach" className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
      <div className="flex flex-col gap-14 rounded-lg bg-(--mpx-ink) px-[4vw] py-[5vw] text-(color:--mpx-paper) max-lg:gap-11 max-lg:px-[5vw] max-lg:py-[8vw] max-md:px-[6vw] max-md:py-[12vw]">
        <div className="flex flex-col items-start gap-6">
          <MaskReveal as="h2" className="w-[35%] max-lg:w-[70%] max-md:w-full">
            Our approach
          </MaskReveal>
          <LineReveal className="w-[32%] text-28 text-(color:--mpx-grey) max-lg:w-[70%] max-md:w-full">
            {DETAIL.approach}
          </LineReveal>
        </div>
        <ol className="flex flex-col">
          {DETAIL.phases.map((phase, index) => (
            <li key={phase.title} className="relative">
              <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-white)/15" />
              {index === DETAIL.phases.length - 1 && (
                <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-white)/15" />
              )}
              <FadeUp className="grid grid-cols-12 items-start gap-x-9 gap-y-4 max-lg:gap-x-0 py-[2.4vw] max-lg:py-[4vw] max-md:py-[6vw]">
              <div className="col-span-4 flex items-start gap-5 max-lg:col-span-12">
                <span className="font-mpx-head flex aspect-square h-[5.6vh] shrink-0 items-center justify-center rounded-full border border-(--mpx-white)/15 text-22 max-lg:h-[4vh] max-md:h-[6vh]">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-30">{phase.title}</h3>
                  <span className="text-14 text-(color:--mpx-grey)">{phase.time}</span>
                </div>
              </div>
              <p className="col-span-4 col-start-6 text-24 leading-[1.3] text-(color:--mpx-grey) max-lg:col-span-12 max-lg:col-start-1">
                {phase.text}
              </p>
              <ul className="col-span-3 col-start-10 flex flex-col gap-1 text-24 max-lg:col-span-12 max-lg:col-start-1">
                {phase.output.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className={SECTION}>
      <div className="grid grid-cols-2 gap-9 max-lg:grid-cols-1 max-lg:gap-11">
        <div className="flex flex-col gap-6">
          <FadeUp>
            <h3 className="text-30">What we need from you</h3>
          </FadeUp>
          <CheckList items={DETAIL.need} ruled />
        </div>
        <div className="flex flex-col gap-6">
          <FadeUp>
            <h3 className="text-30">Included as standard</h3>
          </FadeUp>
          <CheckList items={DETAIL.included} ruled />
        </div>
      </div>
      <FadeUp className="flex flex-col gap-6">
        <h3 className="text-30">Tools we work in</h3>
        <ul className="flex flex-wrap gap-2">
          {DETAIL.tools.map((tool) => (
            <li
              key={tool}
              className="inline-flex h-[5vh] items-center rounded-full border border-(--mpx-ink)/30 px-[1.2vw] text-22 max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw]"
            >
              {tool}
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>

    <section
      id="pricing"
      className={`${PX} py-[7%] max-lg:py-[12%] max-md:py-[15%]`}
    >
      <Pricing />
    </section>

    <section id="work" className={SECTION}>
      <SectionHead
        stacked
        title="Identity work"
        text="Recent identity projects."
      >
        <UnderlineLink
          href={ROUTES.work}
          persistent
          className="font-mpx-head text-22 font-medium"
        >
          All projects
        </UnderlineLink>
      </SectionHead>
      <ul className="grid grid-cols-2 gap-9 max-lg:gap-6 max-md:grid-cols-1 max-md:gap-12">
        {work().map((project) => (
          <li key={project.title}>
            <WorkListCard project={project} offset={false} />
          </li>
        ))}
      </ul>
    </section>

    <div className={`${PX} py-[7%] max-lg:py-[12%] max-md:py-[15%]`}>
      <QuoteBlock
        quote="Our board was nervous. They treated that as a design problem, not an obstacle, and twelve weeks later every team wanted to use the brand."
        name="Daniel Cho"
        role="CEO, Orbit Labs"
        image={danielCho}
      />
    </div>

    <section id="faq" className={SECTION}>
      <SectionHead stacked title="Questions">
        <p className="text-28 text-mpx-muted">
          Something else?{" "}
          <UnderlineLink
            href={ROUTES.contact}
            
            className="text-(color:--mpx-ink)"
          >
            Ask us directly.
          </UnderlineLink>
        </p>
      </SectionHead>
      <FadeUp>
        <AnimatedFaq items={DETAIL.faq} />
      </FadeUp>
    </section>

    <section className={SECTION}>
      <h3 className="text-30">Related services</h3>
      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-4">
        {SERVICES.filter((item) => item.slug !== service.slug).map(
          (item, index) => (
            <FadeUp as="li" key={item.slug} delay={index * 0.1}>
              <Link
                href={servicePath(item.slug)}
                className="group flex items-center justify-between gap-6 rounded-lg border border-(--mpx-ink)/10 px-[1.5vw] py-[1.5vw] transition-colors duration-500 hover:border-(--mpx-ink) hover:bg-(--mpx-ink) hover:text-(color:--mpx-paper) max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw]"
              >
                <span className="font-mpx-head text-30 font-medium">
                  {item.title}
                </span>
                <ArrowUpRight className="size-[1.2vw] shrink-0 transition-transform duration-500 group-hover:rotate-45 max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
              </Link>
            </FadeUp>
          ),
        )}
      </ul>
    </section>
  </>
);

export default ServiceDetail;

const CheckList = ({
  items,
  ruled = false,
}: {
  items: string[];
  ruled?: boolean;
}) => (
  <ul className={`flex flex-col ${ruled ? "" : "gap-4"}`}>
    {items.map((item, index) => (
      <li key={item} className="relative">
        {ruled && (
          <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
        )}
        <FadeUp
          delay={index * 0.08}
          className={`flex items-start gap-3 text-24 ${ruled ? "py-4" : ""}`}
        >
          <Check className="size-[1.2vw] shrink-0 text-mpx-accent max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
          {item}
        </FadeUp>
      </li>
    ))}
  </ul>
);

const links = () => [
  { label: "Overview", id: "overview" },
  { label: "What you get", id: "deliverables" },
  { label: "Approach", id: "approach" },
  { label: "Pricing", id: "pricing" },
  { label: "Work", id: "work" },
  { label: "FAQ", id: "faq" },
];

const work = () =>
  PROJECTS.filter((project) => DETAIL.workTitles.includes(project.title));
