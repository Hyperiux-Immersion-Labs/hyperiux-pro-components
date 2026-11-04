// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import TextFillAnimation from "./effects/text-fill-animation";

const Statement = () => {
  return (
    <TextFillAnimation
      data-ord-orb="statement"
      data-ord-light
      sectionClassName="h-[100vh] bg-[#eef2ec]"
      innerClassName="ord-container justify-center"
      className="w-[82%] text-center text-64 leading-[1.2] max-lg:w-full"
      textColor="#0c1218"
      primaryColor="#73bea1"
      accentColor="#13605d"
      dimColor="#c9d5cc"
      stagger={0.04}
      start="top 40%"
    >
      Autonomy without oversight is a liability. <span className="tfa-accent">Ordin</span> makes every agent accountable: scoped, budgeted, reviewed
      and replayable, by default, from the first run.
    </TextFillAnimation>
  );
};

export default Statement;
