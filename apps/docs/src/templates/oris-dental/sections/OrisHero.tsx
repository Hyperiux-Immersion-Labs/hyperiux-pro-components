import TeethCanvas from "../components/TeethCanvas";
import DotsCanvas from "../components/DotsCanvas";
import OrisCard from "../components/OrisCard";
import SplitTextLines from "../components/SplitTextLines";

export default function OrisHero() {
  return (
    <section id="oris-hero" className="h-screen sticky top-0 z-0 bg-linear-to-t from-[#3365E2] via-[#3365E2] to-white overflow-hidden w-full">
      <div className="h-full w-full relative">

        <DotsCanvas spacing={22} lerpFactor={0.15} baseRadius={1.4} maxRadius={3.8} interactionRadius={200} />
        <TeethCanvas />

        <div className="w-full oris-paddx flex items-center h-full">

          <div className="w-1/2 gap-[2vw] flex items-start justify-center flex-col h-full">
            <SplitTextLines as="h1" className="oris-text64 w-[30vw]" delay={1} waitForLoader>
              Brighten your smile with expert dental care
            </SplitTextLines>
            <SplitTextLines as="p" className="w-[20vw] oris-tex22" delay={1.25} waitForLoader>
              We provide gentle, personalized dental treatments that help patients feel relaxed with greater confidence
            </SplitTextLines>
          </div>
          <div className="w-1/2 flex gap-[4vw] items-end justify-end pb-[5vw] flex-col h-full">
            <SplitTextLines as="p"  className="w-[30vw] pr-[1vw] oris-tex22" delay={1.5} waitForLoader>
              Our treatments are designed to support patients across diverse needs and clinical situations, from routine cleaning to complex restorative procedures. Every treatment plan is personalized to your specific dental health goals, budget considerations, and timeline preferences.
            </SplitTextLines>

            <OrisCard />
          </div>

        </div>
      </div>

    </section>
  )
}
