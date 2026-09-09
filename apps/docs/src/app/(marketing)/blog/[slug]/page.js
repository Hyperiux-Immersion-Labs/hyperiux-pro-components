import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavbarV3 from "@/homepage-v3/components/NavbarV3";
import FooterV3 from "@/homepage-v3/sections/FooterV3";
import {
  getSanityBlogPost,
  getAllSanityBlogSlugs,
  getRelatedBlogPosts,
} from "@/lib/sanity";
import { getSearchIndexEffects } from "@/lib/search-index";
import { createPageMetadata, getCanonicalUrl } from "@/lib/seo-metadata";
import { BreadcrumbsJSONLD, WebpageJsonLd, BlogPostingJsonLd, FAQJSONLD } from "@/lib/json-ld";
import { getReadingTime } from "@/lib/blog-content";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import BlogBodyRenderer from "@/components/blog/BlogBodyRenderer";
import BlogArticleBody from "@/components/blog/BlogArticleBody";
import BlogShareLinks from "@/components/blog/BlogShareLinks";
import BlogPromoCard from "@/components/blog/BlogPromoCard";
import "@/styles/blog-new.css";
import Heading from "@/components/DocsContent/Heading";


export async function generateStaticParams() {
  const entries = await getAllSanityBlogSlugs();

  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getSanityBlogPost(slug);

  if (!post) {
    return createPageMetadata({
      title: "Post Not Found",
      description: "This blog post could not be found.",
      path: `/blog/${slug}`,
    });
  }

  return createPageMetadata({
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.summary,
    path: `/blog/${slug}`,
    image: post.coverImage?.url,
  });
}

// Every effectFaqAccordion block in the body feeds one FAQPage JSON-LD -
// same shape FAQJSONLD already expects from the effect pages.
function extractFaqs(body = []) {
  return body
    .filter((block) => block._type === "effectFaqAccordion")
    .flatMap((block) => block.items || [])
    .filter((item) => item?.question && item?.answer);
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getSanityBlogPost(slug);

  if (!post) notFound();

  const [effects, relatedPosts] = await Promise.all([
    getSearchIndexEffects(),
    getRelatedBlogPosts(slug, post),
  ]);

  const url = `/blog/${slug}`;
  const canonicalUrl = getCanonicalUrl(url);
  const pageMetadata = createPageMetadata({
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.summary,
    path: url,
  });
  const readingTime = getReadingTime(post.body || []);
  const faqs = extractFaqs(post.body || []);

  return (
    <>
      <WebpageJsonLd metadata={pageMetadata} />
      <BreadcrumbsJSONLD pathname={url} />
      <BlogPostingJsonLd post={post} url={url} />
      {faqs.length > 0 && <FAQJSONLD faqs={faqs} />}
      <NavbarV3 effects={effects} />

      <div className="pt-48 px-[3vw]">
        <article className="blog-article text-white">
          <header className="space-y-4">
            <Breadcrumb />
            {/* {post.categories?.length > 0 && (
              <span className="blog-category">{post.categories[0].title}</span>
            )} */}

            <h1 className="font-display max-md:text-3xl! text-6xl leading-[1.2]! text-foreground max-w-[90%]">{post.title}</h1>

            {post.summary && <p className="text-base md:text-lg leading-relaxed text-muted fadeup">{post.summary}</p>}

            <div className="flex w-full justify-between items-center">
              {post.author?.name && (
                <div className="flex gap-4">
                  {post.author.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="size-12 rounded-full border-primary border"
                      src={post.author.avatar.url}
                      alt={post.author.name}
                    />
                  ) : (
                    <div className="size-12 rounded-full border-primary border bg-gray-500" />
                  )}

                  <div>
                    <p className="text18">{post.author.name}</p>
                    {post.author.role && <p className="text12 text-secondary">{post.author.role}</p>}
                  </div>
                </div>
              )}

              <div className="text-muted">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                )}
                {" · "}
                {readingTime.minutes} min read
              </div>
            </div>
          </header>

          {post.coverImage?.url && (
            <div className="w-full h-auto aspect-video relative mt-10">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                fill
                sizes="(max-width: 960px) 100vw, 720px"
                priority
              />
            </div>
          )}

          <BlogArticleBody
            slug={slug}
            afterContent={
              <>
                {post.tags?.length > 0 && (
                  <div className="blog-tags">
                    {post.tags.map((tag) => (
                      <span className="blog-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* {relatedPosts.length > 0 && (
                  <section className="blog-related">
                    <h2 className="blog-related-title">Related Blogs</h2>

                    <div className="blog-related-grid">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blog/${related.slug}`}
                          className="blog-related-card"
                        >
                          {related.coverImage?.url && (
                            <div className="relative">
                              <Image
                                src={related.coverImage.url}
                                alt={related.coverImage.alt || related.title}
                                fill
                                sizes="(max-width: 720px) 100vw, 33vw"
                              />
                            </div>
                          )}

                          <p className="blog-related-card-title">{related.title}</p>
                          <p className="blog-related-card-meta">
                            {related.author?.name && `${related.author.name} · `}
                            {formatDate(related.publishedAt)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )} */}
              </>
            }
          >
            <BlogBodyRenderer body={post.body || []} />
          </BlogArticleBody>
        </article>

        {/* <aside className="blog-sidebar">
          <BlogShareLinks url={canonicalUrl} title={post.title} />
          <BlogPromoCard cta={post.ctaBanner} />
        </aside> */}
      </div>

      <FooterV3 />
    </>
  );
}
