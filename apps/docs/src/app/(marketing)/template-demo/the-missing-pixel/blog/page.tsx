// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import BlogHero from "../components/blog/BlogHero";
import FeaturedPost from "../components/blog/FeaturedPost";
import PostGrid from "../components/blog/PostGrid";

export const metadata = pageMetadata(
  "Journal | The Missing Pixel",
  "Opinions, process and the occasional confession from four studios. A new essay every other Thursday.",
  "/blog",
);

const page = () => (
  <>
    <BlogHero />
    <div className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
      <FeaturedPost />
    </div>
    <section className="px-[5vw] py-[7%] max-lg:px-[6vw] max-lg:py-[12%] max-md:px-[7vw] max-md:py-[15%]">
      <PostGrid />
    </section>
  </>
);

export default page;
