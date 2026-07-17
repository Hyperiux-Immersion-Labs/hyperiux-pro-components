"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import CircularSplitRoll from "@/components/circular-split-roll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  imageCardWidth: 205,
  imageCardHeight: 205,
  leftRadiusX: 500,
  leftRadiusY: 500,
  rightRadiusX: 500,
  rightRadiusY: 500,
  textCenterScale: 1,
  textSideScale: 0.68,
  textSideOpacity: 0.18,
  imageCenterScale: 1,
  imageSideScale: 0.58,
  imageSideOpacity: 0.14,
};

const controlGroups = [
  {
    id: "layout",
    title: "Layout",
    controls: [
      {
        id: "imageCardWidth",
        label: "Card Width",
        type: "range",
        min: 80,
        max: 420,
        step: 1,
        description: "Sets how wide each image card is.",
      },
      {
        id: "imageCardHeight",
        label: "Card Height",
        type: "range",
        min: 80,
        max: 420,
        step: 1,
        description: "Sets how tall each image card is.",
      },
    ],
  },
  {
    id: "circle",
    title: "Circle",
    controls: [
      {
        id: "leftRadiusX",
        label: "Left Radius X",
        type: "range",
        min: 100,
        max: 900,
        step: 10,
        description: "Sets the horizontal spread of the left ring.",
      },
      {
        id: "leftRadiusY",
        label: "Left Radius Y",
        type: "range",
        min: 100,
        max: 900,
        step: 10,
        description: "Sets the vertical spread of the left ring.",
      },
      {
        id: "rightRadiusX",
        label: "Right Radius X",
        type: "range",
        min: 100,
        max: 900,
        step: 10,
        description: "Sets the horizontal spread of the right ring.",
      },
      {
        id: "rightRadiusY",
        label: "Right Radius Y",
        type: "range",
        min: 100,
        max: 900,
        step: 10,
        description: "Sets the vertical spread of the right ring.",
      },
    ],
  },
  {
    id: "text",
    title: "Text",
    controls: [
      {
        id: "textCenterScale",
        label: "Center Scale",
        type: "range",
        min: 0.4,
        max: 2.5,
        step: 0.05,
        description: "Sets the title size at the center of the ring.",
      },
      {
        id: "textSideScale",
        label: "Side Scale",
        type: "range",
        min: 0.1,
        max: 1.5,
        step: 0.02,
        description: "Sets the title size away from the center.",
      },
      {
        id: "textSideOpacity",
        label: "Side Opacity",
        type: "range",
        min: 0,
        max: 1,
        step: 0.02,
        description: "Fades the titles away from the center.",
      },
    ],
  },
  {
    id: "images",
    title: "Images",
    controls: [
      {
        id: "imageCenterScale",
        label: "Center Scale",
        type: "range",
        min: 0.4,
        max: 2.5,
        step: 0.05,
        description: "Sets the image size at the center of the ring.",
      },
      {
        id: "imageSideScale",
        label: "Side Scale",
        type: "range",
        min: 0.1,
        max: 1.5,
        step: 0.02,
        description: "Sets the image size away from the center.",
      },
      {
        id: "imageSideOpacity",
        label: "Side Opacity",
        type: "range",
        min: 0,
        max: 1,
        step: 0.02,
        description: "Fades the images away from the center.",
      },
    ],
  },
];

function buildCircularSplitRollCode(values) {
  return `/**
 * Circular Split Roll remixer changes:
 * - imageCardWidth: ${values.imageCardWidth}
 * - imageCardHeight: ${values.imageCardHeight}
 * - leftRadiusX: ${values.leftRadiusX}
 * - leftRadiusY: ${values.leftRadiusY}
 * - rightRadiusX: ${values.rightRadiusX}
 * - rightRadiusY: ${values.rightRadiusY}
 * - textCenterScale: ${values.textCenterScale}
 * - textSideScale: ${values.textSideScale}
 * - textSideOpacity: ${values.textSideOpacity}
 * - imageCenterScale: ${values.imageCenterScale}
 * - imageSideScale: ${values.imageSideScale}
 * - imageSideOpacity: ${values.imageSideOpacity}
 */

import CircularSplitRoll from "@/components/circular-split-roll";

const config = {
  imageCardWidth: ${values.imageCardWidth},
  imageCardHeight: ${values.imageCardHeight},
  leftRadiusX: ${values.leftRadiusX},
  leftRadiusY: ${values.leftRadiusY},
  rightRadiusX: ${values.rightRadiusX},
  rightRadiusY: ${values.rightRadiusY},
  textCenterScale: ${values.textCenterScale},
  textSideScale: ${values.textSideScale},
  textSideOpacity: ${values.textSideOpacity},
  imageCenterScale: ${values.imageCenterScale},
  imageSideScale: ${values.imageSideScale},
  imageSideOpacity: ${values.imageSideOpacity},
};

export default function CircularSplitRollDemo() {
  return <CircularSplitRoll config={config} />;
}`;
}

export default function DemoContent() {
  const [controls, setControls] = useState(defaultControls);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const updateControl = (id, value) => {
    setControls((current) => ({
      ...current,
      [id]: value,
    }));
  };

  const resetControls = () => {
    setControls(defaultControls);
  };

  return (
    <>
      <DemoHeader textColor="#ffffff" logoColor="#ffffff" />

      <div className="hidden max-md:block flex flex-col justify-center items-center gap-[2vw] text-center max-sm:pt-[18vw]  pt-[10vw]">
        <h1 className="text-[7vw] max-sm:text-[11vw]">Circular Split Roll</h1>
        <p>Open in desktop for the better experience</p>
      </div>

      <CircularSplitRoll config={controls} />

      <ScrollBottom />

      <div className="pointer-events-none fixed inset-0 z-80 hidden xl:block">
        <motion.button
          type="button"
          onClick={() => setIsPanelExpanded((current) => !current)}
          animate={{ x: isPanelExpanded ? -140 : 0 }}
          transition={panelTransition}
          style={{
            transition:
              "background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
          }}
          className={`${remixerStyles.footerButton} pointer-events-auto absolute! right-10! top-30 z-50 w-auto min-h-0! flex-none rounded-full! border! border-white/50! bg-[#0e0e0e]! px-[1.2vw]! py-[.8vw]! text-[1.15vw]! tracking-wide`}
        >
          <PanelLeft
            className={`${remixerStyles.actionIcon} transition-transform duration-300 ${
              isPanelExpanded ? "" : "scale-x-[-1]"
            }`}
          />
          <span className={`${remixerStyles.footerButtonText} text-[1.1vw] tracking-wide`}>Controls</span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{ x: isPanelExpanded ? "0%" : "104%" }}
          transition={panelTransition}
          className={`absolute right-2 rounded-md top-42 h-[75vh] w-86 bg-[#0e0e0e] ${
            isPanelExpanded ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="h-full py-4">
            <RemixerPanel
              isExpanded={isPanelExpanded}
              groups={controlGroups}
              values={controls}
              onChange={updateControl}
              onCopyCode={() => buildCircularSplitRollCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="layout"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
