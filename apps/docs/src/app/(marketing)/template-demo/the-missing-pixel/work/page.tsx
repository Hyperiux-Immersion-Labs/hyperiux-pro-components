// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import PageHero from "../components/shared/PageHero";
import { ROUTES } from "../routes";
import NineBlock from "../components/work/NineBlock";
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
      title={
        <>
          Proof,
          <br />
          not promises.
        </>
      }
      text="Eight projects, one obsession. Open any of them for the full story, including the bits that went sideways."
    />
    <section className="mpx-container flex flex-col gap-14 pb-0 max-lg:gap-11">
      <WorkGrid />
      <NineBlock />
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;
