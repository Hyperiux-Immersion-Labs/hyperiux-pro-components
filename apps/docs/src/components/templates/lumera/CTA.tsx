import Image from "next/image";

import BlackButton from "./BlackButton";
import PrimaryButton from "./PrimaryButton";
import image1 from "./assets/cta/image1.png";
import image2 from "./assets/cta/image2.png";
import image3 from "./assets/cta/image3.png";
import image4 from "./assets/cta/image4.png";

const ctaImages = [image1, image2, image3, image4];

const CTA = () => {
  return (
    <section className="relative z-10 bg-white px-[5%] py-[6%] max-md:px-[6%] max-md:py-[14%] max-[1025px]:py-[8%]" id="cta">
      <div className="w-full overflow-hidden rounded-[2.5vw] border border-black max-md:rounded-[6vw] max-[1025px]:rounded-[4vw]">
        <div className="flex flex-col items-center gap-[1.8vw] px-[6vw] pt-[5vw] text-center max-md:gap-[6vw] max-md:px-[6vw] max-md:pt-[14vw] max-[1025px]:gap-[3vw] max-[1025px]:px-[8vw] max-[1025px]:pt-[8vw]">
          <h2
            data-para-anim
            className="max-w-[60%] max-[1025px]:max-w-[90%] font-medium font-heading text-[3.6vw] leading-[1.15] max-[1025px]:text-[5vw] max-md:text-[6.8vw] max-md:text-[8.8vw]"
          >
            Some Properties Need to be Experienced in Person
          </h2>
          <p
            data-para-anim
            className="w-[55%] text-[1.2vw] leading-[1.6] text-black/75 max-md:text-[4.2vw] max-[1025px]:w-[90%] max-[1025px]:text-[2.4vw]"
          >
            Tell us what you are looking for and our team will introduce you to residences that fit your lifestyle, priorities and ambitions in Dubai.
          </p>
          <div className="mt-[1vw] flex items-center gap-[1.2vw] fadeup max-md:mt-[4vw] max-md:w-full max-[1025px]:flex-col max-md:gap-[4vw] max-[1025px]:gap-[2.5vw]">
            <BlackButton
              btnText="Arrange Private Consultation"
              link="#"
              className="bg-[#1c1b1a]"
              borderColor="#1c1b1a"
            />
            <PrimaryButton
              btnText="Contact Our Team"
              link="#"
              className="border border-[#1c1b1a] max-md:w-full"
            />
          </div>
        </div>

        <div className="mt-[3.5vw] max-[1025px]:pb-[5vw] max-[1025px]:grid-cols-2 max-[1025px]:px-[6vw] grid grid-cols-4 gap-[0.8vw] px-[3vw] pb-[3vw] max-md:mt-[8vw] max-md:grid-cols-2 max-md:gap-[2.5vw] max-md:px-[5vw] max-md:pb-[5vw] max-[1025px]:gap-[1.5vw] ">
          {ctaImages.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-4/3 overflow-hidden rounded-[1.2vw] max-md:rounded-[3vw] max-[1025px]:rounded-[2vw]"
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
