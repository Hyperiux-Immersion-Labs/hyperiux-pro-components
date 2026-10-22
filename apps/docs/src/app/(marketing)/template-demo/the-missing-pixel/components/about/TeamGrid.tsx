// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import { ArrowUpRight } from "../Buttons/icons";
import ParallaxImage from "../effects/parallax-image";
import team1 from "../../assets/team-1.webp";
import team2 from "../../assets/team-2.webp";
import { ROUTES } from "../../routes";

const LINK_CLASSES =
  "translate-y-2.5 opacity-0 transition-[opacity,transform] duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100 inline-flex h-[3.2vh] items-center rounded-full bg-[#f5f5f5] px-[0.9vw] text-14 text-[#0a0a0a] max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]";

const TeamGrid = () => (
  <ul className="grid grid-cols-4 gap-x-9 gap-y-14 max-lg:grid-cols-3 max-lg:gap-x-6 max-lg:gap-y-11 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-9">
    {TEAM.map((member, index) => (
      <FadeUp as="li" key={member.name} delay={(index % 4) * 0.08}>
        <article className="group flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="saturate-[.55] transition-[filter,transform] duration-1000 group-hover:scale-105 group-hover:saturate-100">
              <ParallaxImage
                image={index % 2 === 0 ? team1 : team2}
                alt={`Portrait of ${member.name}`}
                sizes="(max-width: 768px) 45vw, (max-width: 1025px) 30vw, 22vw"
                className="aspect-[4/5]"
              />
            </div>
            <div className="absolute inset-x-[5%] bottom-[4%] flex gap-2">
              <a href="https://www.linkedin.com/" rel="noopener" aria-label={`${member.name} on LinkedIn`} className={LINK_CLASSES}>
                LinkedIn
              </a>
              <a href="mailto:hello@themissingpixel.studio" aria-label={`Email ${member.name}`} className={`${LINK_CLASSES} delay-75`}>
                Email
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-30">{member.name}</h3>
            <p className="text-24 text-mpx-muted">{member.role}</p>
          </div>
        </article>
      </FadeUp>
    ))}
    <FadeUp as="li" delay={0.24}>
      <Link
        href={ROUTES.contact}
        data-cursor="Apply"
        className="group flex aspect-[4/5] flex-col justify-between gap-6 rounded-2xl bg-[#0a0a0a] px-[1.6vw] py-[1.6vw] text-[#f5f5f5] transition-colors duration-500 hover:bg-[#ff5f00] hover:text-[#0a0a0a] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[5vw]"
      >
        <span className="flex flex-col gap-3">
          <strong className="font-mpx-head text-40 font-medium">This spot is yours.</strong>
          <span className="text-24 opacity-60">
            We’re hiring a senior motion designer in London or Dubai.
          </span>
        </span>
        <ArrowUpRight className="size-[2vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[3.6vw] max-md:size-[8vw]" />
      </Link>
    </FadeUp>
  </ul>
);

export default TeamGrid;

const TEAM = [
  { name: "Leila Haddad", role: "Design director, Dubai" },
  { name: "Mei Lin", role: "Producer, Dubai" },
  { name: "Marcus Bell", role: "Head of strategy, London" },
  { name: "Ana Sofía Reyes", role: "Senior designer, New York" },
  { name: "Clara Whitfield", role: "Head of writing, London" },
  { name: "Kenji Park", role: "Creative technologist, New York" },
  { name: "Riya Kapoor", role: "Design lead, Delhi" },
];
