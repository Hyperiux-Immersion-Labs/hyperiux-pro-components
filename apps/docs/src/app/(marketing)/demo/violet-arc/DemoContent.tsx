"use client";

import VioletArc from "@/components/violet-arc";
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

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="violet-arc"
      category="backgrounds"
      component={VioletArc}
      props={[
        {
          name: "backgroundColor",
          label: "Background",
          type: "color",
          default: "#07060f",
          description: "Canvas colour behind the light.",
          remixer: { control: "color", group: "colour", groupTitle: "Colour" },
        },
        range("hue", "Hue", 0, "Turns every colour of the light around the colour wheel, in degrees. 0 is the reference violet.", -180, 180, 1, "colour", "Colour"),
        range("saturation", "Saturation", 1, "Colour strength. 0 is greyscale, 1 matches the reference.", 0, 1.6, 0.05, "colour", "Colour"),
        range("intensity", "Intensity", 1, "Overall brightness. 1 matches the reference.", 0.2, 2, 0.05, "colour", "Colour"),
        range("softness", "Softness", 1, "How diffuse the light is. Above 1 spreads it wider and softer.", 0.5, 2.5, 0.05, "colour", "Colour"),
        range("grain", "Grain", 0.06, "Film grain strength. 0 turns it off.", 0, 0.2, 0.01, "colour", "Colour"),
        range("speed", "Speed", 1, "How fast the arcs drift. 0 holds them still.", 0, 3, 0.05),
        range("flow", "Flow", 1, "How far the arcs sway while they drift.", 0, 2.5, 0.05),
        {
          name: "interactive",
          label: "Smear",
          type: "boolean",
          default: true,
          description: "Let the pointer stir the light like ink in water.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("smearStrength", "Strength", 1, "How far a stroke drags the light.", 0, 3, 0.05, "cursor", "Cursor"),
        range("smearRadius", "Brush size", 0.14, "Width of the stroke, in canvas heights.", 0.04, 0.4, 0.01, "cursor", "Cursor"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The arcs hold still.",
              body: "With reduced motion, Violet Arc draws one still frame: it stops drifting, the grain stops moving and the pointer no longer stirs the light. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
