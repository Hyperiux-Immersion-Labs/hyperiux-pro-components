// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import { FadeUp } from "../components/Animations/gsapAnim";
import AnimatedFaq from "../components/effects/animated-faq";
import Engage from "../components/services/Engage";
import KineticRow from "../components/services/KineticRow";
import PageHero from "../components/shared/PageHero";
import SectionHead from "../components/shared/SectionHead";
import ServiceList from "../components/services/ServiceList";
import RunList from "../components/services/RunList";

export const metadata = pageMetadata(
  "Services | The Missing Pixel",
  "Brand strategy, identity, websites, motion, packaging and campaigns from one team at The Missing Pixel.",
  "/services",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Services" }]}
      title={
        <>
          Six disciplines.
          <br />
          Zero hand offs.
        </>
        
      }
      textClassName="w-[45%]"
      containerClassName="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]"
      text="Strategy, design and engineering in one team. Hire us for one of them or all six. Most clients start with identity and stay for everything else."
    />
    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
      <ServiceList />
    </section>
    <KineticRow />
    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] mpx-section flex flex-col gap-14 max-lg:gap-11">
      <SectionHead
        stacked
        title="Ways to work with us"
        text="Every engagement has a price agreed up front. Surprise invoices are for other agencies."
         textClassName="w-[34%]"
      />
      <Engage />
    </section>
    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] flex flex-col gap-14 max-lg:gap-11">
      <SectionHead
        stacked
        title="How a project runs"
        text="Most identity projects take 8 to 12 weeks. Every phase ends with a decision you sign off."
         textClassName="w-[35%]"
       
      />
      <RunList runs={RUNS} />
    </section>
    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] mpx-section flex flex-col gap-14 max-lg:gap-11">
      <SectionHead stacked title="Questions people ask" />
      <FadeUp>
        <AnimatedFaq items={FAQ} />
      </FadeUp>
    </section>
  </>
);

export default page;

const RUNS = [
  {
    title: "Look closer",
    text: "We interview your people, your customers and your competitors’ customers. Somewhere in the noise is the thing nobody has said yet.",
    time: "Weeks 1 to 2",
    on: [0, 1],
  },
  {
    title: "Say it straight",
    text: "We turn what we found into a positioning short enough to remember and sharp enough to argue with.",
    time: "Weeks 3 to 4",
    on: [2, 3],
  },
  {
    title: "Make it unmissable",
    text: "Two or three routes, tested on real touchpoints instead of mood boards. We choose one together and build it into a system.",
    time: "Weeks 5 to 9",
    on: [4, 5, 6, 7, 8],
  },
  {
    title: "Hand it over, stay close",
    text: "Files, guidelines, code and training, plus a team that still answers the phone after launch day.",
    time: "Week 10 onward",
    on: [9, 10, 11],
  },
];

const FAQ = [
  {
    question: "Can we hire you for just one thing?",
    answer:
      "Yes. About a third of our work is a single discipline, usually a website or a packaging range for a brand that already exists.",
  },
  {
    question: "You have four studios. Which one gets my project?",
    answer:
      "The one nearest your team, plus whoever is best for the job. Delhi hands over to London at lunchtime, so the work keeps moving while you sleep.",
  },
  {
    question: "How soon can you start?",
    answer:
      "We usually book four to eight weeks ahead. Sprints can sometimes start within a fortnight.",
  },
  {
    question: "Do you work with in-house teams?",
    answer:
      "All the time. We can lead, embed with your team, or train them to run the system after we leave.",
  },
  {
    question: "What does it cost?",
    answer:
      "Our prices are on each service page. Most identity projects land between $18,000 and $60,000.",
  },
];
