import Image from "next/image";
import ArrowFillButton from "@/components/arrow-fill-button";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import FadeUp from "@/components/WebsiteComps/FadeUp";

export default function DemoContent() {
  return (
    <section className="relative flex h-screen items-center justify-center text-center max-md:px-[7vw]">
      <Image
        src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/abs06.avif"
        alt="Abstract background"
        fill
        priority
        className="object-cover brightness-50"
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
        <SplitLine>
          <h1 className="text-[7vw] max-md:text-[9vw]">Depth Shift Transition</h1>
        </SplitLine>

        <SplitLine>
          <p className="mt-2 text-[1.4vw] max-[1025px]:text-[3vw] max-md:text-[4.5vw]">
            Click on the button to see the transition
          </p>
        </SplitLine>

        <FadeUp className="mt-12" delay={0.2}>
          <ArrowFillButton
            className="cursor-pointer border border-[#ff5f00] text-[#ffffff]"
            btnText="Click here"
            href="/demo/depth-shift-transition/page2"
          />
        </FadeUp>
      </div>
    </section>
  );
}
