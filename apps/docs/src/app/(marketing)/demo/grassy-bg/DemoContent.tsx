"use client";

import GrassyBg from "@/components/grassy-bg";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="grassy-bg"
      category="backgrounds"
      component={GrassyBg}
      props={[
        {
          name: "speed",
          label: "Speed",
          type: "number",
          default: 1,
          description: "How fast the wind moves through the grass and the hills slowly shift.",
          remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 3, step: 0.1, hideWhenReducedMotion: true },
        },
        {
          name: "wind",
          label: "Wind",
          type: "number",
          default: 0.6,
          description: "How far the blades lean when gusts roll across the field.",
          remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 1.5, step: 0.1, hideWhenReducedMotion: true },
        },
        {
          name: "hills",
          label: "Hills",
          type: "number",
          default: 1,
          description: "Height of the rolling hills. 0 gives a flat field.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0, max: 2, step: 0.1 },
        },
        {
          name: "terrainScale",
          label: "Hill size",
          type: "number",
          default: 1,
          description: "How many hills fit on screen. Lower values give wider, softer hills.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0.3, max: 3, step: 0.1 },
        },
        {
          name: "horizon",
          label: "Horizon",
          type: "number",
          default: 0.5,
          description: "Where the field sits on screen. Higher values tilt the view down so the grass fills more of it.",
          remixer: { control: "range", group: "shape", groupTitle: "Shape", min: 0, max: 1, step: 0.1 },
        },
        {
          name: "density",
          label: "Density",
          type: "number",
          default: 1,
          description: "How many grass blades are drawn. Lower it for slower devices.",
          remixer: { control: "range", group: "grass", groupTitle: "Grass", min: 0.3, max: 1.5, step: 0.1 },
        },
        {
          name: "bladeHeight",
          label: "Blade height",
          type: "number",
          default: 1,
          description: "How tall each grass blade stands above the ground.",
          remixer: { control: "range", group: "grass", groupTitle: "Grass", min: 0.2, max: 3, step: 0.1 },
        },
        {
          name: "bladeWidth",
          label: "Blade width",
          type: "number",
          default: 1,
          description: "How thick each grass blade is at the root.",
          remixer: { control: "range", group: "grass", groupTitle: "Grass", min: 0.5, max: 3, step: 0.1 },
        },
        {
          name: "mouseInteractive",
          label: "Mouse",
          type: "boolean",
          default: true,
          description: "Grass parts around the cursor and gets swept along as it moves.",
          remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction", hideWhenReducedMotion: true },
        },
        {
          name: "mouseStrength",
          label: "Mouse strength",
          type: "number",
          default: 1,
          description: "How far the grass bends away from the cursor. Needs Mouse on.",
          remixer: { control: "range", group: "interaction", groupTitle: "Interaction", min: 0, max: 2, step: 0.1, disabledWhen: { prop: "mouseInteractive", equals: false }, hideWhenReducedMotion: true },
        },
        {
          name: "mouseSize",
          label: "Mouse size",
          type: "number",
          default: 1,
          description: "Size of the patch of grass around the cursor that bends away. Needs Mouse on.",
          remixer: { control: "range", group: "interaction", groupTitle: "Interaction", min: 0.3, max: 3, step: 0.1, disabledWhen: { prop: "mouseInteractive", equals: false }, hideWhenReducedMotion: true },
        },
        {
          name: "backgroundColor",
          label: "Background",
          type: "color",
          default: "#000000",
          description: "Colour of the sky and the gaps between blades.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "shadowColor",
          label: "Shadow",
          type: "color",
          default: "#16260f",
          description: "Colour of the grass on slopes facing away from the light.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "grassColor",
          label: "Grass",
          type: "color",
          default: "#446f22",
          description: "Main colour of the grass.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
        {
          name: "highlightColor",
          label: "Highlight",
          type: "color",
          default: "#b4ec5a",
          description: "Colour of the brightest grass on slopes facing the light.",
          remixer: { control: "color", group: "colors", groupTitle: "Colours" },
        },
      ]}
    >
      {({ effect }) => (
        <main className="relative h-screen w-screen overflow-hidden bg-black">
          <DemoHeader />
          <div className="absolute inset-0">{effect}</div>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[50%] items-center justify-center px-[5vw]">
            <h1 className="w-[60%] text-center text-[4.8vw] font-bold uppercase leading-[1.1] tracking-widest text-white max-[1025px]:w-[80%] max-[1025px]:text-[6vw] max-md:w-full max-md:text-[9vw]">
              Hyperiux Immersion Labs
            </h1>
          </div>
        </main>
      )}
    </LocalRemixerDemo>
  );
}
