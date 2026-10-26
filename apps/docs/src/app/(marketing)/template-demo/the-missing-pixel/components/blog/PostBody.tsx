// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import { ROUTES } from "../../routes";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import UnderlineLink from "../Buttons/UnderlineLink";
import ParallaxImage from "../effects/parallax-image";
import ArticleAside from "./ArticleAside";
import { Bullets, Callout, Figure, H2, H3, P, Quote, Steps } from "./ArticleParts";
import { PostCard } from "./PostGrid";
import { POSTS, type Post } from "./posts";
import journalSix from "../../assets/pictures/j-6.webp";
import author from "../../assets/pictures/team-5.webp";

type PostBodyProps = {
  post: Post;
};

const PostBody = ({ post }: PostBodyProps) => {
  const related = POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
  <>
    <div className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
      <ParallaxImage
        pixel
        image={post.image}
        alt={post.title}
        className="aspect-video rounded-lg"
        priority
      />
    </div>

    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
      <div className="flex justify-between gap-11 max-lg:flex-col max-lg:gap-9">
        <ArticleAside links={TOC} subject={post.title} />
        <article id="article-body" className="flex w-[62%] flex-col gap-7 max-lg:w-full">
          <P>
            Most brand guidelines are written to protect the brand from the people using it. Which is exactly why the people using it ignore them.
          </P>
          <P>
            We’ve audited more than a hundred guideline documents. The pattern never changes: the longer the document, the less the brand looks like itself in the wild. People can’t find the answer, so they guess. The guesses drift. Two years later you have eleven shades of “brand blue”.
          </P>
          <H2 id="rules-fail">Why long rulebooks fail</H2>
          <P>
            A 120-page PDF feels thorough. In practice it’s slow to search, obsessed with edge cases nobody meets, and treats every rule as equally sacred. The five that matter drown under the ninety that don’t.
          </P>
          <Quote>
            If everything is a rule, nothing is. A guideline’s only job is to make the right choice the easy one.
          </Quote>
          <P>
            The bill arrives later: a regional team rebuilds the logo from a screenshot, or a new hire picks the wrong red because the right one lived on page 74.
          </P>
          <H2 id="what-to-keep">What to keep</H2>
          <P>When we rewrite a guideline, every rule goes into one of three buckets:</P>
          <Bullets
            items={[
              { lead: "Fixed.", text: "Never changes: the logo artwork, core colours, the typeface." },
              { lead: "Flexible.", text: "Has a range: layouts, photography, tone in different channels." },
              { lead: "Free.", text: "Deliberately left to the team, like social copy and event graphics." },
            ]}
          />
          <P>Usually fewer than a dozen rules survive as fixed. Everything else becomes an example rather than a law.</P>
          <Figure
            image={journalSix}
            alt="Chrome letters A and a on a dark set with an orange glow"
            caption="One clear focal point beats a page of things to avoid."
          />
          <H2 id="how-we-write">How we write them now</H2>
          <P>
            Our guidelines are websites, not PDFs. Each page answers one question someone actually asked, in the words they used. We track the searches that return nothing and write a page for each.
          </P>
          <H3>Lead with templates</H3>
          <P>
            Nobody wants to build a deck from a type scale. Give them the deck. Templates do the enforcing quietly; the guideline explains why.
          </P>
          <H3>Show the brand being stretched</H3>
          <P>
            Include work that pushes the system to its edge and explain why it still holds. It gives people permission to make things, not just copy them.
          </P>
          <Callout title="The twenty-minute test">
            Ask a new starter to make a social post using only your guidelines. If it takes longer than twenty minutes, the guidelines are the problem, not the starter.
          </Callout>
          <H2 id="start-here">Where to start</H2>
          <Steps
            items={[
              "List the ten questions your team asks most about the brand.",
              "Answer each on one page, with one good example.",
              "Turn your three most-used layouts into templates.",
              "Delete anything nobody has asked about in a year.",
            ]}
          />
          <P>You’ll end up with a fraction of the pages and a lot more readers. That was the point all along.</P>
          <FadeUp as="ul" className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="inline-flex h-[4vh] items-center rounded-full bg-(--mpx-paper) px-[1vw] text-14 text-(color:--mpx-ink) max-lg:h-[3.4vh] max-lg:px-[2vw] max-md:h-[5vh] max-md:px-[4vw]"
              >
                {tag}
              </li>
            ))}
          </FadeUp>
          <FadeUp className="flex items-center gap-[2vw] rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) px-[2.2vw] py-[2.2vw] max-lg:gap-[3vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:flex-col max-md:items-start max-md:gap-[5vw] max-md:px-[5vw] max-md:py-[6vw]">
            <div className="aspect-square h-[11vh] shrink-0 overflow-hidden rounded-full max-lg:h-[8vh] max-md:h-[10vh]">
              <Image quality={95} src={author} alt="" sizes="8vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-28">Clara Whitfield</h3>
              <p className="text-22 leading-[1.5] text-mpx-muted">
                Clara runs writing out of the London studio. Before that she spent eight years in-house, so she has read a great many guidelines she didn’t write.
              </p>
            </div>
          </FadeUp>
        </article>
      </div>
    </section>


    <section className="flex flex-col gap-[6vw] px-[5vw] py-[7%] max-lg:gap-[10vw] max-lg:px-[6vw] max-lg:py-[12%] max-md:gap-14 max-md:px-[7vw] max-md:py-[15%]">
      <div className="flex flex-col items-start gap-[2vw] max-lg:gap-4">
        <MaskReveal as="h2">Keep reading</MaskReveal>
        <FadeUp>
          <UnderlineLink href={ROUTES.blog} className="font-mpx-head text-24 font-medium text-mpx-ink">
            All Essays
          </UnderlineLink>
        </FadeUp>
      </div>
      <div className="grid grid-cols-3 gap-x-[3.3vw] gap-y-[5vw] max-lg:grid-cols-2 max-lg:gap-x-[4vw] max-lg:gap-y-[8vw] max-md:grid-cols-1 max-md:gap-y-12">
        {related.map((item, index) => (
          <PostCard key={item.slug} post={item} index={index} />
        ))}
      </div>
    </section>
  </>
  );
};

export default PostBody;

const TOC = [
  { label: "Why long rulebooks fail", id: "rules-fail" },
  { label: "What to keep", id: "what-to-keep" },
  { label: "How we write them now", id: "how-we-write" },
  { label: "Where to start", id: "start-here" },
];

const TAGS = ["Guidelines", "Brand systems", "Writing"];
