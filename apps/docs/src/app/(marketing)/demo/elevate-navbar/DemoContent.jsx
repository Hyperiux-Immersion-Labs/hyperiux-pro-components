"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import RemixerPanel from "@/components/remixer-panel/RemixerPanel";
import remixerStyles from "@/components/remixer-panel/remixer-panel.module.css";
import ElevateNavbar from "@/components/elevate-navbar";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  backgroundColor: "#d8b4fe",
  ctaBackground: "#ffffff",
  ctaHoverBackground: "#000000",
  staggerItems: true,
};

const controlGroups = [
  {
    id: "appearance",
    title: "Appearance",
    controls: [
      {
        id: "backgroundColor",
        label: "Background",
        type: "color",
        description: "Sets the page background behind the navbar.",
      },
      {
        id: "ctaBackground",
        label: "CTA Color",
        type: "color",
        description: "Colors the CTA button at rest.",
      },
      {
        id: "ctaHoverBackground",
        label: "CTA Hover Color",
        type: "color",
        description: "Colors the CTA button on hover.",
      },
    ],
  },
  {
    id: "dropdown",
    controls: [
      {
        id: "staggerItems",
        label: "Stagger Items",
        type: "checkbox",
        description: "Reveals items one by one instead of all together.",
      },
    ],
  },
];

function buildElevateNavbarCode(values) {
  return `/**
 * Elevate Navbar remixer changes:
 * - backgroundColor: ${values.backgroundColor}
 * - ctaBackground: ${values.ctaBackground}
 * - ctaHoverBackground: ${values.ctaHoverBackground}
 * - staggerItems: ${values.staggerItems}
 */

import ElevateNavbar from "@/components/elevate-navbar";

const navConfig = {
  backgroundColor: "${values.backgroundColor}",
  ctaBackground: "${values.ctaBackground}",
  ctaHoverBackground: "${values.ctaHoverBackground}",
  staggerItems: ${values.staggerItems},
};

export default function ElevateNavbarDemo() {
  return <ElevateNavbar navConfig={navConfig} />;
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
    <div className="relative min-h-screen">
      <ElevateNavbar
        navConfig={{
          backgroundColor: controls.backgroundColor,
          ctaBackground: controls.ctaBackground,
          ctaHoverBackground: controls.ctaHoverBackground,
          staggerItems: controls.staggerItems,
        }}
      />

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
              onCopyCode={() => buildElevateNavbarCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="appearance"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
