import React from "react";

const roiStats = [
  { value: "1.85M", suffix: "/AED", label: "Starting Price" },
  { value: "60 / 40", label: "Payment Plan" },
  { value: "1–3 BR", label: "Residences" },
  { value: "Q4 2028", label: "Expected Handover" },
];

const Roi = () => {
  return (
    <>
      <section className="pt-[3%] pb-[10%] mobile:pb-[20%]" id="roi">
        <div className={`px-[5%] flex flex-col gap-[4vw] mobile:gap-[7vw]`}>
          <div className="flex justify-between mobile:flex-col mobile:gap-[7vw]">
            <h2 data-para-anim className={`font-heading  font-medium text-[3.8vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw] w-[35%] mobile:w-full`}>
              Invest in Dubai&apos;s Next Landmark
            </h2>
            <p data-para-anim className="w-[40%] mobile:w-full text-[1.3vw]">
              Own a residence where architectural distinction, prime location, and elevated living come together. Lumera Heights offers a compelling opportunity for those seeking long-term value in the heart of Dubai.
            </p>
          </div>
          <div className="flex flex-wrap gap-[4vw] fadeup mobile:gap-[4vw] tablet:gap-[2.5vw]">
            {roiStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col mx-auto items-center justify-center gap-[0.4vw] rounded-full border border-[#ca8216] px-[4vw] py-[2.2vw] text-center mobile:px-[7vw] mobile:py-[5vw] mobile:gap-[1.5vw] tablet:px-[4vw] tablet:py-[3vw]"
              >
                <p className="font-heading font-medium text-[2.8vw] leading-none text-[#1c1b1a] mobile:text-[6vw] tablet:text-[3.5vw]">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-[1vw] align-bottom text-[#1c1b1a]/70 mobile:text-[3vw] tablet:text-[1.8vw]">{stat.suffix}</span>
                  )}
                </p>
                <p className="text-[1.1vw] text-[#1c1b1a]/70 mobile:text-[3.2vw] tablet:text-[1.8vw]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Roi;
