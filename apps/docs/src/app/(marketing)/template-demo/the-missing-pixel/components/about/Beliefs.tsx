// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, Odometer } from "../Animations/gsapAnim";
import SectionHead from "../shared/SectionHead";

const Beliefs = () => (
  <>
    <section className="flex flex-col gap-14  max-lg:gap-11 px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
      <SectionHead title="What we believe" />
      <div className="flex flex-col gap-[2vw] max-md:gap-[5vw] rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white)  p-[2vw] max-md:p-[3vw]">
        <ul className="grid grid-cols-3 gap-[2vw] max-md:gap-[5vw] max-lg:grid-cols-1">
          {VALUES.map((value, index) => (
            <FadeUp
              as="li"
              key={value.title}
              delay={index * 0.1}
              className="flex h-[40vh] flex-col rounded-lg bg-(--mpx-paper) px-[2.2vw] py-[2.2vw] max-lg:h-auto max-lg:gap-8 max-lg:px-[3.5vw] max-lg:py-[3.5vw] max-md:px-[5vw] max-md:py-[5vw]"
            >
              <div className="h-[48%] max-lg:h-auto">
                <span className="font-mpx-head text-64 leading-none text-(color:--mpx-ink)/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-30">{value.title}</h3>
                <p className="text-24 leading-[1.3] text-mpx-muted">{value.text}</p>
              </div>
            </FadeUp>
          ))}
        </ul>
        <ul className="grid grid-cols-4 gap-x-9 gap-y-6 rounded-lg bg-(--mpx-ink) px-[2.6vw] py-[2.6vw] text-(color:--mpx-paper) max-lg:grid-cols-2 max-md:grid-cols-1 max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[6vw] max-md:py-[6vw]">
          {STATS.map((item, index) => (
            <FadeUp
              as="li"
              key={item.label}
              delay={index * 0.1}
              className={`flex flex-col gap-3 ${index > 0 ? "border-l border-(--mpx-white)/15 px-[1.6vw]" : ""} max-lg:px-0 max-lg:border-l-0 ${index % 2 === 1 ? "max-lg:border-l max-lg:px-[3vw] max-md:border-l-0 max-md:px-0" : ""}`}
            >
              <Odometer value={item.value} className="font-mpx-head text-64 leading-none" />
              <span className="w-[80%] text-14 text-(color:--mpx-grey) max-md:w-full">{item.label}</span>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  </>
);

export default Beliefs;

const VALUES = [
  {
    title: "Senior hands only",
    text: "Every project is led by a partner and staffed by people with at least six years behind them. The faces at the pitch are the faces doing the work.",
  },
  {
    title: "Fewer clients, fuller attention",
    text: "We cap ourselves at twelve live projects across four studios. Timelines stay honest and the phone always gets answered.",
  },
  {
    title: "Pretty isn’t the brief",
    text: "Beautiful is the minimum. We agree measurable goals on day one and report back after launch, good news or not.",
  },
];

const STATS = [
  { value: "2014", label: "founded in Delhi" },
  { value: "4", label: "studios: Delhi, London, Dubai, New York" },
  { value: "60", label: "people, all of them opinionated" },
  { value: "19", label: "languages spoken in the group chat" },
];
