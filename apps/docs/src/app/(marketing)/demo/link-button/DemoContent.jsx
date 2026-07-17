"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import Image from "next/image";
import LinkButton from "@/components/link-button";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  textColor: "#ffffff",
  hoverColor: "#ff6b00",
  transitionDuration: 0.5,
  underlineHeight: 1.5,
  underlineOnHover: true,
  showIcon: true,
  rotateIconOnHover: true,
  iconRotation: -45,
};

const controlGroups = [
  {
    id: "appearance",
    title: "Appearance",
    controls: [
      {
        id: "textColor",
        label: "Text Color",
        type: "color",
        description: "Colors the label and the underline.",
      },
      {
        id: "hoverColor",
        label: "Hover Color",
        type: "color",
        description: "Colors the label and underline while hovered.",
      },
      {
        id: "transitionDuration",
        label: "Transition Duration",
        type: "range",
        min: 0.1,
        max: 2,
        step: 0.05,
        description: "Sets how long the underline and arrow take to animate.",
      },
    ],
  },
  {
    id: "underline",
    title: "Underline",
    controls: [
      {
        id: "underlineOnHover",
        label: "Underline On Hover",
        type: "checkbox",
        description: "Sweeps the underline in when hovered.",
      },
      {
        id: "underlineHeight",
        label: "Thickness",
        type: "range",
        min: 0.5,
        max: 10,
        step: 0.5,
        description: "Sets how thick the underline is.",
      },
    ],
  },
  {
    id: "icon",
    title: "Icon",
    controls: [
      {
        id: "showIcon",
        label: "Show Icon",
        type: "checkbox",
        description: "Turns the arrow next to the label on or off.",
      },
      {
        id: "rotateIconOnHover",
        label: "Rotate On Hover",
        type: "checkbox",
        description: "Turns the arrow when hovered.",
      },
      {
        id: "iconRotation",
        label: "Rotation",
        type: "range",
        min: -180,
        max: 180,
        step: 5,
        description: "Sets how far the arrow turns on hover.",
      },
    ],
  },
];

function buildLinkButtonCode(values) {
  return `/**
 * Link Button remixer changes:
 * - textColor: ${values.textColor}
 * - hoverColor: ${values.hoverColor}
 * - transitionDuration: ${values.transitionDuration}
 * - underlineHeight: ${values.underlineHeight}
 * - underlineOnHover: ${values.underlineOnHover}
 * - showIcon: ${values.showIcon}
 * - rotateIconOnHover: ${values.rotateIconOnHover}
 * - iconRotation: ${values.iconRotation}
 */

import LinkButton from "@/components/link-button";

export default function LinkButtonDemo() {
  return (
    <LinkButton
      text="Hover me"
      href="#"
      iconClassName="size-[2vw] mt-[0.2vw] max-sm:size-[4vw]"
      className="text-[2vw] max-sm:text-[4.5vw]"
      textColor="${values.textColor}"
      hoverColor="${values.hoverColor}"
      clickedColor="${values.hoverColor}"
      transitionDuration={${values.transitionDuration}}
      underlineHeight={${values.underlineHeight}}
      underlineOnHover={${values.underlineOnHover}}
      showIcon={${values.showIcon}}
      rotateIconOnHover={${values.rotateIconOnHover}}
      iconRotation={${values.iconRotation}}
    />
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
    <>
      <DemoHeader textColor="#ffffff" logoColor="#ffffff" />

      <div className="h-screen w-screen flex items-center justify-center relative">
        <div className="space-y-20 relative z-10 text-center -mt-20">
          <div className="space-y-4">
            <h1 className="text-xs max-sm:text-sm max-md:text-base uppercase tracking-[0.4em] text-white/60">
              Hyperiux Button Demo
            </h1>
            <p className="text-5xl font-medium max-sm:text-4xl">Link Button</p>
          </div>

          <div className="w-fit mx-auto">
            <LinkButton
              text="Hover me"
              href="#"
              iconClassName="size-[2vw] mt-[0.2vw] max-sm:size-[4vw]"
              className="text-[2vw] max-sm:text-[4.5vw]"
              textColor={controls.textColor}
              hoverColor={controls.hoverColor}
              clickedColor={controls.hoverColor}
              transitionDuration={controls.transitionDuration}
              underlineHeight={controls.underlineHeight}
              underlineOnHover={controls.underlineOnHover}
              showIcon={controls.showIcon}
              rotateIconOnHover={controls.rotateIconOnHover}
              iconRotation={controls.iconRotation}
            />
          </div>
        </div>

        <div className="fixed inset-0">
          <Image
            src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg"
            alt="bg image"
            title="Link Button"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      </div>

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
              onCopyCode={() => buildLinkButtonCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="underline"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
