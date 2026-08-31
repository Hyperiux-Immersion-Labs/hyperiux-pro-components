// Built using Hyperiux Vault: https://vault.hyperiux.com
import ScrollStack, { type ScrollStackCard } from "./effects/scroll-stack";

import FocusTextWrap from "./effects/focus-text/wrap";
import { ParaAnim } from "./Animations/gsapAnim";
const SHARED = {
  description:
    "Stay ahead of servicing, cleaning and recurring maintenance with timely reminders.",
  items: [
    { label: "AC Servicing" },
    { label: "Deep Cleaning" },
    { label: "Appliance Care" },
    { label: "Seasonal Checks" },
  ],
  buttonText: "Discover More",
  buttonHref: "#",
};

const cards: ScrollStackCard[] = [
  { id: 1, title: "Home Intelligence", ...SHARED },
  { id: 2, title: "Smart Maintenance", ...SHARED },
  { id: 3, title: "Kyntra Concierge", ...SHARED },
  { id: 4, title: "Trusted Professionals", ...SHARED },
  { id: 5, title: "Home Wallet", ...SHARED },
  { id: 6, title: "API & Integration", ...SHARED },
];

const Features = () => {
  return (
    <section className="kyntra-container w-full bg-white text-black">
      <div className="mx-auto pb-[5vw] max-w-400">
        <div className="max-w-[46vw] max-[1025px]:max-w-full">
          <FocusTextWrap>
            <h2 className="font-helvetica-neue leading-[1.12] font-normal tracking-[-0.02em] max-[1025px]:text-[6vw] max-md:text-[8vw]">
              Your Dedicated Operating Layer for the Home
            </h2>
          </FocusTextWrap>
          <ParaAnim
            as="p"
            className="text-24 mt-[1.6vw] max-w-[30vw] leading-normal text-black max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
          >
            The More Kyntra Understands Your Property, The Easier It Becomes To
            Manage Everything Around It.
          </ParaAnim>
        </div>
      </div>

      <ScrollStack
        cards={cards}
        sectionBgColor="#ffffff"
        accentColor="#134BD6"
        cardRadius={28}
      />
    </section>
  );
};

export default Features;
