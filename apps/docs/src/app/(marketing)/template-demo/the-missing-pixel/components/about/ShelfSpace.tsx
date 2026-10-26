// Built using Hyperiux Vault: https://vault.hyperiux.com

import SectionHead from "../shared/SectionHead";
import AwardsList from "./AwardsList";

const ShelfSpace = () => (
  <section className="flex flex-col gap-14 max-lg:gap-11 px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
    <SectionHead stacked title="Shelf space" text="Awards matter less than results. We keep these anyway." />
    <AwardsList />
  </section>
);

export default ShelfSpace;
