// Built using Hyperiux Vault: https://vault.hyperiux.com
import Image from "next/image";
import aboutPhone1 from "../assets/about01.png";
import aboutPhone2 from "../assets/about02.png";
import aboutPhone3 from "../assets/about03.png";

const About = () => {
  return (
    <section className="kyntra-container relative w-full h-full overflow-hidden bg-white text-black">
      <div className="mx-auto flex max-w-400 items-start justify-between gap-[6vw] max-[1025px]:flex-col max-[1025px]:gap-[4vw]">
        <h2 className="font-helvetica-neue w-[35vw] leading-[1.15] font-normal tracking-[-0.02em] max-[1025px]:text-[6vw] max-md:text-[8vw]">
          Everything You Need For a Better Home &amp; Lifestyle
        </h2>

        <p className="text-24 w-[34vw] leading-[1.6] text-black/80 max-[1025px]:text-[2.6vw] max-[1025px]:text-left max-md:text-[4vw] lg:text-right">
          Kyntra Gives Every Home A Memory Keeping Repairs, Warranties,
          Maintenance And Service History Connected, So Each Future Decision
          Starts With Context Instead Of From Scratch.
        </p>
      </div>

      {/* Phone mockup cluster - all three the same size; the outer two are
          shifted down so the centre one leads. */}
      <div className="relative mx-auto mt-[6vw] flex max-w-400 items-start justify-center gap-[3vw] max-md:mt-[12vw]">
        <div className="w-[22vw] pt-[10vw] max-[1025px]:w-[28vw] max-md:w-[31vw]">
          <Image
            src={aboutPhone1}
            alt="Kyntra room control screen"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="z-10 w-[22vw] max-[1025px]:w-[28vw] max-md:w-[31vw]">
          <Image
            src={aboutPhone2}
            alt="Kyntra app - everything your home needs, one app"
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <div className="w-[22vw] pt-[10vw] max-[1025px]:w-[28vw] max-md:w-[31vw]">
          <Image
            src={aboutPhone3}
            alt="Kyntra device search screen"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
