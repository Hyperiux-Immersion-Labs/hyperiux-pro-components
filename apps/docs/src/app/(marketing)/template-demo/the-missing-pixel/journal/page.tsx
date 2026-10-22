// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../routes";
import FeaturedPost from "../components/journal/FeaturedPost";
import NewsletterBand from "../components/journal/NewsletterBand";
import PostGrid from "../components/journal/PostGrid";
import PageHero from "../components/shared/PageHero";

export const metadata = pageMetadata(
  "Journal | The Missing Pixel",
  "Opinions, process and the occasional confession from four studios. A new essay every other Thursday.",
  "/journal",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Journal" }]}
      title="Journal"
      text="Opinions, process and the occasional confession from four studios. New essay every other Thursday."
    />
    <div className="mpx-container">
      <FeaturedPost />
    </div>
    <div aria-hidden className="h-[13vh] max-lg:h-[8vh] max-md:h-[9vh]" />
    <section className="mpx-container py-[8%] max-lg:py-[11%] max-md:py-[20%]">
      <PostGrid />
    </section>
    <div className="mpx-container">
      <NewsletterBand />
    </div>
    <div aria-hidden className="h-[13vh] max-lg:h-[8vh] max-md:h-[9vh]" />
  </>
);

export default page;
