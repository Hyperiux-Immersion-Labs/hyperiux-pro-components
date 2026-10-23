// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import { ROUTES } from "../../routes";
import { FadeUp, LineReveal, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import Breadcrumb from "../shared/Breadcrumb";
import type { Post } from "./posts";
import author from "../../assets/pictures/team-5.webp";

type PostHeroProps = {
  post: Post;
};

const PostHero = ({ post }: PostHeroProps) => (
  <section className="flex flex-col gap-11 px-[5vw] pb-[3vw] pt-[7%] max-lg:gap-8 max-lg:px-[6vw] max-lg:py-[12%] max-md:gap-9 max-md:px-[7vw] max-md:py-[15%]">
    <Breadcrumb
      crumbs={[
        { label: "Home", href: ROUTES.home },
        { label: "Journal", href: ROUTES.blog },
        { label: post.title },
      ]}
    />
    <header className="flex flex-col items-start gap-8 max-lg:gap-6">
      <span className="inline-flex h-[4vh] items-center rounded-full bg-(--mpx-paper) px-[1vw] text-14 text-(color:--mpx-ink) max-lg:h-[3.4vh] max-lg:px-[2vw] max-md:h-[5vh] max-md:px-[4vw]">
        {post.category}
      </span>
      <MaskReveal as="h1" delay={PAGE_DELAY} className="w-[75%] max-lg:w-full">
        {post.title}
      </MaskReveal>
      <LineReveal
        delay={PAGE_DELAY + 0.3}
        className="w-[48%] text-24 leading-[1.3] text-mpx-muted max-lg:w-[70%] max-md:w-full"
      >
        {post.excerpt}
      </LineReveal>
      <FadeUp delay={PAGE_DELAY + 0.3} className="flex flex-wrap items-center gap-x-9 gap-y-3 text-14 text-mpx-muted max-lg:gap-x-6">
        <span className="flex items-center gap-3">
          <span className="aspect-square h-[5vh] shrink-0 overflow-hidden rounded-full max-lg:h-[4vh] max-md:h-[6vh]">
            <Image quality={95} src={author} alt="" sizes="4vw" className="h-full w-full object-cover" />
          </span>
          Clara Whitfield, head of writing
        </span>
        <time dateTime={post.dateTime}>{post.date}</time>
        <span>6 min read</span>
      </FadeUp>
    </header>
  </section>
);

export default PostHero;
