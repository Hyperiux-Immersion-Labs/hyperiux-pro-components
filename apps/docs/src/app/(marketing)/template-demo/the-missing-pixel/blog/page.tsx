// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import PageHero from "../components/shared/PageHero";
import { ROUTES } from "../routes";
import FeaturedPost from "../components/blog/FeaturedPost";
import PostGrid from "../components/blog/PostGrid";

export const metadata = pageMetadata(
  "Journal | The Missing Pixel",
  "Opinions, process and the occasional confession from four studios. A new essay every other Thursday.",
  "/blog",
);

const page = () => (
  <>
    <PageHero
      crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Journal" }]}
      title={<span className="text-mpx-accent">Journal</span>}
      text="Opinions, process and the occasional confession from four studios. New essay every other Thursday."
    />
    <div className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
      <FeaturedPost />
    </div>
    <section className="px-[5vw] py-[7%] max-lg:px-[6vw] max-lg:py-[12%] max-md:px-[7vw] max-md:py-[15%]">
      <PostGrid />
    </section>
  </>
);

export default page;
