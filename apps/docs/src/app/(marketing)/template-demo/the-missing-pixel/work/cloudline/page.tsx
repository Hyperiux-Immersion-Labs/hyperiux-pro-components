// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../../metadata";
import { ROUTES } from "../../routes";
import { FadeUp, MaskReveal } from "../../components/Animations/gsapAnim";
import Credits from "../../components/work/Credits";
import Facts from "../../components/shared/Facts";
import Gallery from "../../components/work/Gallery";
import NextProject from "../../components/work/NextProject";
import PageHero from "../../components/shared/PageHero";
import ParallaxImage from "../../components/effects/parallax-image";
import QuoteBlock from "../../components/shared/QuoteBlock";
import Split from "../../components/shared/Split";
import StatsRow from "../../components/shared/StatsRow";
import cloudline from "../../assets/w-cloudline.webp";
import gallery1 from "../../assets/w-kickflip.webp";
import gallery2 from "../../assets/w-northway.webp";
import gallery3 from "../../assets/w-drift.webp";
import reelPoster from "../../assets/reel-poster.webp";
import quote from "../../assets/w-cloudline.webp";

export const metadata = pageMetadata(
  "Cloudline | The Missing Pixel",
  "How The Missing Pixel built the brand, packs and launch for Cloudline around one image: hair falling into clouds.",
  "/work/cloudline",
);

const page = () => (
  <>
    <PageHero
      crumbs={[
        { label: "Home", href: ROUTES.home },
        { label: "Work", href: ROUTES.work },
        { label: "Cloudline" },
      ]}
      title="Cloudline"
      text="Every haircare brand was shouting about science. Cloudline wanted to talk about how it feels. We built the brand, the packs and the launch around one image: hair falling into clouds."
    />
    <div className="mpx-container flex flex-col gap-14 max-lg:gap-11">
      <Facts
        items={[
          { label: "Client", value: "Cloudline Beauty" },
          { label: "Year", value: "2026" },
          { label: "What we did", value: "Strategy, identity, packaging, launch" },
          { label: "Timeline", value: "14 weeks, Dubai and London" },
        ]}
      />
      <ParallaxImage
        image={cloudline}
        alt="Model resting in soft pink clouds, from the Cloudline launch"
        className="aspect-video rounded-lg"
        priority
      />
      <div className="flex flex-col gap-14 py-[3vw] max-lg:gap-11 max-lg:py-[6vw]">
        <FadeUp>
          <Split title="The problem">
            <p className="text-28">
              Cloudline had a formula salons loved and no brand at all. The shelf they wanted was a wall of lab coats and percentages.
            </p>
            <p className="text-28 text-mpx-muted">
              The brief: sit next to prestige labels in a department store, still feel warm on Instagram, and fit on a pack small enough for a travel kit. No pressure.
            </p>
          </Split>
        </FadeUp>
        <FadeUp>
          <Split title="The missing pixel">
            <p className="text-28">
              Nobody in the category was selling the feeling. So we did. One pink, one image, one rounded wordmark that looks like it’s exhaling.
            </p>
            <p className="text-28 text-mpx-muted">
              Texture, not colour, separates the range, so the shelf reads as one calm block. We shot the campaign in a single day on a soft-sculpture set and cut it into a 20-second film for launch.
            </p>
          </Split>
        </FadeUp>
      </div>
      <Gallery
        items={[
          { image: gallery1, alt: "Skater mid-trick against a concrete wall", full: true },
          { image: gallery2, alt: "Portrait lit by a huge orange sun" },
          { image: gallery3, alt: "Mint camper van on a desert road" },
        ]}
        video={{ src: "/templates/the-missing-pixel/reel.mp4", poster: reelPoster.src, label: "Cloudline launch film" }}
      />
    </div>
    <section className="mpx-container mpx-section flex flex-col gap-14 max-lg:gap-11">
      <div className="flex items-end justify-between gap-9 max-lg:flex-col max-lg:items-start max-lg:gap-4">
        <MaskReveal as="h2">What happened next</MaskReveal>
        <p className="text-28 text-mpx-muted">Measured six months after launch.</p>
      </div>
      <StatsRow
        items={[
          { value: "2.1×", label: "sell-through against the category average" },
          { value: "46", label: "salons and stores in year one" },
          { value: "3.4M", label: "views of a 20-second film about clouds" },
        ]}
      />
    </section>
    <div className="mpx-container flex flex-col gap-14 py-[8%] max-lg:gap-11 max-lg:py-[11%] max-md:py-[20%]">
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
    <div className="mpx-container">
      <NextProject />
    </div>
  </>
);

export default page;
