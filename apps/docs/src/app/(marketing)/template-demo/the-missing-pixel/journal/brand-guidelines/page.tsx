// Built using Hyperiux Vault: https://vault.hyperiux.com
import Image from "next/image";
import { pageMetadata } from "../../metadata";
import { ROUTES } from "../../routes";
import { FadeUp, MaskReveal, PAGE_DELAY } from "../../components/Animations/gsapAnim";
import PixelButton from "../../components/Buttons/PixelButton";
import ArticleAside from "../../components/journal/ArticleAside";
import { Bullets, Callout, Figure, H2, H3, P, Quote, Steps } from "../../components/journal/ArticleParts";
import { PostCard } from "../../components/journal/PostGrid";
import { POSTS } from "../../components/journal/posts";
import ReadingProgress from "../../components/journal/ReadingProgress";
import Breadcrumb from "../../components/shared/Breadcrumb";
import ParallaxImage from "../../components/effects/parallax-image";
import SectionHead from "../../components/shared/SectionHead";
import cloudline from "../../assets/w-cloudline.webp";
import drift from "../../assets/w-drift.webp";
import team1 from "../../assets/team-1.webp";

export const metadata = pageMetadata(
  "Your brand guidelines are too long | The Missing Pixel",
  "The longer the rulebook, the less your brand looks like itself. How we write guidelines people open on purpose.",
  "/journal/brand-guidelines",
);

const page = () => (
  <>
    <ReadingProgress targetId="article-body" />
    <section className="mpx-container flex flex-col gap-11 py-[3vw] max-lg:gap-8 max-lg:py-[6vw] max-md:gap-9 max-md:py-[10vw]">
      <div aria-hidden className="h-[12vh] max-lg:h-[8vh] max-md:h-[9vh]" />
      <Breadcrumb
        crumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Journal", href: ROUTES.journal },
          { label: "Brand guidelines" },
        ]}
      />
      <header className="flex flex-col items-start gap-8 max-lg:gap-6">
        <span className="inline-flex h-[3.2vh] items-center rounded-full border border-black/20 px-[0.9vw] text-14 max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]">
          Branding
        </span>
        <MaskReveal as="h1" delay={PAGE_DELAY} className="w-[75%] max-lg:w-full">
          Your brand guidelines are too long. Nobody reads page 74.
        </MaskReveal>
        <FadeUp delay={PAGE_DELAY + 0.3} className="flex flex-wrap items-center gap-x-9 gap-y-3 text-22 text-mpx-muted max-lg:gap-x-6">
          <span className="flex items-center gap-3">
            <span className="aspect-square h-[5vh] shrink-0 overflow-hidden rounded-full max-lg:h-[4vh] max-md:h-[6vh]">
              <Image src={team1} alt="" sizes="4vw" className="h-full w-full object-cover" />
            </span>
            Clara Whitfield, head of writing
          </span>
          <time dateTime="2026-09-24">Sep 24, 2026</time>
          <span>6 min read</span>
        </FadeUp>
      </header>
    </section>

    <div className="mpx-container">
      <ParallaxImage
        image={cloudline}
        alt="Model resting in soft pink clouds"
        className="aspect-video rounded-3xl"
        priority
      />
    </div>

    <section className="mpx-container mpx-section">
      <div className="flex justify-between gap-11 max-lg:flex-col max-lg:gap-9">
        <ArticleAside links={TOC} subject="Your brand guidelines are too long" />
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
            image={drift}
            alt="Mint camper van on a desert road"
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
                className="inline-flex h-[3.2vh] items-center rounded-full border border-black/20 px-[0.9vw] text-14 max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]"
              >
                {tag}
              </li>
            ))}
          </FadeUp>
          <FadeUp className="flex items-start gap-5 border-t border-black/10 py-[2vw] max-lg:py-[4vw] max-md:py-[7vw]">
            <div className="aspect-square h-[9vh] shrink-0 overflow-hidden rounded-full max-lg:h-[7vh] max-md:h-[10vh]">
              <Image src={team1} alt="" sizes="8vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-30">Clara Whitfield</h3>
              <p className="text-24 text-mpx-muted">
                Clara runs writing out of the London studio. Before that she spent eight years in-house, so she has read a great many guidelines she didn’t write.
              </p>
            </div>
          </FadeUp>
        </article>
      </div>
    </section>

    <section className="mpx-container flex flex-col gap-14 border-t border-black/10 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
      <SectionHead title="Keep reading">
        <PixelButton label="All Essays" href={ROUTES.journal} variant="outline" size="sm" />
      </SectionHead>
      <div className="grid grid-cols-3 gap-x-9 gap-y-14 max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-11 max-md:grid-cols-1 max-md:gap-y-12">
        {POSTS.slice(0, 3).map((post, index) => (
          <PostCard key={post.title} post={post} index={index} />
        ))}
      </div>
    </section>
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;

const TOC = [
  { label: "Why long rulebooks fail", id: "rules-fail" },
  { label: "What to keep", id: "what-to-keep" },
  { label: "How we write them now", id: "how-we-write" },
  { label: "Where to start", id: "start-here" },
];

const TAGS = ["Guidelines", "Brand systems", "Writing"];
