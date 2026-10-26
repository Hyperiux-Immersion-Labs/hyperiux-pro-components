// Built using Hyperiux Vault: https://vault.hyperiux.com

import TestimonialSwiper from "../effects/testimonial-swiper/index";
import { FadeUp, MaskReveal, LineReveal } from "../Animations/gsapAnim";
import cloudline from "../../assets/pictures/tst-cloudline.webp";
import orbit from "../../assets/pictures/tst-orbit.webp";
import drift from "../../assets/pictures/tst-drift.webp";
import kickflip from "../../assets/pictures/tst-kickflip.webp";
import northway from "../../assets/pictures/tst-northway.webp";
import lumen from "../../assets/pictures/tst-lumen.webp";
import faceCloudline from "../../assets/pictures/q-2.webp";
import faceOrbit from "../../assets/pictures/q-1.webp";
import faceDrift from "../../assets/pictures/q-3.webp";
import faceKickflip from "../../assets/pictures/q-4.webp";
import faceNorthway from "../../assets/pictures/q-5.webp";
import faceLumen from "../../assets/pictures/q-6.webp";

const Testimonials = () => (
  <section
    id="stories"
    className="flex flex-col gap-[6vw] px-[5vw] py-[7%] max-lg:gap-[10vw] max-lg:px-[6vw] max-lg:py-[12%] max-md:gap-14 max-md:px-[7vw] max-md:py-[15%]"
  >
    <div className="grid grid-cols-[1fr_31%] items-end gap-x-[2vw] gap-y-[1vw] max-lg:grid-cols-1 max-lg:gap-y-4">
      <MaskReveal
        as="h2"
      >
        What clients say
      </MaskReveal>
      <LineReveal className="w-[83%] text-24 leading-[1.55] text-mpx-muted max-lg:w-[70%]  max-md:w-full ">
        Six clients, in their own words, on what changed after we worked together.
      </LineReveal>
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
    image: faceCloudline,
    media: cloudline,
  },
  {
    quote:
      "Our board was nervous. They treated that as a design problem, not an obstacle, and twelve weeks later every team wanted to use the brand.",
    name: "Daniel Cho",
    role: "CEO at Orbit Labs",
    image: faceOrbit,
    media: orbit,
  },
  {
    quote:
      "On time, 100 on accessibility, bookings doubled in a season. I keep waiting for the catch.",
    name: "Elena Ruiz",
    role: "Head of product at Drift Campers",
    image: faceDrift,
    media: drift,
  },
  {
    quote:
      "They spent a week at the skatepark before they opened a sketchbook. The identity finally looks like it was made by people who skate.",
    name: "Leo Marquez",
    role: "Founder at Kickflip Supply",
    image: faceKickflip,
    media: kickflip,
  },
  {
    quote:
      "Our logo now moves with the music on every release. Fans were remixing it themselves within a month.",
    name: "Freya Holt",
    role: "Label manager at Northway Records",
    image: faceNorthway,
    media: northway,
  },
  {
    quote:
      "A launch with real personality, on a deadline that scared other agencies off. Pre-orders beat our forecast by a third.",
    name: "Omar Fayed",
    role: "VP marketing at Lumen Mobile",
    image: faceLumen,
    media: lumen,
  },
];
