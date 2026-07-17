"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import Image from "next/image";
import ArrowFillButton from "@/components/arrow-fill-button";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  bgColor: "#ff5f00",
  textColor: "#ffffff",
  hoverFillBgColor: "#ffffff",
  hoverFillTextColor: "#ff5f00",
  animationDuration: 0.45,
  showArrow: true,
  fillOnHover: true,
};

const controlGroups = [
  {
    id: "colors",
    title: "Colors",
    controls: [
      {
        id: "bgColor",
        label: "Background",
        type: "color",
        description: "Colors the button at rest.",
      },
      {
        id: "textColor",
        label: "Text Color",
        type: "color",
        description: "Colors the label at rest.",
      },
      {
        id: "hoverFillBgColor",
        label: "Fill Color",
        type: "color",
        description: "Colors the circle and the fill that expands on hover.",
      },
      {
        id: "hoverFillTextColor",
        label: "Fill Text Color",
        type: "color",
        description: "Colors the arrow and the label once filled.",
      },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    controls: [
      {
        id: "animationDuration",
        label: "Duration",
        type: "range",
        min: 0.1,
        max: 2,
        step: 0.05,
        description: "Sets how long the fill and arrow take to animate.",
      },
      {
        id: "fillOnHover",
        label: "Fill On Hover",
        type: "checkbox",
        description: "Expands the circle across the button on hover.",
      },
      {
        id: "showArrow",
        label: "Show Arrow",
        type: "checkbox",
        description: "Turns the arrow circle on or off.",
      },
    ],
  },
];

function buildArrowFillButtonCode(values) {
  return `/**
 * Arrow Fill Button remixer changes:
 * - bgColor: ${values.bgColor}
 * - textColor: ${values.textColor}
 * - hoverFillBgColor: ${values.hoverFillBgColor}
 * - hoverFillTextColor: ${values.hoverFillTextColor}
 * - animationDuration: ${values.animationDuration}
 * - showArrow: ${values.showArrow}
 * - fillOnHover: ${values.fillOnHover}
 */

import ArrowFillButton from "@/components/arrow-fill-button";

export default function ArrowFillButtonDemo() {
  return (
    <ArrowFillButton
      href="#"
      btnText="Hover me"
      bgColor="${values.bgColor}"
      textColor="${values.textColor}"
      fillBgColor="${values.hoverFillBgColor}"
      hoverFillBgColor="${values.hoverFillBgColor}"
      fillTextColor="${values.hoverFillTextColor}"
      hoverFillTextColor="${values.hoverFillTextColor}"
      animationDuration={${values.animationDuration}}
      showArrow={${values.showArrow}}
      fillOnHover={${values.fillOnHover}}
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
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />

      <div className="h-screen w-screen flex items-center justify-center relative">
        <div className="space-y-20 relative z-10 text-center -mt-20">
          <div className="space-y-4">
            <p className="text-xs max-sm:text-sm max-md:text-base uppercase tracking-[0.4em] text-white/60">
              Hyperiux Button Demo
            </p>
            <h1 className="text-5xl font-medium max-sm:text-4xl">Arrow Fill Button</h1>
          </div>

          <div className="">
            <ArrowFillButton
              href="#"
              btnText="Hover me"
              bgColor={controls.bgColor}
              textColor={controls.textColor}
              fillBgColor={controls.hoverFillBgColor}
              hoverFillBgColor={controls.hoverFillBgColor}
              fillTextColor={controls.hoverFillTextColor}
              hoverFillTextColor={controls.hoverFillTextColor}
              animationDuration={controls.animationDuration}
              showArrow={controls.showArrow}
              fillOnHover={controls.fillOnHover}
            />
          </div>
        </div>

        <div className="fixed inset-0">
          <Image
            src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
            alt="bg image"
            title="Arrow Fill Button"
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
              onCopyCode={() => buildArrowFillButtonCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="colors"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
