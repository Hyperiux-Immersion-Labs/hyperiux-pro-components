// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, LineReveal, MaskReveal } from "../Animations/gsapAnim";
import ParallaxImage from "../effects/parallax-image";
import QuoteBlock from "../shared/QuoteBlock";
import StatsRow from "../shared/StatsRow";
import { workPath } from "../../routes";
import CaseSplit from "./CaseSplit";
import Credits from "./Credits";
import Gallery from "./Gallery";
import NextProject from "./NextProject";
import type { Project } from "./projects";
import quote from "../../assets/pictures/q-2.webp";

type CaseBodyProps = {
  project: Project;
  next: Project;
};

const CaseBody = ({ project, next }: CaseBodyProps) => (
  <>
    <div className="flex flex-col gap-14 px-[5vw] max-lg:gap-11 max-lg:px-[6vw] max-md:px-[7vw]">
      <ParallaxImage
        pixel
        hoverZoom
        image={project.image}
        alt={project.alt}
        className="aspect-video rounded-lg"
        priority
      />
      <div className="flex flex-col gap-14 py-[3vw] max-lg:gap-11 max-lg:py-[6vw]">
        <FadeUp>
          <CaseSplit title="The problem">
            <LineReveal className="text-28 leading-[1.3]">
              Cloudline had a formula salons loved and no brand at all. The shelf they wanted was a wall of lab coats and percentages.
            </LineReveal>
            <LineReveal className="text-28 leading-[1.3] text-mpx-muted">
              The brief: sit next to prestige labels in a department store, still feel warm on Instagram, and fit on a pack small enough for a travel kit. No pressure.
            </LineReveal>
          </CaseSplit>
        </FadeUp>
        <FadeUp>
          <CaseSplit title="The missing pixel">
            <LineReveal className="text-28 leading-[1.3]">
              Nobody in the category was selling the feeling. So we did. One pink, one image, one rounded wordmark that looks like it’s exhaling.
            </LineReveal>
            <LineReveal className="text-28 leading-[1.3] text-mpx-muted">
              Texture, not colour, separates the range, so the shelf reads as one calm block. We shot the campaign in a single day on a soft-sculpture set and cut it into a 20-second film for launch.
            </LineReveal>
          </CaseSplit>
        </FadeUp>
      </div>
      <Gallery
        items={project.gallery.map((item, index) => ({ ...item, full: index === 0 || index === 3 }))}
      />
    </div>
    <section className="mpx-section flex flex-col gap-24 px-[5vw] max-lg:gap-11 max-lg:px-[6vw] max-md:px-[7vw]">
      <div className="flex flex-col gap-4 max-lg:items-start">
        <MaskReveal as="h2">What happened next</MaskReveal>
        <LineReveal className="text-28 leading-[1.3] text-mpx-muted">Measured six months after launch.</LineReveal>
      </div>
      <StatsRow
        items={[
          { value: "2.1×", label: "sell-through against the category average" },
          { value: "46", label: "salons and stores in year one" },
          { value: "3.4M", label: "views of a 20-second film about clouds" },
        ]}
      />
    </section>
    <div className="flex flex-col gap-14 px-[5vw] py-[8%] max-lg:gap-11 max-lg:px-[6vw] max-lg:py-[11%] max-md:px-[7vw] max-md:py-[20%]">
      <QuoteBlock
        quote="We came in with a formula and a feeling. They turned the feeling into a brand. People pick the bottle up just to find out what it feels like."
        name="Ama Owusu"
        role="Founder, Cloudline"
        image={quote}
      />
      <Credits
        items={[
          { role: "Creative direction", names: "Naina Sethi" },
          { role: "Strategy", names: "Marcus Bell" },
          { role: "Design", names: "Leila Haddad, Ana Sofía Reyes" },
          { role: "Words", names: "Clara Whitfield" },
          { role: "Motion", names: "Kenji Park" },
          { role: "Production", names: "Mei Lin" },
        ]}
      />
    </div>
    <div className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
      <NextProject title={next.title} image={next.image} alt={next.alt} href={workPath(next.title)} />
    </div>
  </>
);

export default CaseBody;
