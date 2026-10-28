"use client";

import FlowerField from "@/components/flower-field";
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
      name="flower-field"
      category="backgrounds"
      component={FlowerField}
      props={[
        range("follow", "Follow", 1, "How hard the flowers lean toward the pointer and get carried by it. 0 leaves them be.", 0, 3, 0.05, "cursor", "Cursor"),
        range("followRadius", "Reach", 1.3, "Reach of the pointer, in world units.", 0.4, 3, 0.05, "cursor", "Cursor"),
        {
          name: "bloomOnHover",
          label: "Bloom on hover",
          type: "boolean",
          default: true,
          description: "Open buds as the pointer passes over them.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("speed", "Speed", 1, "How quickly the flowers open, and how springy their stems are.", 0.3, 3, 0.05),
        range("breeze", "Breeze", 1, "How much the breeze sways the flowers. 0 holds them still.", 0, 3, 0.05),
        range("density", "Density", 1, "How many flowers and buds grow across the frame. 1 is the reference meadow.", 0.4, 2, 0.05, "look", "Look"),
        range("glow", "Glow", 1, "Strength of the glow around the flowers.", 0, 2.5, 0.05, "look", "Look"),
        range("depthOfField", "Depth of field", 1, "How blurred the flowers in front of and behind the focus are. 0 keeps everything sharp.", 0, 2.5, 0.05, "look", "Look"),
        range("mist", "Mist", 1, "Strength of the mist along the ground.", 0, 2, 0.05, "look", "Look"),
        range("grain", "Grain", 0.05, "Film grain strength. 0 turns it off.", 0, 0.3, 0.01, "look", "Look"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The meadow holds still.",
              body: "With reduced motion, Flower Field shows the meadow already in bloom as one still frame: the flowers stay open and still, and the pointer no longer moves them. Setting changes still apply.",
            }}
          />
          <main className="relative h-screen w-full">
            {effect}
            <p className="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-xs text-white/40">
              Flower model:{" "}
              <a className="underline" href="https://sketchfab.com/3d-models/wood-anemone-cec4f820ad70467899c661498564a780" target="_blank" rel="noreferrer">
                Wood anemone
              </a>{" "}
              by Skuft,{" "}
              <a className="underline" href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                CC BY 4.0
              </a>
            </p>
          </main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
