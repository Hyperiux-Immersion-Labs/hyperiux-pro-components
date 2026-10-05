import Link from "next/link";
import Image from "next/image";
import LinkButton from "@/components/WebsiteComps/LinkButton";
import LineWipe from "@/components/Animations/LineWipe";

function formatCardDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");

  return `${month} ${day}, ${date.getFullYear()}`;
}

// Sized off the card's own width (cqi), not the viewport: the same card sits
// in a 3/2/1-column grid on /blog and in 31vw/55vw/full-width slides in
// RelatedBlogsSlider, so viewport units gave the same-width card different
// type at different breakpoints. Values match the desktop design (a ~426px
// card at 1440px), clamped so narrow cards stay readable and wide ones don't
// balloon.
export default function BlogCard({ post, priority = false }) {
  return (
    <div className="fadeup group/card @container relative h-full w-full">
      <div className="flex h-full flex-col gap-[clamp(0.75rem,4cqi,1.25rem)] bg-[#161616] p-[clamp(1rem,5.4cqi,1.75rem)] pb-[clamp(2.25rem,8.5cqi,3rem)]">
        <div className="aspect-video w-full shrink-0 overflow-hidden bg-[#202020]">
          {post.coverImage?.url && (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              width={560}
              height={315}
              quality={75}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 pb-3 font-geist-mono">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {post.categories?.length > 0 && (
              <span className="bg-[#2B2B2B] px-2 py-1 text-[clamp(0.75rem,3cqi,0.95rem)] leading-none text-white/90">
                {post.categories[0].title}
              </span>
            )}
          </div>
          <span className="shrink-0 font-neue-haas text-[clamp(0.75rem,3.2cqi,1rem)] text-[#AEAEAE]">
            {formatCardDate(post.publishedAt)}
          </span>
        </div>

        <LineWipe>
          <h3 className="shrink-0 font-neue-haas text-[clamp(1.15rem,6cqi,2rem)] font-medium leading-[1.2]! text-white">
            {post.title}
          </h3>
        </LineWipe>

        <LineWipe delay={0.15}>
          <p className="grow text-[clamp(0.95rem,3.55cqi,1.125rem)] leading-[1.4] text-white">
            {post.summary}
          </p>
        </LineWipe>

        <div className="fadein" data-fadein-delay="0.3">
          <LinkButton
            href={`/blog/${post.slug}`}
            text="Read More"
            tilted={false}
            underline={true}
            className="relative z-10 mt-[clamp(0.25rem,3cqi,1.25rem)] text-[clamp(0.95rem,3.55cqi,1.125rem)]"
          />
        </div>
      </div>

      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-0"
      />
    </div>
  );
}
