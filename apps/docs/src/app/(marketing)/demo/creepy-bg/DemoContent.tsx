"use client";

import CreepyBg from "@/components/creepy-bg";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="creepy-bg"
      category="backgrounds"
      component={CreepyBg}
      props={[
        {
          name: "speed",
          label: "Speed",
          type: "number",
          default: 0.15,
          description: "How fast the clouds crawl and fold into new shapes.",
          remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 1, step: 0.01, hideWhenReducedMotion: true },
        },
        {
          name: "warp",
          label: "Warp",
          type: "number",
          default: 2.5,
          description: "How much the clouds twist into each other. Higher is stranger. Not used when Cursor only is on.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0, max: 5, step: 0.1, disabledWhen: { prop: "cursorOnly", equals: true } },
        },
        {
          name: "scale",
          label: "Scale",
          type: "number",
          default: 1.1,
          description: "Size of the pattern. Lower values give bigger clouds. Not used when Cursor only is on.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0.3, max: 3, step: 0.1, disabledWhen: { prop: "cursorOnly", equals: true } },
        },
        {
          name: "voidSize",
          label: "Void size",
          type: "number",
          default: 0.65,
          description: "Size of the dark, empty area that drifts around the middle. 0 fills the screen. Not used when Cursor only is on.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0, max: 1.5, step: 0.1, disabledWhen: { prop: "cursorOnly", equals: true } },
        },
        {
          name: "cursorOnly",
          label: "Cursor only",
          type: "boolean",
          default: false,
          description: "Hides the background clouds so only the colour from the cursor shows on the background colour.",
          remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" },
        },
        {
          name: "mouseInteractive",
          label: "Mouse",
          type: "boolean",
          default: true,
          description: "The cursor leaves coloured smoke that spreads out and fades over the clouds.",
          remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction", hideWhenReducedMotion: true },
        },
        {
          name: "mouseStrength",
          label: "Mouse strength",
          type: "number",
          default: 1,
          description: "How much colour the cursor releases as it moves. Needs Mouse on.",
          remixer: { control: "range", group: "interaction", groupTitle: "Interaction", min: 0, max: 2, step: 0.1, disabledWhen: { prop: "mouseInteractive", equals: false }, hideWhenReducedMotion: true },
        },
        {
          name: "mouseSize",
          label: "Mouse size",
          type: "number",
          default: 1,
          description: "Width of the smoke trail the cursor leaves. Needs Mouse on.",
          remixer: { control: "range", group: "interaction", groupTitle: "Interaction", min: 0.3, max: 3, step: 0.1, disabledWhen: { prop: "mouseInteractive", equals: false }, hideWhenReducedMotion: true },
        },
        {
          name: "trailLength",
          label: "Trail length",
          type: "number",
          default: 2,
          description: "How long the smoke lingers and spreads before it fades, in seconds. Needs Mouse on.",
          remixer: { control: "range", group: "interaction", groupTitle: "Interaction", min: 0.5, max: 10, step: 0.5, disabledWhen: { prop: "mouseInteractive", equals: false }, hideWhenReducedMotion: true },
        },
        {
          name: "heat",
          label: "Heat",
          type: "number",
          default: 2.2,
          description: "How far the clouds burn from blue into orange and red cores. Not used when Cursor only is on.",
          remixer: { control: "range", group: "look", groupTitle: "Look", min: 0.5, max: 4, step: 0.1, disabledWhen: { prop: "cursorOnly", equals: true } },
        },
        {
          name: "grain",
          label: "Grain",
          type: "number",
          default: 0.5,
          description: "Strength of the speckled film grain inside the clouds.",
          remixer: { control: "range", group: "look", groupTitle: "Look", min: 0, max: 1, step: 0.1 },
        },
        {
          name: "backgroundColor",
          label: "Background",
          type: "color",
          default: "#000000",
          description: "Colour of the empty space behind the clouds.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "coolColor",
          label: "Cool",
          type: "color",
          default: "#2a1aff",
          description: "Colour of the thin outer edges of the clouds.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "midColor",
          label: "Mid",
          type: "color",
          default: "#e04cff",
          description: "Colour of the denser middle of the clouds.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "warmColor",
          label: "Warm",
          type: "color",
          default: "#ffa01e",
          description: "Colour of the hot areas near the cores.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "hotColor",
          label: "Hot",
          type: "color",
          default: "#d0101a",
          description: "Colour of the hottest cores.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
      ]}
    >
      {({ effect }) => (
        <main className="relative h-screen w-screen overflow-hidden bg-black">
          <DemoHeader />
          <div className="absolute inset-0">{effect}</div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[5vw]">
            <h1 className="text-center w-[60%] mx-auto text-[4.8vw] leading-[1.1]  tracking-widest font-bold text-white uppercase text-shadow-[0_0.2vw_1.5vw_rgba(0,0,0,0.6)] max-[1025px]:text-[6vw] max-md:text-[9vw]">
              Hyperiux Immersion Labs
            </h1>
          </div>
        </main>
      )}
    </LocalRemixerDemo>
  );
}
