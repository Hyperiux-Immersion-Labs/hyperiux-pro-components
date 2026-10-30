"use client";

import NeonStreak from "@/components/neon-streak";
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

const toggle = (name: string, label: string, description: string) => ({
  name,
  label,
  type: "boolean",
  default: true,
  description,
  remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
});

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="neon-streak"
      category="backgrounds"
      component={NeonStreak}
      props={[
        {
          name: "backgroundColor",
          label: "Background",
          type: "color",
          default: "#0b0b0b",
          description: "Canvas colour behind the smoke.",
          remixer: { control: "color", group: "colour", groupTitle: "Colour" },
        },
        range("hue", "Hue", 0, "Turns every colour around the colour wheel, in degrees. 0 is the reference violet.", -180, 180, 1, "colour", "Colour"),
        range("saturation", "Saturation", 1, "Colour strength. 0 is greyscale, 1 matches the reference.", 0, 1.6, 0.05, "colour", "Colour"),
        range("intensity", "Intensity", 1, "Overall brightness of the light.", 0.2, 2, 0.05, "colour", "Colour"),
        range("glow", "Glow", 1, "How wide the glow spreads around each strand.", 0.3, 2.5, 0.05, "colour", "Colour"),
        range("smoke", "Smoke", 1, "How much grey smoke drifts behind the light. 0 leaves the background flat.", 0, 2, 0.05, "colour", "Colour"),
        range("grain", "Grain", 0.04, "Film grain strength. 0 turns it off.", 0, 0.2, 0.01, "colour", "Colour"),
        range("thickness", "Thickness", 1, "How thick the bright strands are.", 0.3, 3, 0.05, "streak", "Streak"),
        range("weave", "Weave", 1, "How far the strands weave apart and cross. 0 draws one line.", 0, 3, 0.05, "streak", "Streak"),
        range("trailLength", "Trail length", 2.6, "Seconds a streak stays lit before it fades out.", 0.4, 6, 0.1, "streak", "Streak"),
        range("speed", "Speed", 1, "How fast the smoke drifts and the strands twist. 0 holds them still.", 0, 3, 0.05),
        range("ringSize", "Ring size", 0.32, "Radius of the self-drawn ring, in canvas heights.", 0.1, 0.48, 0.01),
        toggle("interactive", "Draw with pointer", "Let the pointer draw streaks of light."),
        toggle("autoplay", "Autoplay", "Draw the ring on its own when nobody is moving the pointer."),
        range("idleDelay", "Idle delay", 1.2, "Seconds after the pointer stops before the ring starts drawing itself again.", 0.2, 5, 0.1, "cursor", "Cursor"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The ring holds still.",
              body: "With reduced motion, Neon Streak draws one still frame of the finished ring: the smoke stops drifting, the strands stop twisting and the pointer no longer draws. Colour and shape changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
