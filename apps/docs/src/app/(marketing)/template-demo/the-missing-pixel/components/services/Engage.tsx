// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp } from "../Animations/gsapAnim";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ROUTES } from "../../routes";

const Engage = () => (
  <div className="flex flex-col gap-9 rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) p-[1.5vw] max-lg:p-[2vw] max-md:p-[3vw]">
    <ul className="grid grid-cols-3 gap-[1.5vw] max-md:gap-[4vw] max-lg:gap-[2.5vw] max-lg:grid-cols-1">
      {PLANS.map((plan, index) => (
        <FadeUp
          as="li"
          key={plan.name}
          delay={index * 0.08}
          className={`flex min-h-[50vh] flex-col justify-between gap-[1.5vw] rounded-lg p-[2vw] max-lg:min-h-0 max-lg:p-[4vw] max-md:p-[6vw] ${
            plan.dark ? "bg-(--mpx-ink) text-(color:--mpx-paper)" : "bg-mpx-surface"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-30">{plan.name}</h3>
            <span
              className={`inline-flex h-[3.2vh] items-center whitespace-nowrap rounded-full border px-[0.9vw] text-14 max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw] ${
                plan.dark
                  ? "border-(--mpx-white)/15 text-(color:--mpx-grey)"
                  : "border-(--mpx-ink)/30 text-mpx-muted"
              }`}
            >
              {plan.tag}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            <p className="flex flex-wrap items-baseline gap-2">
              {plan.before && (
                <span
                  className={`text-14 ${plan.dark ? "text-(color:--mpx-grey)" : "text-mpx-muted"}`}
                >
                  {plan.before}
                </span>
              )}
              <span className="font-mpx-head text-64 leading-none">
                {plan.price}
              </span>
              <span
                className={`text-14 ${plan.dark ? "text-(color:--mpx-grey)" : "text-mpx-muted"}`}
              >
                {plan.after}
              </span>
            </p>
            <p
              className={`w-[90%] text-24 max-lg:w-full leading-[1.3] ${plan.dark ? "text-(color:--mpx-grey)" : "text-mpx-muted"}`}
            >
              {plan.text}
            </p>
            <div
              className={`h-px w-full ${plan.dark ? "bg-(--mpx-white)/15" : "bg-(--mpx-ink)/30"}`}
            />
            <p className="flex flex-col gap-1 text-24 leading-[1.3]">
              <span
                className={`text-14 ${plan.dark ? "text-(color:--mpx-grey)" : "text-mpx-muted"}`}
              >
                Best for
              </span>
              {plan.best}
            </p>
          </div>
        </FadeUp>
      ))}
    </ul>
    <FadeUp className="flex flex-wrap items-center justify-between gap-x-9 gap-y-4 px-[1.2vw] py-[1.2vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[4vw]">
      <p className="w-[60%] text-24 leading-[1.3] text-mpx-muted max-lg:w-full">
        Not sure which fits? We’ll tell you on the first call, and it might be
        none of them.
      </p>
      <UnderlineLink
        href={ROUTES.contact}
        
        className="font-mpx-head text-22 font-medium"
      >
        Start a project
      </UnderlineLink>
    </FadeUp>
  </div>
);

export default Engage;

const PLANS = [
  {
    name: "Project",
    tag: "Fixed scope",
    before: "From",
    price: "$18k",
    after: "",
    text: "A fixed scope, a fixed fee and a fixed date. You know the price before we start.",
    best: "Identities, websites and launches",
    dark: false,
  },
  {
    name: "Retainer",
    tag: "Ongoing",
    before: "From",
    price: "$6.5k",
    after: "a month",
    text: "A dedicated team for a set number of days each month. Same people, every month.",
    best: "Brands that never stop shipping",
    dark: true,
  },
  {
    name: "Sprint",
    tag: "Two weeks",
    before: "",
    price: "$9.5k",
    after: "fixed",
    text: "Two weeks, one problem, one answer. Fast, focused and done.",
    best: "A pitch deck, a campaign idea, a landing page",
    dark: false,
  },
];
