// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import Tilt from "../Animations/Tilt";
import { ArrowUpRight } from "../Buttons/icons";
import cloudline from "../../assets/w-cloudline.webp";
import { ROUTES } from "../../routes";

const FeaturedPost = () => (
  <FadeUp>
    <Tilt>
    <Link
      href={ROUTES.article}
      data-cursor="Read"
      className="group flex items-center justify-between gap-11 max-lg:flex-col max-lg:items-start max-lg:gap-7"
    >
      <div className="aspect-[16/11] w-[57%] overflow-hidden rounded-2xl bg-mpx-surface max-lg:w-full">
        <Image
          src={cloudline}
          alt=""
          priority
          sizes="(max-width: 1025px) 90vw, 57vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex w-[31%] flex-col items-start gap-5 max-lg:w-full">
        <div className="flex gap-4 text-14 text-mpx-muted">
          <span>Latest, Branding</span>
          <time dateTime="2026-09-24">Sep 24, 2026</time>
        </div>
        <h2>Your brand guidelines are too long. Nobody reads page 74.</h2>
        <p className="text-28 text-mpx-muted">
          The longer the rulebook, the less your brand looks like itself. How we write guidelines people open on purpose.
        </p>
        <span className="font-mpx-head inline-flex items-center gap-2 text-22 font-medium text-[#0a0a0a] transition-colors duration-300 group-hover:text-[#ff5f00]">
          Read The Essay
          <ArrowUpRight className="size-[1.2vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
        </span>
      </div>
    </Link>
    </Tilt>
  </FadeUp>
);

export default FeaturedPost;
