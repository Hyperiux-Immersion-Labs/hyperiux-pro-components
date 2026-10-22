// Built using Hyperiux Vault: https://vault.hyperiux.com

import SectionHead from "../shared/SectionHead";
import TeamGrid from "./TeamGrid";

const Team = () => (
  <>
    <section id="team" className="flex flex-col gap-14 max-lg:gap-11 px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
      <SectionHead
        stacked
        title="The people you’ll actually meet"
        text="Everyone on your project is in the first meeting. Nobody hands you to a junior team after the pitch."
      />
      <TeamGrid />
    </section>
  </>
);

export default Team;
