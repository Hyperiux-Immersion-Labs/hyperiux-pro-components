"use client";

import OpalFlow from "@/components/opal-flow";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

const range = (name: string, label: string, value: number, description: string, min: number, max: number, step: number, group = "motion", groupTitle = "Motion") => ({
  name,
  label,
  type: "number",
  default: value,
  description,
  remixer: { control: "range", group, groupTitle, min, max, step },
});

const color = (name: string, label: string, value: string, description: string) => ({
  name,
  label,
  type: "color",
  default: value,
  description,
  remixer: { control: "color", group: "colour", groupTitle: "Colour" },
});

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="opal-flow"
      category="backgrounds"
      component={OpalFlow}
      props={[
        color("baseColor", "Ground", "#6a6cf6", "The periwinkle ground."),
        color("wispColor", "Wisps", "#8de0f1", "The cyan wisps."),
        color("ribbonColor", "Ribbon", "#fb9ce8", "The pink ribbon."),
        color("highlightColor", "Highlight", "#fccbbf", "The warm centre of the ribbon."),
        range("hue", "Hue", 0, "Turns every colour around the colour wheel, in degrees. 0 is the reference palette.", -180, 180, 1, "colour", "Colour"),
        range("saturation", "Saturation", 1, "Colour strength. 0 is greyscale, 1 matches the reference.", 0, 1.6, 0.05, "colour", "Colour"),
        range("grain", "Grain", 0.025, "Film grain strength. 0 turns it off.", 0, 0.15, 0.005, "colour", "Colour"),
        range("speed", "Speed", 1, "How fast the paint flows. 0 holds it still.", 0, 4, 0.05),
        range("flow", "Flow", 1, "How far the paint folds and curls.", 0, 2, 0.05),
        range("detail", "Detail", 1, "How strongly the cyan wisps are combed into fine streaks.", 0, 2.5, 0.05),
        {
          name: "interactive",
          label: "Smear",
          type: "boolean",
          default: true,
          description: "Let the pointer stir the paint like ink in water.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("smearStrength", "Strength", 1, "How far a stroke drags the paint.", 0, 3, 0.05, "cursor", "Cursor"),
        range("smearRadius", "Brush size", 0.16, "Width of the stroke, in canvas heights.", 0.04, 0.4, 0.01, "cursor", "Cursor"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The paint holds still.",
              body: "With reduced motion, Opal Flow draws one still frame: the paint stops flowing, the grain stops moving and the pointer no longer stirs it. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
