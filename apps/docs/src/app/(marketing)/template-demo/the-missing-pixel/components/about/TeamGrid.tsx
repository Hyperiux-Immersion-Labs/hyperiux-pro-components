// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import { ArrowUpRight } from "../Buttons/icons";
import ParallaxImage from "../effects/parallax-image";
import team1 from "../../assets/team-1.webp";
import team2 from "../../assets/team-2.webp";
import { ROUTES } from "../../routes";

const LINK_CLASSES =
  "translate-y-[250%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:translate-y-0 group-hover:translate-y-0 max-lg:translate-y-0 inline-flex h-[3.2vh] items-center rounded-full bg-[#f5f5f5] px-[0.9vw] text-14 text-[#0a0a0a] max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[3.8vh] max-md:px-[3.5vw]";

const TeamGrid = () => (
  <ul className="grid grid-cols-4 gap-x-9 gap-y-14 max-lg:grid-cols-3 max-lg:gap-x-6 max-lg:gap-y-11 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-9">
    {TEAM.map((member, index) => (
      <FadeUp as="li" key={member.name} delay={(index % 4) * 0.08}>
        <article className="group flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg">
            <div className="saturate-[.55] transition-[filter] duration-700 ease-out group-hover:saturate-100">
              <div className="transform-gpu will-change-transform transition-transform duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                <ParallaxImage
                  pixel
                  image={index % 2 === 0 ? team1 : team2}
                  alt={`Portrait of ${member.name}`}
                  sizes="(max-width: 768px) 45vw, (max-width: 1025px) 30vw, 22vw"
                  className="aspect-[4/5]"
                />
              </div>
            </div>
            <div className="absolute inset-x-[5%] bottom-[4%] flex gap-2">
              <a href="https://www.linkedin.com/" rel="noopener" aria-label={`${member.name} on LinkedIn`} className={LINK_CLASSES}>
                LinkedIn
              </a>
              <a href="mailto:hello@themissingpixel.studio" aria-label={`Email ${member.name}`} className={`${LINK_CLASSES} delay-50`}>
                Email
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-24 font-medium!">{member.name}</h3>
            <p className="text-14 text-mpx-muted">{member.role}</p>
          </div>
        </article>
      </FadeUp>
    ))}
    <FadeUp as="li" delay={0.24} className="max-md:col-span-2">
      <Link
        href={ROUTES.contact}
        data-cursor="Apply"
        className="group relative flex aspect-[4/5] max-md:aspect-auto flex-col justify-between gap-6 overflow-hidden rounded-lg bg-[#0a0a0a] px-[1.6vw] py-[1.6vw] text-[#f5f5f5] transition-colors duration-500 hover:text-[#0a0a0a] max-lg:px-[3vw] max-lg:py-[3vw] max-md:gap-[10vw] max-md:px-[5vw] max-md:py-[6vw]"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-(image:--mpx-grad) opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <strong className="font-mpx-head relative text-40 leading-[1.3] font-medium">This spot is yours.</strong>
        <p className="relative text-24 leading-[1.3] opacity-60">
          We’re hiring a senior motion designer in London or Dubai.
        </p>
        <ArrowUpRight className="relative size-[2vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[3.6vw] max-md:size-[8vw]" />
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
