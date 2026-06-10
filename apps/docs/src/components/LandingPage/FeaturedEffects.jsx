import React from "react";
import Button from "../Reusable/Button";

export default function FeaturedEffects() {
  return (
    <section
      id="FeaturedEffects"
      className="h-fit bg-background my-[10vw] gap-[2vw] flex-col w-full self-padd  flex items-center justify-center"
    >
      <p className="text22 text-light-grey">Featured Effects</p>
      <h2 className="text140  text-center w-[80vw]">
        Start with the effects people actually notice.
      </h2>
      <p className="text34 text-center mt-[4vw] w-[80vw]">
        A few high-impact patterns from the Vault - ready to preview, copy,
        install, and adapt.
      </p>

      <div className="w-full flex gap-[2.5vw] items-end mt-[4vw] flex-col ">
        <div className="w-fit mr-[2vw]">
          <Button text="Explore All Effects" href="/effects" />
        </div>
        <div className="w-full flex h-[50vh] items-center gap-[2vw] justify-between">
          <div className="w-full h-full rounded-md bg-zinc-300" />
          <div className="w-full h-full rounded-md bg-yellow-100" />
        </div>
      </div>
    </section>
  );
}
