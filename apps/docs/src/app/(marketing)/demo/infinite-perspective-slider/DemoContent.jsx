"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import RemixerPanel from "@/components/remixer-panel/RemixerPanel";
import remixerStyles from "@/components/remixer-panel/remixer-panel.module.css";
import InfinitePerspectiveSlider from "@/components/infinite-perspective-slider";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  cardWidth: 320,
  cardGap: 24,
  perspective: 2200,
  scrollSpeed: 1,
  scrollLerp: 0.1,
  velocityLerp: 0.09,
  rotationSensitivity: 0.025,
  rotationDamp: 0.1,
  rotationLerp: 0.12,
  maxRotation: 80,
  scrollStopDelay: 180,
  textEnterDuration: 0.35,
  textLeaveDuration: 0.35,
  textStagger: 0.06,
};

const controlGroups = [
  {
    id: "layout",
    title: "Layout",
    controls: [
      {
        id: "cardWidth",
        label: "Card Width",
        type: "range",
        min: 160,
        max: 560,
        step: 1,
        description: "Sets how wide each card is on desktop.",
      },
      {
        id: "cardGap",
        label: "Card Gap",
        type: "range",
        min: 0,
        max: 160,
        step: 1,
        description: "Adds spacing between the cards in the loop.",
      },
      {
        id: "perspective",
        label: "Perspective",
        type: "range",
        min: 600,
        max: 5000,
        step: 50,
        description: "Controls the depth of the 3D perspective.",
      },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    controls: [
      {
        id: "scrollSpeed",
        label: "Scroll Speed",
        type: "range",
        min: 0.1,
        max: 3,
        step: 0.05,
        description: "Scales how far one scroll or drag moves the strip.",
      },
      {
        id: "scrollLerp",
        label: "Scroll Smoothing",
        type: "range",
        min: 0.02,
        max: 0.4,
        step: 0.01,
        description: "Adjusts how quickly the strip catches up to the target.",
      },
      {
        id: "velocityLerp",
        label: "Velocity Smoothing",
        type: "range",
        min: 0.02,
        max: 0.3,
        step: 0.01,
        description: "Smooths the tracked scroll velocity.",
      },
    ],
  },
  {
    id: "rotation",
    title: "Rotation",
    controls: [
      {
        id: "rotationSensitivity",
        label: "Rotation Sensitivity",
        type: "range",
        min: 0,
        max: 0.15,
        step: 0.005,
        description: "Sets how much velocity tilts the cards.",
      },
      {
        id: "rotationDamp",
        label: "Rotation Damping",
        type: "range",
        min: 0.02,
        max: 0.4,
        step: 0.01,
        description: "Controls how fast the tilt reacts to velocity.",
      },
      {
        id: "rotationLerp",
        label: "Rotation Smoothing",
        type: "range",
        min: 0.02,
        max: 0.4,
        step: 0.01,
        description: "Eases the tilt back toward its target angle.",
      },
      {
        id: "maxRotation",
        label: "Max Rotation",
        type: "range",
        min: 0,
        max: 89,
        step: 1,
        description: "Caps the tilt angle in degrees.",
      },
    ],
  },
  {
    id: "text",
    title: "Card Text",
    controls: [
      {
        id: "textEnterDuration",
        label: "Text Enter",
        type: "range",
        min: 0.1,
        max: 1.2,
        step: 0.05,
        description: "Sets how long the hover text takes to reveal.",
      },
      {
        id: "textLeaveDuration",
        label: "Text Leave",
        type: "range",
        min: 0.1,
        max: 1.2,
        step: 0.05,
        description: "Sets how long the hover text takes to hide.",
      },
      {
        id: "textStagger",
        label: "Text Stagger",
        type: "range",
        min: 0,
        max: 0.3,
        step: 0.01,
        description: "Offsets each line as the text reveals.",
      },
      {
        id: "scrollStopDelay",
        label: "Scroll Stop Delay",
        type: "range",
        min: 0,
        max: 600,
        step: 10,
        description: "Waits this long after scrolling before text returns.",
      },
    ],
  },
];

function buildInfinitePerspectiveSliderCode(values) {
  return `/**
 * Infinite Perspective Slider remixer changes:
 * - cardWidth: ${values.cardWidth}
 * - cardGap: ${values.cardGap}
 * - perspective: ${values.perspective}
 * - scrollSpeed: ${values.scrollSpeed}
 * - scrollLerp: ${values.scrollLerp}
 * - velocityLerp: ${values.velocityLerp}
 * - rotationSensitivity: ${values.rotationSensitivity}
 * - rotationDamp: ${values.rotationDamp}
 * - rotationLerp: ${values.rotationLerp}
 * - maxRotation: ${values.maxRotation}
 * - scrollStopDelay: ${values.scrollStopDelay}
 * - textEnterDuration: ${values.textEnterDuration}
 * - textLeaveDuration: ${values.textLeaveDuration}
 * - textStagger: ${values.textStagger}
 */

import InfinitePerspectiveSlider from "@/components/infinite-perspective-slider";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

const infinitePerspectiveSliderProps = {
  cardWidth: ${values.cardWidth},
  cardGap: ${values.cardGap},
  perspective: ${values.perspective},
  scrollSpeed: ${values.scrollSpeed},
  scrollLerp: ${values.scrollLerp},
  velocityLerp: ${values.velocityLerp},
  rotationSensitivity: ${values.rotationSensitivity},
  rotationDamp: ${values.rotationDamp},
  rotationLerp: ${values.rotationLerp},
  maxRotation: ${values.maxRotation},
  scrollStopDelay: ${values.scrollStopDelay},
  textEnterDuration: ${values.textEnterDuration},
  textLeaveDuration: ${values.textLeaveDuration},
  textStagger: ${values.textStagger},
};

export default function InfinitePerspectiveSliderDemo() {
  return (
    <>
      <DemoHeader />
      <LenisSmoothScroll />
      <InfinitePerspectiveSlider {...infinitePerspectiveSliderProps} />
      <ScrollBottom textColor="text-[#111111]" className="bottom-[5%] gap-[1vw] max-md:hidden" />
    </>
  );
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
    <div className="relative min-h-screen bg-white">
      <DemoHeader />
      <LenisSmoothScroll />

      <InfinitePerspectiveSlider
        cardWidth={controls.cardWidth}
        cardGap={controls.cardGap}
        perspective={controls.perspective}
        scrollSpeed={controls.scrollSpeed}
        scrollLerp={controls.scrollLerp}
        velocityLerp={controls.velocityLerp}
        rotationSensitivity={controls.rotationSensitivity}
        rotationDamp={controls.rotationDamp}
        rotationLerp={controls.rotationLerp}
        maxRotation={controls.maxRotation}
        scrollStopDelay={controls.scrollStopDelay}
        textEnterDuration={controls.textEnterDuration}
        textLeaveDuration={controls.textLeaveDuration}
        textStagger={controls.textStagger}
      />

      <ScrollBottom textColor="text-[#111111]" className="bottom-[5%] gap-[1vw] max-md:hidden" />

      <div className="pointer-events-none absolute inset-0 z-40 hidden xl:block">
        <motion.button
          type="button"
          onClick={() => setIsPanelExpanded((current) => !current)}
          animate={{ x: isPanelExpanded ? -140 : 0 }}
          transition={panelTransition}
          style={{
            transition:
              "background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
          }}
          className={`${remixerStyles.footerButton} pointer-events-auto absolute! right-10! top-25 z-50 w-auto min-h-0! flex-none rounded-full! border! border-white/50! bg-[#0e0e0e]! px-[1.2vw]! py-[.8vw]! text-[1.15vw]! tracking-wide`}
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
          className={`absolute right-2 rounded-md  top-37 h-[80vh] w-86 bg-[#0e0e0e]  ${
            isPanelExpanded ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="h-full py-4">
            <RemixerPanel
              isExpanded={isPanelExpanded}
              groups={controlGroups}
              values={controls}
              onChange={updateControl}
              onCopyCode={() => buildInfinitePerspectiveSliderCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="layout"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
