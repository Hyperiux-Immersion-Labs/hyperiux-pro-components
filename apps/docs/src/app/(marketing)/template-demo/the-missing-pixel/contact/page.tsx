// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import { FadeUp } from "../components/Animations/gsapAnim";
import ContactForm from "../components/contact/ContactForm";
import StudioAside from "../components/contact/StudioAside";
import StudioMap from "../components/contact/StudioMap";
import PageHero from "../components/shared/PageHero";
import SectionHead from "../components/shared/SectionHead";

export const metadata = pageMetadata(
  "Contact | The Missing Pixel",
  "Start a project with The Missing Pixel in Delhi, London, Dubai or New York.",
  "/contact",
);

const GUTTER = "px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]";

const page = () => (
  <>
    <PageHero
      containerClassName={GUTTER}
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Contact" }]}
      title={
        <>
          Tell us what’s <span className="text-mpx-accent">missing.</span>
        </>
      }
      titleClassName="w-[50%] max-lg:w-[70%] max-md:w-full"
      text="A partner reads every message and replies within two working days. Usually sooner."
    />
    <section className={`${GUTTER} flex justify-between gap-[2vw] max-lg:flex-col max-lg:gap-8`}>
      <FadeUp className="w-[58%] rounded-[2vw] border border-(--mpx-ink)/10 bg-(--mpx-white) p-[3vw] max-lg:w-full max-lg:rounded-[3vw] max-lg:p-[5vw] max-md:rounded-[5vw] max-md:p-[6vw]">
        <ContactForm />
      </FadeUp>
      <FadeUp delay={0.1} className="w-[38%] max-lg:w-full">
        <StudioAside />
      </FadeUp>
    </section>
    <section className={`${GUTTER} flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]`}>
      <SectionHead
        stacked
        titleClassName='w-full'
        textClassName="w-[40%]"
        title="Four studios, one team"
        text="Come and see us. Delhi hands over to London at lunchtime, so somebody is always awake."
      />
      <StudioMap />
    </section>
  </>
);

export default page;
