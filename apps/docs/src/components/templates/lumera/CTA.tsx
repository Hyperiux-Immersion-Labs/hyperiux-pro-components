import Image from "next/image";

import BlackButton from "./BlackButton";
import PrimaryButton from "./PrimaryButton";

const ctaImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
];

const CTA = () => {
  return (
    <section className="px-[5%] py-[6%] mobile:py-[14%] tablet:py-[8%]" id="cta">
      <div className="w-full overflow-hidden rounded-[2.5vw] border border-black mobile:rounded-[6vw] tablet:rounded-[4vw]">
        <div className="flex flex-col items-center gap-[1.8vw] px-[6vw] pt-[5vw] text-center mobile:gap-[6vw] mobile:px-[6vw] mobile:pt-[14vw] tablet:gap-[3vw] tablet:px-[8vw] tablet:pt-[8vw]">
          <h2
            data-para-anim
            className="max-w-[60%] font-medium font-heading text-[3.6vw] leading-[1.15] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw]"
          >
            Some Properties Need to be Experienced in Person
          </h2>
          <p
            data-para-anim
            className="w-[55%] text-[1.2vw] leading-[1.6] text-black/75 mobile:text-[4.2vw] tablet:text-[2.4vw]"
          >
            Tell us what you are looking for and our team will introduce you to residences that fit your lifestyle, priorities and ambitions in Dubai.
          </p>
          <div className="mt-[1vw] flex items-center gap-[1.2vw] fadeup mobile:mt-[4vw] mobile:w-full mobile:flex-col mobile:gap-[4vw] tablet:gap-[2.5vw]">
            <BlackButton
              btnText="Arrange Private Consultation"
              link="#"
              className="bg-[#1c1b1a]"
              borderColor="#1c1b1a"
            />
            <PrimaryButton
              btnText="Contact Our Team"
              link="#"
              className="border border-[#1c1b1a]"
            />
          </div>
        </div>

        <div className="mt-[3.5vw] grid grid-cols-4 gap-[0.8vw] px-[3vw] pb-[3vw] mobile:mt-[8vw] mobile:grid-cols-2 mobile:gap-[2.5vw] mobile:px-[3vw] mobile:pb-[3vw] tablet:gap-[1.5vw] tablet:px-[2vw] tablet:pb-[2vw]">
          {ctaImages.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-[4/3] overflow-hidden rounded-[1.2vw] mobile:rounded-[3vw] tablet:rounded-[2vw]"
            >
              <Image
                src={src}
                alt="Lumera Heights"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
