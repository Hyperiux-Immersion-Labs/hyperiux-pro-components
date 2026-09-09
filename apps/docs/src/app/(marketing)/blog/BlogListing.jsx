import Link from "next/link";
import Image from "next/image";

// Plain server component - filtering and pagination are real URLs
// (?category=x&page=n), resolved server-side by page.js's paginated Sanity
// query. No client state, no shipping the full post list to the browser to
// slice/filter in JS - that's what breaks once there are hundreds of posts.

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Omits defaults (no category, page 1) so the canonical "/blog" stays clean
// instead of "/blog?category=all&page=1".
function buildHref({ category, page }) {
  const query = new URLSearchParams();

  if (category && category !== "all") query.set("category", category);
  if (page && page > 1) query.set("page", String(page));

  const qs = query.toString();

  return qs ? `/blog?${qs}` : "/blog";
}

function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      {post.coverImage?.url && (
        <div className="relative aspect-video w-full overflow-hidden bg-grey">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <p className="text14 mt-[1vw] text-light-grey">
        {formatDate(post.publishedAt)}
        {post.categories?.length > 0 && ` · ${post.categories[0].title}`}
      </p>

      <h2 className="t32 font-neue-haas mt-[0.4vw] max-md:text-[5vw]">{post.title}</h2>

      {post.summary && (
        <p className="text18 mt-[0.6vw] text-light-grey max-md:text-[3.5vw]">{post.summary}</p>
      )}
    </Link>
  );
}

export default function BlogListing({
  posts = [],
  categories = [],
  featuredPost = null,
  activeCategory = "all",
  page = 1,
  pageCount = 1,
}) {
  return (
    <main className="mx-auto max-w-[1100px] px-[5vw] pt-[10vw] pb-[6vw] max-md:pt-[28vw] max-md:px-[6vw]">
      <h1 className="t64 font-neue-haas max-md:text-[8vw]">Blog</h1>
      <p className="text22 mt-[1vw] max-w-[40em] text-light-grey max-md:mt-[3vw] max-md:text-[3.5vw]">
        Notes on building React and Next.js interaction effects.
      </p>

      {featuredPost && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group mt-[3vw] grid grid-cols-2 gap-[2vw] border border-white/15 p-[1.5vw] max-[1025px]:grid-cols-1 max-md:mt-[6vw] max-md:gap-[4vw] max-md:p-[4vw]"
        >
          {featuredPost.coverImage?.url && (
            <div className="relative aspect-video w-full overflow-hidden bg-grey">
              <Image
                src={featuredPost.coverImage.url}
                alt={featuredPost.coverImage.alt || featuredPost.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex flex-col justify-center">
            <p className="text14 text-primary">
              Featured
              {featuredPost.categories?.length > 0 && ` · ${featuredPost.categories[0].title}`}
            </p>
            <h2 className="t40 font-neue-haas mt-[0.4vw] max-md:text-[6vw]">{featuredPost.title}</h2>
            {featuredPost.summary && (
              <p className="text18 mt-[0.6vw] text-light-grey max-md:text-[3.5vw]">
                {featuredPost.summary}
              </p>
            )}
          </div>
        </Link>
      )}

      {categories.length > 0 && (
        <div className="mt-[2.5vw] flex flex-wrap gap-[0.8vw] max-md:mt-[5vw] max-md:gap-[2vw]">
          <Link
            href={buildHref({ category: "all" })}
            className={`text14 border px-[1vw] py-[0.4vw] max-md:px-[3vw] max-md:py-[1.5vw] ${
              activeCategory === "all" ? "border-primary text-primary" : "border-white/20"
            }`}
          >
            All
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={buildHref({ category: category.slug })}
              className={`text14 border px-[1vw] py-[0.4vw] max-md:px-[3vw] max-md:py-[1.5vw] ${
                activeCategory === category.slug ? "border-primary text-primary" : "border-white/20"
              }`}
            >
              {category.title}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text22 mt-[4vw] text-light-grey">No posts yet.</p>
      ) : (
        <>
          <div className="mt-[3vw] grid grid-cols-2 gap-[2vw] max-[1025px]:grid-cols-1 max-md:mt-[6vw] max-md:gap-[6vw]">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-[3vw] flex items-center justify-center gap-[0.6vw] max-md:mt-[6vw] max-md:gap-[2vw]">
              <Link
                href={buildHref({ category: activeCategory, page: page - 1 })}
                aria-disabled={page === 1}
                className={`text14 border border-white/20 px-[1vw] py-[0.4vw] max-md:px-[3vw] max-md:py-[1.5vw] ${
                  page === 1 ? "pointer-events-none opacity-30" : ""
                }`}
              >
                Prev
              </Link>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildHref({ category: activeCategory, page: pageNumber })}
                  className={`text14 border px-[0.9vw] py-[0.4vw] max-md:px-[3vw] max-md:py-[1.5vw] ${
                    page === pageNumber ? "border-primary text-primary" : "border-white/20"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}

              <Link
                href={buildHref({ category: activeCategory, page: page + 1 })}
                aria-disabled={page === pageCount}
                className={`text14 border border-white/20 px-[1vw] py-[0.4vw] max-md:px-[3vw] max-md:py-[1.5vw] ${
                  page === pageCount ? "pointer-events-none opacity-30" : ""
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
