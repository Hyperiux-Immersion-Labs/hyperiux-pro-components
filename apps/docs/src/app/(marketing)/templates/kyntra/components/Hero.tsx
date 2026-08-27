// Built using Hyperiux Vault: https://vault.hyperiux.com
import Image from "next/image";
import { Star } from "lucide-react";
import { AppleStoreButton, PlayStoreButton } from "./Buttons";
import phoneMockup from "../assets/phone-mockup.png";
import kyntraHero from "../assets/kyntra-hero.png";

const Hero = () => {
  return (
    <section className="kyntra-hero relative min-h-screen h-full w-full overflow-hidden bg-white">
      {/* Gradient confined to the top ~90vh, then solid white below.
          Long black -> blue merge, and an equally long blue -> white merge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[90vh] bg-[linear-gradient(180deg,#000000_0%,#000000_28%,#0A1633_42%,#16295F_54%,#26429C_63%,#3E63D0_71%,#6E8FE2_82%,#B9CCF4_92%,#ffffff_100%)]"
      />

      {/* Oversized KYNTRA watermark  */}
      <Image
        src={kyntraHero}
        alt=""
        aria-hidden
        priority
        className="pointer-events-none absolute left-1/2 top-[24vh] w-[92vw] max-w-400 -translate-x-1/2 select-none"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-400 items-center gap-[10vw] px-[5vw] pb-[8vh] pt-[40vh] max-[1025px]:flex-col max-[1025px]:gap-[8vw] max-[1025px]:pt-[26vh] max-md:gap-[10vw]">
        {/* Phone mockup */}
        <div className="flex w-[33%] shrink-0 justify-center max-[1025px]:w-[55%] max-md:w-[78%]">
            <div className="w-[25vw] ml-20 h-auto">

          <Image
            src={phoneMockup}
            alt="Kyntra app manage every room and service from one home dashboard"
            className="h-auto w-full object-contain"
            priority
            />
            </div>
        </div>

        {/* Copy */}
        <div className="w-[60%] pt-[30vh] space-y-[3vw] max-[1025px]:w-full max-[1025px]:text-center">
          <h1 className="font-helvetica-neue  text-black max-[1025px]:mx-auto max-md:max-w-none">
            One App to
            <br />
             Manage Your Home
          </h1>

          <p className=" w-[24vw] text-22 leading-[1.6] text-black/80 max-[1025px]:mx-auto max-[1025px]:text-[2.6vw] max-md:max-w-none max-md:text-[4vw]">
            Kyntra Remembers Your Home, Tracks What Needs Attention, And Gets
            Trusted Help When Something Needs Doing.
          </p>

          <div className="space-y-[1.2vw]">

         

          <div className=" flex flex-wrap items-center gap-[1.2vw] max-[1025px]:justify-center max-[1025px]:gap-[2.5vw] max-md:gap-[3.5vw]">
            <AppleStoreButton href="#app-store" />
            <PlayStoreButton href="#google-play" />
          </div>

          <div className=" flex items-center gap-[0.5vw] text-[0.95vw] text-black/80 max-[1025px]:justify-center max-[1025px]:gap-[1vw] max-[1025px]:text-[2vw] text-20 max-md:text-[3vw]">
            <span className="text-[#12D415] font-medium">4.9</span>
            <Star className="fill-[#12D415] text-[#12D415] w-[1vw] max-[1025px]:w-[2.2vw] max-md:w-[3.4vw]" />
            <span className="text-20">
              From <span className="font-medium text-black">8,400+</span>{" "}
              Households Across The UAE
            </span>
          </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
