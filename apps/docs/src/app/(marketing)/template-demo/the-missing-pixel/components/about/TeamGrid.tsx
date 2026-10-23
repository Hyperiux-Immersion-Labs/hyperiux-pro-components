// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import { ArrowUpRight } from "../Buttons/icons";
import SpotlightEffect from "../effects/spotlight-effect";
import member1 from "../../assets/pictures/member-1.webp";
import member1Lit from "../../assets/pictures/member-1-lit.webp";
import member2 from "../../assets/pictures/member-2.webp";
import member2Lit from "../../assets/pictures/member-2-lit.webp";
import member3 from "../../assets/pictures/member-3.webp";
import member3Lit from "../../assets/pictures/member-3-lit.webp";
import member4 from "../../assets/pictures/member-4.webp";
import member4Lit from "../../assets/pictures/member-4-lit.webp";
import member5 from "../../assets/pictures/member-5.webp";
import member5Lit from "../../assets/pictures/member-5-lit.webp";
import member6 from "../../assets/pictures/member-6.webp";
import member6Lit from "../../assets/pictures/member-6-lit.webp";
import member7 from "../../assets/pictures/member-7.webp";
import member7Lit from "../../assets/pictures/member-7-lit.webp";
import { ROUTES } from "../../routes";

const LINK_CLASSES =
  "translate-y-[250%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:translate-y-0 group-hover:translate-y-0 max-lg:translate-y-0 inline-flex h-[3.2vh] items-center rounded-full bg-(--mpx-paper) px-[0.9vw] text-14 text-(color:--mpx-ink) max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[3.8vh] max-md:px-[3.5vw]";

const TeamGrid = () => (
  <ul className="grid grid-cols-4 gap-x-9  gap-y-14  max-lg:gap-x-6 max-lg:gap-y-11 max-lg:grid-cols-2 max-md:flex max-md:w-full max-md:max-w-full max-md:snap-x max-md:snap-mandatory max-md:gap-x-4 max-md:overflow-x-scroll max-md:pb-4 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
    {TEAM.map((member, index) => (
      <FadeUp as="li" key={member.name} delay={(index % 4) * 0.08} className="max-md:w-full max-md:shrink-0 max-md:snap-start max-md:px-[7vw]">
        <article className="h-full">
          <SpotlightEffect
            image={member.image}
            litImage={member.lit}
            alt={`Portrait of ${member.name}`}
            sizes="(max-width: 768px) 45vw, (max-width: 1025px) 30vw, 22vw"
            className="h-full"
            body={
              <div className="flex flex-1 flex-col content-start gap-1 px-2 pt-4 pb-2">
                <h3 className="text-24 font-medium!">{member.name}</h3>
                <p className="text-14 opacity-60">{member.role}</p>
              </div>
            }
          >
            <div className="absolute inset-x-[5%] bottom-[4%] z-2 flex gap-2">
              <Link href="https://www.linkedin.com/" rel="noopener" aria-label={`${member.name} on LinkedIn`} className={LINK_CLASSES}>
                LinkedIn
              </Link>
              <Link href="mailto:hello@themissingpixel.studio" aria-label={`Email ${member.name}`} className={`${LINK_CLASSES} delay-50`}>
                Email
              </Link>
            </div>
          </SpotlightEffect>
        </article>
      </FadeUp>
    ))}
    <FadeUp as="li" delay={0.24} className="max-md:w-full max-md:shrink-0 max-md:snap-start max-md:px-[7vw]">
      <Link
        href={ROUTES.contact}
        data-cursor="Apply"
        className="group relative flex max-md:px-[7vw] h-full flex-col justify-between gap-6 overflow-hidden rounded-lg bg-mpx-ink px-[1.6vw] py-[1.6vw] text-mpx-paper transition-colors duration-500 hover:text-mpx-ink max-lg:px-[3vw] max-lg:py-[3vw] max-md:gap-[10vw]  max-md:py-[6vw]"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-(image:--mpx-grad) opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <strong className="font-mpx-head relative text-40 leading-[1.3] font-medium">This spot is yours.</strong>
        <p className="relative text-24 leading-[1.3]">
          We’re hiring a senior motion designer in London or Dubai.
        </p>
        <ArrowUpRight className="relative size-[2vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[3.6vw] max-md:size-[8vw]" />
      </Link>
    </FadeUp>
  </ul>
);

export default TeamGrid;

const TEAM = [
  { name: "Leila Haddad", role: "Design director, Dubai", image: member1, lit: member1Lit },
  { name: "Mei Lin", role: "Producer, Dubai", image: member2, lit: member2Lit },
  { name: "Marcus Bell", role: "Head of strategy, London", image: member3, lit: member3Lit },
  { name: "Ana Sofía Reyes", role: "Senior designer, New York", image: member4, lit: member4Lit },
  { name: "Clara Whitfield", role: "Head of writing, London", image: member5, lit: member5Lit },
  { name: "Kenji Park", role: "Creative technologist, New York", image: member6, lit: member6Lit },
  { name: "Riya Kapoor", role: "Design lead, Delhi", image: member7, lit: member7Lit },
];
