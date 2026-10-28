"use client";

import MossGrid from "@/components/moss-grid";
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

const colour = (name: string, label: string, value: string, description: string) => ({
  name,
  label,
  type: "color",
  default: value,
  description,
  remixer: { control: "color", group: "look", groupTitle: "Look" },
});

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="moss-grid"
      category="backgrounds"
      component={MossGrid}
      props={[
        colour("mossColor", "Moss", "#22331a", "Moss in the hollows and at the base of the strands."),
        colour("mossHighlight", "Moss tips", "#628c58", "Moss at the tips of the strands and on the crests."),
        colour("dotColor", "Lights", "#c3e4e0", "Colour of the lights."),
        range("dotSize", "Light size", 1.5, "Size of each light, in px at the focus distance.", 1, 6, 0.1, "look", "Look"),
        range("dotGlow", "Light glow", 1, "Brightness of the lights.", 0, 2.5, 0.05, "look", "Look"),
        range("depthOfField", "Depth of field", 1, "How blurred the far hills are. 0 keeps everything sharp.", 0, 2.5, 0.05, "look", "Look"),
        range("grain", "Grain", 0.09, "Film grain strength. 0 turns it off.", 0, 0.3, 0.01, "look", "Look"),
        range("speed", "Speed", 1, "How fast everything moves. 0 holds it still.", 0, 3, 0.05),
        range("undulate", "Roll", 1, "How much the hills drift. 0 keeps the ground fixed.", 0, 3, 0.05),
        {
          name: "interactive",
          label: "Cursor",
          type: "boolean",
          default: true,
          description: "Light up the grid where the pointer moves, swell the ground under it and ripple the lights.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        {
          name: "autoplay",
          label: "Autoplay",
          type: "boolean",
          default: true,
          description: "Wander a light across the moss on its own when the pointer is away or still.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("idleDelay", "Idle delay", 1.5, "Seconds the pointer can rest before the light wanders off on its own.", 0.2, 6, 0.1, "cursor", "Cursor"),
        range("revealRadius", "Reveal size", 0.6, "Size of the pool of light around the pointer, in world units.", 0.2, 2, 0.05, "cursor", "Cursor"),
        range("trail", "Trail", 1.2, "How long the trail of light behind the pointer lingers, in seconds.", 0.1, 4, 0.05, "cursor", "Cursor"),
        range("ambient", "Ambient", 0, "How visible the grid is away from the pointer. 0 hides it, so it shows only where the pointer is.", 0, 1, 0.01, "cursor", "Cursor"),
        range("cursorStrength", "Swell", 1, "How strongly the pointer swells the ground.", 0, 3, 0.05, "cursor", "Cursor"),
        range("cursorRadius", "Swell reach", 1.2, "How far the swell under the pointer reaches, in world units.", 0.3, 3, 0.05, "cursor", "Cursor"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The hills hold still.",
              body: "With reduced motion, Moss Grid shows one still frame: the hills stop drifting, the lights stop shimmering, and the whole grid shows, since there is no pointer reveal. Setting changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
