// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import BandCta from "../components/shared/BandCta";
import PageHero from "../components/shared/PageHero";
import PixelButton from "../components/Buttons/PixelButton";
import WorkGrid from "../components/work/WorkGrid";

export const metadata = pageMetadata(
  "Work | The Missing Pixel",
  "Selected identity, website, motion and packaging projects by The Missing Pixel.",
  "/work",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Work" }]}
      title="Proof, not promises."
      titleClassName="w-[40%] max-lg:w-[60%] max-md:w-full"
      text="Eight projects, one obsession. Open any of them for the full story, including the bits that went sideways."
    />
    <section className="mpx-container flex flex-col gap-14 pb-0 max-lg:gap-11">
      <WorkGrid />
      <BandCta
        title="Your project could be number nine."
        text="Tell us what you’re making. A partner replies within two working days."
      >
        <PixelButton label="Start A Project" href={ROUTES.contact} icon />
      </BandCta>
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;
