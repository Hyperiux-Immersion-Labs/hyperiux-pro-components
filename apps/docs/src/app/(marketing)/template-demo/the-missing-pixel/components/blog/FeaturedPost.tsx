// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import Link from "next/link";
import { FadeUp, LineReveal, MaskReveal } from "../Animations/gsapAnim";
import Tilt from "../Animations/Tilt";
import UnderlineLink from "../Buttons/UnderlineLink";
import PixelReveal from "../effects/pixel-reveal";
import journalOne from "../../assets/pictures/j-1.webp";
import { postPath } from "../../routes";
import { FEATURED_POST } from "./posts";

const FeaturedPost = () => (
  <FadeUp>
    <Tilt>
    <div className="group flex items-center justify-between gap-5 max-lg:flex-col max-lg:items-start max-lg:gap-7">
      <Link
        href={postPath(FEATURED_POST.slug)}
        data-cursor="Read"
        tabIndex={-1}
        aria-hidden
        className="block aspect-[16/11] w-[55%] overflow-hidden rounded-lg max-lg:w-full"
      >
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
          <PixelReveal gridSize={26} edgeHeight={0.4} direction="down" start="top 85%" className="h-full w-full">
            <Image
              quality={95}
              src={journalOne}
              alt=""
              priority
              sizes="(max-width: 1025px) 90vw, 57vw"
              className="h-full w-full object-cover"
            />
          </PixelReveal>
        </div>
      </Link>
      <div className="flex w-[40%] flex-col items-start gap-5 max-lg:w-full">
        <div className="flex gap-4 text-14 text-mpx-muted">
          <span>Latest, Branding</span>
          <time dateTime="2026-09-24">Sep 24, 2026</time>
        </div>
        <MaskReveal as="h2" className="text-40 tracking-normal!">Your brand guidelines are too long. Nobody reads page 74.</MaskReveal>
        <LineReveal className="text-24 leading-[1.3] text-mpx-muted">
          The longer the rulebook, the less your brand looks like itself. How we write guidelines people open on purpose.
        </LineReveal>
        <FadeUp delay={0.2}>
          <UnderlineLink href={postPath(FEATURED_POST.slug)} className="font-mpx-head text-22 font-medium text-mpx-ink">
            Read The Essay
          </UnderlineLink>
        </FadeUp>
      </div>
    </div>
    </Tilt>
  </FadeUp>
);

export default FeaturedPost;
