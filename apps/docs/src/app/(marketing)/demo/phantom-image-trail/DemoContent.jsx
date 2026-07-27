"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerPanel from "@/components/remixer-panel/RemixerPanel";
import remixerStyles from "@/components/remixer-panel/remixer-panel.module.css";
import PhantomImageTrail from "@/components/phantom-image-trail";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const images = [
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg", alt: "Gradient 1" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg", alt: "Gradient 2" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg", alt: "Gradient 3" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg", alt: "Gradient 4" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg", alt: "Gradient 5" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg", alt: "Gradient 6" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg", alt: "Gradient 7" },
];

const defaultControls = {
  imageMultiplier: 3,
  triggerDistance: 100,
  lerpFactor: 0.1,
  popOutDuration: 0.8,
  fadeOutDuration: 0.5,
  startScale: 0.2,
  endScale: 1,
  exitScale: 0,
  enableRotation: true,
  maxStartRotation: 35,
  maxExitRotation: 15,
  idleSpawn: false,
  idleDelay: 300,
  idlePopOutMultiplier: 2.2,
  idleFadeMultiplier: 1.8,
};

const controlGroups = [
  {
    id: "trail",
    title: "Trail",
    controls: [
      {
        id: "imageMultiplier",
        label: "Image Multiplier",
        type: "range",
        min: 1,
        max: 8,
        step: 1,
        description: "Sets how many copies of the set can be in flight.",
      },
      {
        id: "triggerDistance",
        label: "Trigger Distance",
        type: "range",
        min: 10,
        max: 400,
        step: 1,
        description: "Sets how far the cursor moves before a new image spawns.",
      },
      {
        id: "lerpFactor",
        label: "Follow Smoothing",
        type: "range",
        min: 0.02,
        max: 0.5,
        step: 0.01,
        description: "Adjusts how quickly the trail follows the cursor.",
      },
    ],
  },
  {
    id: "timing",
    title: "Timing",
    controls: [
      {
        id: "popOutDuration",
        label: "Pop Out Duration",
        type: "range",
        min: 0.1,
        max: 2.5,
        step: 0.05,
        description: "Controls how long each image takes to appear.",
      },
      {
        id: "fadeOutDuration",
        label: "Fade Out Duration",
        type: "range",
        min: 0.1,
        max: 2.5,
        step: 0.05,
        description: "Controls how long each image takes to fade away.",
      },
    ],
  },
  {
    id: "scale",
    title: "Scale",
    controls: [
      {
        id: "startScale",
        label: "Start Scale",
        type: "range",
        min: 0,
        max: 2,
        step: 0.05,
        description: "Sets the size each image pops in from.",
      },
      {
        id: "endScale",
        label: "End Scale",
        type: "range",
        min: 0.2,
        max: 2,
        step: 0.05,
        description: "Sets the size each image settles at.",
      },
      {
        id: "exitScale",
        label: "Exit Scale",
        type: "range",
        min: 0,
        max: 1.5,
        step: 0.05,
        description: "Sets the size each image shrinks to on exit.",
      },
    ],
  },
  {
    id: "rotation",
    title: "Rotation",
    controls: [
      {
        id: "enableRotation",
        label: "Enable Rotation",
        type: "checkbox",
        description: "Turns the random image tilt on or off.",
      },
      {
        id: "maxStartRotation",
        label: "Max Start Rotation",
        type: "range",
        min: 0,
        max: 90,
        step: 1,
        description: "Caps the random tilt an image spawns with.",
      },
      {
        id: "maxExitRotation",
        label: "Max Exit Rotation",
        type: "range",
        min: 0,
        max: 90,
        step: 1,
        description: "Caps the random tilt an image leaves with.",
      },
    ],
  },
  {
    id: "idle",
    title: "Idle",
    controls: [
      {
        id: "idleSpawn",
        label: "Idle Spawn",
        type: "checkbox",
        description: "Keeps popping images while the cursor rests.",
      },
      {
        id: "idleDelay",
        label: "Idle Delay",
        type: "range",
        min: 0,
        max: 2000,
        step: 10,
        description: "Waits this long before idle pops begin.",
      },
      {
        id: "idlePopOutMultiplier",
        label: "Idle Pop Multiplier",
        type: "range",
        min: 0.5,
        max: 4,
        step: 0.1,
        description: "Slows the pop-in while idle.",
      },
      {
        id: "idleFadeMultiplier",
        label: "Idle Fade Multiplier",
        type: "range",
        min: 0.5,
        max: 4,
        step: 0.1,
        description: "Slows the fade-out while idle.",
      },
    ],
  },
];

