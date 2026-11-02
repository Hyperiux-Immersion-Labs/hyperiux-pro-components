"use client";

import AuroraRibbon from "@/components/aurora-ribbon";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

const colour = (name: string, label: string, value: string, description: string) => ({
  name,
  label,
  type: "color",
  default: value,
  description,
  remixer: { control: "color", group: "colour", groupTitle: "Colour" },
});

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
      name="aurora-ribbon"
      category="backgrounds"
      component={AuroraRibbon}
      props={[
        colour("backgroundColor", "Background", "#0c1218", "Canvas colour behind the light."),
        colour("haloColor", "Halo", "#13605d", "The wide, dim glow at the ribbon's edges."),
        colour("glowColor", "Glow", "#73bea1", "The soft body of the ribbon."),
        colour("coreColor", "Core", "#b8bc5b", "Light added along the centre line, on top of the glow."),
        range("intensity", "Intensity", 1, "Overall brightness. 1 matches the reference.", 0.2, 2, 0.05, "colour", "Colour"),
        range("softness", "Softness", 1, "How diffuse the light is. Above 1 spreads it wider and softer.", 0.5, 2.5, 0.05, "colour", "Colour"),
        range("grain", "Grain", 0.06, "Film grain strength. 0 turns it off.", 0, 0.2, 0.01, "colour", "Colour"),
        range("speed", "Speed", 1, "How fast the ribbon drifts. 0 holds it still.", 0, 3, 0.05),
        range("flow", "Flow", 1, "How far the ribbon sways while it drifts.", 0, 2.5, 0.05),
        {
          name: "interactive",
          label: "Smear",
          type: "boolean",
          default: true,
          description: "Let the pointer stir the light like ink in water.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("smearStrength", "Strength", 1, "How far a stroke drags the light.", 0, 3, 0.05, "cursor", "Cursor"),
        range("smearRadius", "Brush size", 0.1, "Width of the stroke, in canvas heights.", 0.04, 0.4, 0.01, "cursor", "Cursor"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The ribbon holds still.",
              body: "With reduced motion, Aurora Ribbon draws one still frame: it stops drifting, the grain stops moving and the pointer no longer stirs the light. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
