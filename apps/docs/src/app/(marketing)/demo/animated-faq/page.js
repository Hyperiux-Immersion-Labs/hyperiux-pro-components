import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import AnimatedFaq from "@/components/animated-faq";

export async function generateMetadata() {
  return getDemoPageMetadata("animated-faq");
}

export default function Page() {
  return (
    <>
      <DemoHeader textColor="#ffffff" logoColor="#FFFFFF" />
      <section className="bg-black h-screen px-8 py-20 text-white">
        <div className="max-w-5xl mx-auto text-center text-white mb-12">
          {/* Heading */}
          <h1 className="text-[5.5vw] max-sm:text-[11vw] max-md:text-[8vw]">
            Animated Faq
          </h1>

          {/* Subtext */}
          <p className="mt-8 text-[1.2vw] max-sm:text-[4.5vw] max-md:mt-4 max-md:text-[3vw]">
            Click on the FAQ triggers
          </p>
        </div>

        <AnimatedFaq />
      </section>
    </>
  );
}
