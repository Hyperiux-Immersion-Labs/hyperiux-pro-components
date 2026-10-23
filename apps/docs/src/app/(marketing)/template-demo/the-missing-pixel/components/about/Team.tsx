// Built using Hyperiux Vault: https://vault.hyperiux.com

import SectionHead from "../shared/SectionHead";
import TeamGrid from "./TeamGrid";

const Team = () => (
  <>
    <section id="team" className="max-md:overflow-x-clip flex flex-col gap-14 max-lg:gap-11 px-[5vw] max-lg:px-[6vw] max-md:px-0 py-[7%]  max-lg:py-[12%] max-md:py-[15%]">
      <div className="max-md:px-[7vw]">

      <SectionHead
        stacked
        title="The people you’ll actually meet"
        text="Everyone on your project is in the first meeting. Nobody hands you to a junior team after the pitch."
        />
        </div>
      <TeamGrid />
    </section>
  </>
);

export default Team;
