// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import WorkHero from "../components/work/WorkHero";
import NineBlock from "../components/work/NineBlock";
import WorkGrid from "../components/work/WorkGrid";

export const metadata = pageMetadata(
  "Work | The Missing Pixel",
  "Selected identity, website, motion and packaging projects by The Missing Pixel.",
  "/work",
);

const page = () => (
  <>
    <WorkHero />
    <section className="mpx-container flex flex-col gap-14 pb-0 max-lg:gap-11">
      <WorkGrid />
      <NineBlock />
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;
