import Link from "next/link";
import Image from "next/image";
import LinkButton from "@/components/WebsiteComps/LinkButton";


function formatCardDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");

  return `${month} ${day},${date.getFullYear()}`;
}

export default function BlogCard({ post, priority = false }) {
  return (
    <div className="fadeup group/card relative h-full w-full">
      <div className="flex h-full min-h-[32vw] flex-col gap-[1.2vw] bg-[#161616] p-[1.8vw] max-[1025px]:min-h-0 max-md:gap-[3vw] max-md:p-[4vw] pb-9">
        <div className="h-[18vw] w-full shrink-0 overflow-hidden bg-[#202020] max-[1025px]:h-[30vw] max-md:h-[50vw]">
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

        <div className="flex items-center justify-between gap-3 pb-3 font-geist-mono">
          {post.categories?.length > 0 && (
            <span className="bg-[#2B2B2B] px-[0.4vw] py-[0.1vw] text18 text-white/90 max-md:px-3 max-md:py-1 max-md:text-[3vw]!">
              {post.categories[0].title}
            </span>
          )}
          <span className="text-[0.9vw] text-[#AEAEAE] max-md:text-[3vw]!">
            {formatCardDate(post.publishedAt)}
          </span>
        </div>

        <h3 className="shrink-0 text-[1.5vw] font-medium leading-[1.2]! text-white max-md:text-[3vw] max-sm:text-[4.5vw]">
          {post.title}
        </h3>

        <p className="grow text-[1.15vw] leading-[1.2] text-white max-md:text-[3vw]!">
          {post.summary}
        </p>

        <LinkButton
          href={`/blog/${post.slug}`}
          text="Read More"
          
          tilted={false}
          underline={true}
          
          className="relative z-10 mt-5 max-md:text34"
        />
      </div>

      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-0"
      />
    </div>
  );
}
