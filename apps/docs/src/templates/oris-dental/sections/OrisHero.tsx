import TeethCanvas from "../components/TeethCanvas";
import DotsCanvas from "../components/DotsCanvas";
import OrisCard from "../components/OrisCard";
import SplitTextLines from "../components/SplitTextLines";

export default function OrisHero() {
  return (
    <section id="oris-hero" className=" h-dvh sticky top-0 z-0 bg-linear-to-t from-[#3365E2] via-[#3365E2] to-white overflow-hidden w-full max-[1025px]:h-dvh max-md:h-dvh">
      <div className="h-full w-full relative flex flex-col justify-between">

        <DotsCanvas spacing={22} lerpFactor={0.15} baseRadius={1.4} maxRadius={3.8} interactionRadius={200} />
        <TeethCanvas />

        <div className="w-full oris-paddx flex items-center justify-between h-full max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:justify-between max-[1025px]:pt-[18vw] max-[1025px]:pb-[5vw] max-md:pt-20 max-md:pb-6 z-10 pointer-events-none *:pointer-events-auto">

          <div className="w-1/2 max-[1025px]:w-full gap-[2vw] max-[1025px]:gap-2 flex items-start justify-center flex-col max-[1025px]:h-auto">
            <SplitTextLines as="h1" className="oris-text64 w-[30vw] max-[1025px]:w-[75vw] max-md:w-full" delay={1} waitForLoader>
              Brighten your smile with expert dental care
            </SplitTextLines>
            <SplitTextLines as="p" className="w-[20vw] max-[1025px]:w-[55vw] max-md:w-full oris-text22 " delay={1.25} waitForLoader>
              We provide gentle, personalized dental treatments that help patients feel relaxed with greater confidence
            </SplitTextLines>
          </div>

          <div className="w-1/2 mt-auto max-[1025px]:w-full flex gap-[4vw] max-[1025px]:gap-3 items-end max-[1025px]:items-start justify-end pb-[5vw] max-[1025px]:pb-0 flex-col max-[1025px]:h-auto">
            <SplitTextLines as="p" className="w-[30vw] max-[1025px]:w-[65vw] max-md:w-full pr-[1vw] max-[1025px]:pr-0 oris-text22 max-[1025px]:hidden" delay={1.5} waitForLoader>
              Our treatments are designed to support patients across diverse needs and clinical situations, from routine cleaning to complex restorative procedures. Every treatment plan is personalized to your specific dental health goals, budget considerations, and timeline preferences.
            </SplitTextLines>

            <OrisCard className="max-[1025px]:w-[55vw] max-md:w-full max-[1025px]:p-4 max-[1025px]:rounded-xl" />
          </div>

        </div>
      </div>

    </section>
  )
}
