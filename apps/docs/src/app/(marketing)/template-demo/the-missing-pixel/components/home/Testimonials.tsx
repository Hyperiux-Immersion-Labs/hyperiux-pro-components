// Built using Hyperiux Vault: https://vault.hyperiux.com

import TestimonialSwiper from "../effects/testimonial-swiper/index";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import cloudline from "../../assets/w-cloudline.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import kickflip from "../../assets/w-kickflip.webp";
import menuPoster from "../../assets/menu-poster.webp";
import reelPoster from "../../assets/reel-poster.webp";

const Testimonials = () => (
  <section
    id="stories"
    className="flex flex-col gap-[4.5vw] px-[5vw] py-[9vw] max-lg:gap-[8vw] max-lg:px-[4vw] max-lg:py-[12vw] max-md:gap-10 max-md:px-[5vw] max-md:py-[16vw]"
  >
    <div className="grid grid-cols-[1fr_31%] items-end gap-x-[2vw] gap-y-[1vw] max-lg:grid-cols-1 max-lg:gap-y-4">
      <MaskReveal
        as="h2"
        className="[.mpx-page_&]:text-[2.9vw] [.mpx-page_&]:tracking-[-0.1vw] max-lg:[.mpx-page_&]:text-[5vw] max-md:[.mpx-page_&]:text-[8vw]"
      >
        What clients say
      </MaskReveal>
      <p className="w-[83%] text-[1vw] leading-[1.55] text-mpx-muted max-lg:w-[70%] max-lg:text-[2vw] max-md:w-full max-md:text-[3.6vw]">
        Six clients, in their own words, on what changed after we worked together.
      </p>
    </div>
    <FadeUp>
      <TestimonialSwiper items={TESTIMONIALS} />
    </FadeUp>
  </section>
);

export default Testimonials;

const TESTIMONIALS = [
  {
    quote:
      "They found the one sentence we’d been circling for five years. Sell-through doubled in our first quarter on shelf.",
    name: "Ama Owusu",
    role: "Founder at Cloudline",
    image: cloudline,
    media: cloudline,
  },
  {
    quote:
      "Our board was nervous. They treated that as a design problem, not an obstacle, and twelve weeks later every team wanted to use the brand.",
    name: "Daniel Cho",
    role: "CEO at Orbit Labs",
    image: northway,
    media: northway,
  },
  {
    quote:
      "On time, 100 on accessibility, bookings doubled in a season. I keep waiting for the catch.",
    name: "Elena Ruiz",
    role: "Head of product at Drift Campers",
    image: drift,
    media: drift,
  },
  {
    quote:
      "They spent a week at the skatepark before they opened a sketchbook. The identity finally looks like it was made by people who skate.",
    name: "Leo Marquez",
    role: "Founder at Kickflip Supply",
    image: kickflip,
    media: kickflip,
  },
  {
    quote:
      "Our logo now moves with the music on every release. Fans were remixing it themselves within a month.",
    name: "Freya Holt",
    role: "Label manager at Northway Records",
    image: menuPoster,
    media: menuPoster,
  },
  {
    quote:
      "A launch with real personality, on a deadline that scared other agencies off. Pre-orders beat our forecast by a third.",
    name: "Omar Fayed",
    role: "VP marketing at Lumen Mobile",
    image: reelPoster,
    media: reelPoster,
  },
];
