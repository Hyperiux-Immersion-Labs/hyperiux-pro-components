// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import { FadeUp } from "../components/Animations/gsapAnim";
import ContactForm from "../components/contact/ContactForm";
import StudioAside from "../components/contact/StudioAside";
import PageHero from "../components/shared/PageHero";
import SectionHead from "../components/shared/SectionHead";

export const metadata = pageMetadata(
  "Contact | The Missing Pixel",
  "Tell The Missing Pixel what you’re making. A partner reads every message and replies within two working days.",
  "/contact",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Contact" }]}
      title="Tell us what’s missing."
      titleClassName="w-[50%] max-lg:w-[70%] max-md:w-full"
      text={
        <>
          A partner reads every message and replies within two working days. Usually sooner. Prefer email?{" "}
          <a href="mailto:hello@themissingpixel.studio" className="text-[#0a0a0a] underline underline-offset-4">
            hello@themissingpixel.studio
          </a>
        </>
      }
    />
    <section className="mpx-container">
      <div className="flex justify-between gap-12 max-lg:flex-col max-lg:gap-12">
        <div className="w-[57%] max-lg:w-full">
          <ContactForm />
        </div>
        <div className="w-[31%] max-lg:w-full">
          <StudioAside />
        </div>
      </div>
    </section>
    <div aria-hidden className="h-[13vh] max-lg:h-[8vh] max-md:h-[9vh]" />
    <section className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead title="What happens next" />
      <ol className="grid grid-cols-3 gap-12 max-lg:gap-8 max-md:grid-cols-1 max-md:gap-10">
        {STEPS.map((step, index) => (
          <FadeUp as="li" key={step.title} delay={index * 0.1} className="flex flex-col gap-6">
            <div className="h-px w-full bg-black/30" />
            <div className="flex flex-col gap-10">
              <span className="font-mpx-head flex aspect-square h-[4.4vh] items-center self-start justify-center rounded-full bg-[#eeeeee] text-22 font-medium max-lg:h-[3.4vh] max-md:h-[5vh]">
                {index + 1}
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="text-30">{step.title}</h3>
                <p className="text-24 text-mpx-muted">{step.text}</p>
                <span className="text-14 text-[#0a0a0a]">{step.time}</span>
              </div>
            </div>
          </FadeUp>
        ))}
      </ol>
    </section>
    <div aria-hidden className="h-[13vh] max-lg:h-[8vh] max-md:h-[9vh]" />
  </>
);

export default page;

const STEPS = [
  {
    title: "We read it properly",
    text: "A partner reads every message and replies personally, even when we’re not the right fit.",
    time: "Within two working days",
  },
  {
    title: "A thirty-minute call",
    text: "Your goals, your timing, your budget, and anything you want to ask us.",
    time: "Week 1",
  },
  {
    title: "A proposal you can forward",
    text: "Fixed scope, fixed price, fixed timeline, and the names of the people doing the work.",
    time: "Week 2",
  },
];
