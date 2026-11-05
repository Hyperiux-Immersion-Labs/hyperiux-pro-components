// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import TextFillAnimation from "./effects/text-fill-animation";
import { THEME } from "../theme";

const Statement = () => {
  return (
    <TextFillAnimation
      data-ord-orb="statement"
      data-ord-light
      sectionClassName="h-[100vh] bg-(--ord-paper)"
      innerClassName="ord-container justify-center"
      className="w-[90%] text-center text-64 leading-[1.2] max-lg:w-full"
      textColor={THEME.ink}
      primaryColor={THEME.primary}
      accentColor={THEME.primary}
      dimColor={THEME.paperDeep}
      stagger={0.04}
      start="top 40%"
    >
      {/* Worded so the name lands near the middle of the statement, not at its start or end */}
      Autonomy without oversight is a liability, so every agent that runs on <span className="tfa-accent">Ordin</span> is scoped, budgeted, reviewed
      and replayable from the first run.
    </TextFillAnimation>
  );
};

export default Statement;
