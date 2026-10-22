// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import { FadeUp } from "../components/Animations/gsapAnim";
import AnimatedFaq from "../components/effects/animated-faq";
import KineticRow from "../components/services/KineticRow";
import PageHero from "../components/shared/PageHero";
import SectionHead from "../components/shared/SectionHead";
import ServiceList from "../components/services/ServiceList";
import StackCards from "../components/services/StackCards";

export const metadata = pageMetadata(
  "Services | The Missing Pixel",
  "Brand strategy, identity, websites, motion, packaging and campaigns from one team at The Missing Pixel.",
  "/services",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Services" }]}
      title="Six disciplines. Zero hand-offs."
      text="Strategy, design and engineering in one team. Hire us for one of them or all six. Most clients start with identity and stay for everything else."
    />
    <div className="mpx-container">
      <ServiceList />
    </div>
    <div aria-hidden className="h-[8vh]" />
    <KineticRow />
    <section className="mpx-container mpx-section flex flex-col gap-14 max-lg:gap-11">
      <SectionHead
        title="Ways to work with us"
        text="Every engagement has a price agreed up front. Surprise invoices are for other agencies."
      />
      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
        {MODELS.map((model, index) => (
          <FadeUp
            as="li"
            key={model.title}
            delay={index * 0.1}
            className="flex h-[32vh] flex-col justify-between gap-6 rounded-lg border border-black/10 bg-white px-[2.2vw] py-[2.2vw] max-lg:h-auto max-lg:gap-9 max-lg:px-[5vw] max-lg:py-[5vw] max-md:px-[6vw] max-md:py-[7vw]"
          >
            <div className="flex flex-col gap-7">
              <h3 className="text-30">{model.title}</h3>
              <p className="text-24 leading-[1.3] text-mpx-muted">{model.text}</p>
            </div>
            <p className="font-mpx-head text-22 font-medium">{model.price}</p>
          </FadeUp>
        ))}
      </ul>
    </section>
    <section className="mpx-container flex flex-col gap-14 max-lg:gap-11">
      <SectionHead
        title="How a project runs"
        text="Most identity projects take 8 to 12 weeks. Every phase ends with a decision you sign off."
      />
      <StackCards steps={STEPS} />
    </section>
    <section className="mpx-container px-[5vw] mpx-section flex flex-col gap-14 max-lg:gap-11">
      <SectionHead title="Questions people ask" />
      <FadeUp>
        <AnimatedFaq items={FAQ} />
      </FadeUp>
    </section>
  </>
);

export default page;

const MODELS = [
  {
    title: "Project",
    text: "A fixed scope, a fixed fee and a fixed date. Best for identities, websites and launches.",
    price: "From $18,000",
  },
  {
    title: "Retainer",
    text: "A dedicated team for a set number of days each month. Best for brands that never stop shipping.",
    price: "From $6,500 a month",
  },
  {
    title: "Sprint",
    text: "Two weeks, one problem, one answer. A pitch deck, a campaign idea, a landing page.",
    price: "$9,500, fixed",
  },
];

const STEPS = [
  {
    title: "Look closer",
    text: "We interview your people, your customers and your competitors’ customers. Somewhere in the noise is the thing nobody has said yet.",
    time: "Weeks 1 to 2",
  },
  {
    title: "Say it straight",
    text: "We turn what we found into a positioning short enough to remember and sharp enough to argue with.",
    time: "Weeks 3 to 4",
  },
  {
    title: "Make it unmissable",
    text: "Two or three routes, tested on real touchpoints instead of mood boards. We choose one together and build it into a system.",
    time: "Weeks 5 to 9",
  },
  {
    title: "Hand it over, stay close",
    text: "Files, guidelines, code and training, plus a team that still answers the phone after launch day.",
    time: "Week 10 onward",
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
    answer: "We usually book four to eight weeks ahead. Sprints can sometimes start within a fortnight.",
  },
  {
    question: "Do you work with in-house teams?",
    answer: "All the time. We can lead, embed with your team, or train them to run the system after we leave.",
  },
  {
    question: "What does it cost?",
    answer: "Our prices are on each service page. Most identity projects land between $18,000 and $60,000.",
  },
];
