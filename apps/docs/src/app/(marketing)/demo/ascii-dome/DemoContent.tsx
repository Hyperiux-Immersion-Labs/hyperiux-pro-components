"use client";

import AsciiDome from "@/components/ascii-dome";
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
      name="ascii-dome"
      category="backgrounds"
      component={AsciiDome}
      props={[
        {
          name: "backgroundColor",
          label: "Background",
          type: "color",
          default: "#000000",
          description: "Canvas colour behind the light.",
          remixer: { control: "color", group: "colour", groupTitle: "Colour" },
        },
        range("hue", "Hue", 0, "Turns every colour around the colour wheel, in degrees. 0 is the reference red-to-violet.", -180, 180, 1, "colour", "Colour"),
        range("saturation", "Saturation", 1, "Colour strength. 0 is greyscale, 1 matches the reference.", 0, 1.6, 0.05, "colour", "Colour"),
        range("intensity", "Intensity", 1, "Overall brightness. 1 matches the reference.", 0.2, 2, 0.05, "colour", "Colour"),
        range("softness", "Softness", 1, "How diffuse the light is. Above 1 softens the steps between colours.", 0.5, 2.5, 0.05, "colour", "Colour"),
        range("grain", "Grain", 0.03, "Film grain strength. 0 turns it off.", 0, 0.2, 0.01, "colour", "Colour"),
        {
          name: "characters",
          label: "Characters",
          type: "string",
          default: " =+xX80S#@",
          description: "Characters from darkest to brightest. The first is usually a space.",
          remixer: { control: "text", group: "glyphs", groupTitle: "Characters" },
        },
        range("cellSize", "Cell size", 16, "Width of one character cell, in px.", 6, 40, 1, "glyphs", "Characters"),
        range("glyphOpacity", "Opacity", 1, "Strength of the character layer. 0 hides it.", 0, 1, 0.05, "glyphs", "Characters"),
        range("gaps", "Gaps", 0.22, "Share of cells left empty, 0 to 1.", 0, 0.9, 0.01, "glyphs", "Characters"),
        range("flicker", "Flicker", 1.5, "How often each character re-rolls, per second. 0 freezes the grid.", 0, 8, 0.1, "glyphs", "Characters"),
        range("speed", "Speed", 1, "How fast the dome drifts. 0 holds it still.", 0, 3, 0.05),
        range("flow", "Flow", 1, "How far the dome breathes and ripples while it drifts.", 0, 2.5, 0.05),
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
              title: "The dome holds still.",
              body: "With reduced motion, ASCII Dome draws one still frame: the dome stops drifting, the characters stop flickering, the grain stops moving and the pointer no longer stirs the light. Setting changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
