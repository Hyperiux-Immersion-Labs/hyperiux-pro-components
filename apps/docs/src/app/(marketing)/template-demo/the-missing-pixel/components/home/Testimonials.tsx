// Built using Hyperiux Vault: https://vault.hyperiux.com

import TestimonialSwiper from "../effects/testimonial-swiper/index";
import { FadeUp } from "../Animations/gsapAnim";
import ama from "../../assets/w-cloudline.webp";
import daniel from "../../assets/w-northway.webp";
import elena from "../../assets/w-drift.webp";

const Testimonials = () => (
  <section id="stories" className="mpx-container mpx-section border-t border-black/10">
    <h2 className="sr-only">What clients say</h2>
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
    role: "Founder, Cloudline",
    image: ama,
  },
  {
    quote:
      "Our board was nervous. They treated that as a design problem, not an obstacle, and twelve weeks later every team wanted to use the brand.",
    name: "Daniel Cho",
    role: "CEO, Orbit Labs",
    image: daniel,
  },
  {
    quote:
      "On time, 100 on accessibility, bookings doubled in a season. I keep waiting for the catch.",
    name: "Elena Ruiz",
    role: "Head of product, Drift Campers",
    image: elena,
  },
];