function buildPhantomImageTrailCode(values) {
  return `/**
 * Phantom Image Trail remixer changes:
 * - imageMultiplier: ${values.imageMultiplier}
 * - triggerDistance: ${values.triggerDistance}
 * - lerpFactor: ${values.lerpFactor}
 * - popOutDuration: ${values.popOutDuration}
 * - fadeOutDuration: ${values.fadeOutDuration}
 * - startScale: ${values.startScale}
 * - endScale: ${values.endScale}
 * - exitScale: ${values.exitScale}
 * - enableRotation: ${values.enableRotation}
 * - maxStartRotation: ${values.maxStartRotation}
 * - maxExitRotation: ${values.maxExitRotation}
 * - idleSpawn: ${values.idleSpawn}
 * - idleDelay: ${values.idleDelay}
 * - idlePopOutMultiplier: ${values.idlePopOutMultiplier}
 * - idleFadeMultiplier: ${values.idleFadeMultiplier}
 */

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import PhantomImageTrail from "@/components/phantom-image-trail";

const phantomImageTrailProps = {
  imageMultiplier: ${values.imageMultiplier},
  triggerDistance: ${values.triggerDistance},
  lerpFactor: ${values.lerpFactor},
  popOutDuration: ${values.popOutDuration},
  fadeOutDuration: ${values.fadeOutDuration},
  startScale: ${values.startScale},
  endScale: ${values.endScale},
  exitScale: ${values.exitScale},
  enableRotation: ${values.enableRotation},
  maxStartRotation: ${values.maxStartRotation},
  maxExitRotation: ${values.maxExitRotation},
  idleSpawn: ${values.idleSpawn},
  idleDelay: ${values.idleDelay},
  idlePopOutMultiplier: ${values.idlePopOutMultiplier},
  idleFadeMultiplier: ${values.idleFadeMultiplier},
  cursorOffsetX: -12,
  cursorOffsetY: -12,
};

export default function PhantomImageTrailDemo() {
  return (
    <>
      <DemoHeader />
      <div className="w-screen h-screen relative bg-white">
        <div className="absolute w-full h-full flex justify-center items-center">
          <h1 className="text-[5.5vw] max-md:hidden text-stone-800">
            Move the Mouse to See Magic
          </h1>
        </div>
        <PhantomImageTrail images={images} {...phantomImageTrailProps} />
      </div>
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

      {/* isolate keeps the trail's climbing z-index from painting over the panel */}
      <div className="w-screen h-screen relative isolate bg-white">
        <div className="absolute w-full h-full flex justify-center items-center">
          <h1 className="text-[5.5vw] max-md:hidden text-stone-800">
            Move the Mouse to See Magic
          </h1>
          <p className="max-sm:text-[5.5vw] max-md:text-[4vw] font-serif text-center leading-[1.4] hidden max-md:block text-stone-800">
            Tap to explore
            <span className="max-sm:uppercase block text-center max-sm:pt-[5vw] max-md:pt-[3vw] leading-[1.2]">
              The full magic happens on Desktop
            </span>
          </p>
        </div>

        <PhantomImageTrail
          images={images}
          imageMultiplier={controls.imageMultiplier}
          triggerDistance={controls.triggerDistance}
          lerpFactor={controls.lerpFactor}
          popOutDuration={controls.popOutDuration}
          fadeOutDuration={controls.fadeOutDuration}
          startScale={controls.startScale}
          endScale={controls.endScale}
          exitScale={controls.exitScale}
          enableRotation={controls.enableRotation}
          minStartRotation={-controls.maxStartRotation}
          maxStartRotation={controls.maxStartRotation}
          minExitRotation={-controls.maxExitRotation}
          maxExitRotation={controls.maxExitRotation}
          idleSpawn={controls.idleSpawn}
          idleDelay={controls.idleDelay}
          idlePopOutMultiplier={controls.idlePopOutMultiplier}
          idleFadeMultiplier={controls.idleFadeMultiplier}
          cursorOffsetX={-12}
          cursorOffsetY={-12}
        />
      </div>

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
              onCopyCode={() => buildPhantomImageTrailCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="trail"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
