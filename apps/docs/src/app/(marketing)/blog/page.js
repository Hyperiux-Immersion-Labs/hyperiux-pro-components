import NavbarV3 from "@/homepage-v3/components/NavbarV3";
import FooterV3 from "@/homepage-v3/sections/FooterV3";
import {
  getSanityBlogEntries,
  getSanityFeaturedBlogPost,
  getAllSanityBlogCategories,
} from "@/lib/sanity";
import { getSearchIndexEffects } from "@/lib/search-index";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd } from "@/lib/json-ld";
import BlogListing from "./BlogListing";

const POSTS_PER_PAGE = 9;

export const metadata = createPageMetadata({
  title: "Blog | Hyperiux Vault",
  description: "Notes on building React and Next.js interaction effects, from the Hyperiux Vault team.",
  path: "/blog",
});

export default async function BlogIndexPage({ searchParams }) {
  const params = await searchParams;
  const category = typeof params?.category === "string" ? params.category : undefined;
  const page = Math.max(1, Number(params?.page) || 1);

  // Featured post only makes sense on the unfiltered, first page - once a
  // category filter or later page is active it'd just be a stray extra
  // fetch shown out of context.
  const showFeatured = !category && page === 1;

  const [{ posts, total }, categories, featuredPost, effects] = await Promise.all([
    getSanityBlogEntries({ category, page, pageSize: POSTS_PER_PAGE }),
    getAllSanityBlogCategories(),
    showFeatured ? getSanityFeaturedBlogPost() : Promise.resolve(null),
    getSearchIndexEffects(),
  ]);

  // The featured post is pulled out of the regular grid so it isn't shown
  // twice - the grid's own count/pagination accounts for that below.
  const gridPosts = featuredPost ? posts.filter((post) => post.slug !== featuredPost.slug) : posts;
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <NavbarV3 effects={effects} />
      <BlogListing
        posts={gridPosts}
        categories={categories}
        featuredPost={featuredPost}
        activeCategory={category || "all"}
        page={page}
        pageCount={pageCount}
      />
      <FooterV3 />
    </>
  );
}
