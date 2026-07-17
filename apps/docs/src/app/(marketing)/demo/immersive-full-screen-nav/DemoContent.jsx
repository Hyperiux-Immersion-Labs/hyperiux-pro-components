"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";
import ImmersiveFullscreenNav from "@/components/immersive-full-screen-navigation";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  overlayBg: "#ff5f00",
  headerOpenColor: "#ffffff",
  clipOrigin: "bottom",
  openDuration: 1.2,
  closeDuration: 1.2,
  linkDuration: 0.8,
  linkStagger: 0.07,
  linkOffsetY: 30,
  imageDuration: 0.9,
  imageStagger: 0.02,
  imageStartScale: 0.8,
  socialDuration: 0.5,
  socialStagger: 0.06,
  socialOffsetY: 14,
};

const controlGroups = [
  {
    id: "overlay",
    title: "Overlay",
    controls: [
      {
        id: "overlayBg",
        label: "Overlay Color",
        type: "color",
        description: "Sets the fill color of the fullscreen panel.",
      },
      {
        id: "headerOpenColor",
        label: "Hamburger Color",
        type: "color",
        description: "Colors the hamburger bars while the nav is open.",
      },
      {
        id: "clipOrigin",
        label: "Clip Origin",
        type: "select",
        options: [
          { value: "bottom", label: "Bottom" },
          { value: "top", label: "Top" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
        description: "Chooses the edge the overlay reveals from.",
      },
    ],
  },
  {
    id: "timing",
    title: "Timing",
    controls: [
      {
        id: "openDuration",
        label: "Open Duration",
        type: "range",
        min: 0.2,
        max: 3,
        step: 0.05,
        description: "Sets how long the overlay takes to reveal.",
      },
      {
        id: "closeDuration",
        label: "Close Duration",
        type: "range",
        min: 0.2,
        max: 3,
        step: 0.05,
        description: "Sets how long the overlay takes to hide.",
      },
    ],
  },
  {
    id: "links",
    title: "Links",
    controls: [
      {
        id: "linkStagger",
        label: "Link Stagger",
        type: "range",
        min: 0,
        max: 0.4,
        step: 0.01,
        description: "Offsets each link as the list reveals.",
      },
    ],
  },
  {
    id: "media",
    title: "Images",
    controls: [
      {
        id: "imageStagger",
        label: "Image Stagger",
        type: "range",
        min: 0,
        max: 0.4,
        step: 0.01,
        description: "Offsets each image as they reveal.",
      },
    ],
  },
  {
    id: "socials",
    title: "Socials",
    controls: [
      {
        id: "socialStagger",
        label: "Social Stagger",
        type: "range",
        min: 0,
        max: 0.4,
        step: 0.01,
        description: "Offsets each social icon as they reveal.",
      },
    ],
  },
];

function buildImmersiveFullscreenNavCode(values) {
  return `/**
 * Immersive Fullscreen Nav remixer changes:
 * - overlayBg: ${values.overlayBg}
 * - headerOpenColor: ${values.headerOpenColor}
 * - clipOrigin: ${values.clipOrigin}
 * - openDuration: ${values.openDuration}
 * - closeDuration: ${values.closeDuration}
 * - linkDuration: ${values.linkDuration}
 * - linkStagger: ${values.linkStagger}
 * - linkOffsetY: ${values.linkOffsetY}
 * - imageDuration: ${values.imageDuration}
 * - imageStagger: ${values.imageStagger}
 * - imageStartScale: ${values.imageStartScale}
 * - socialDuration: ${values.socialDuration}
 * - socialStagger: ${values.socialStagger}
 * - socialOffsetY: ${values.socialOffsetY}
 */

import ImmersiveFullscreenNav from "@/components/immersive-full-screen-navigation";

const navConfig = {
  overlayBg: "${values.overlayBg}",
  headerOpenColor: "${values.headerOpenColor}",
  clipOrigin: "${values.clipOrigin}",
  openDuration: ${values.openDuration},
  closeDuration: ${values.closeDuration},
};

const navContent = {
  linkDuration: ${values.linkDuration},
  linkStagger: ${values.linkStagger},
  linkOffsetY: ${values.linkOffsetY},
  imageDuration: ${values.imageDuration},
  imageStagger: ${values.imageStagger},
  imageStartScale: ${values.imageStartScale},
  socialDuration: ${values.socialDuration},
  socialStagger: ${values.socialStagger},
  socialOffsetY: ${values.socialOffsetY},
};

export default function ImmersiveFullscreenNavDemo() {
  return <ImmersiveFullscreenNav navConfig={navConfig} navContent={navContent} />;
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
      <ImmersiveFullscreenNav
        navConfig={{
          overlayBg: controls.overlayBg,
          headerOpenColor: controls.headerOpenColor,
          clipOrigin: controls.clipOrigin,
          openDuration: controls.openDuration,
          closeDuration: controls.closeDuration,
        }}
        navContent={{
          linkDuration: controls.linkDuration,
          linkStagger: controls.linkStagger,
          linkOffsetY: controls.linkOffsetY,
          imageDuration: controls.imageDuration,
          imageStagger: controls.imageStagger,
          imageStartScale: controls.imageStartScale,
          socialDuration: controls.socialDuration,
          socialStagger: controls.socialStagger,
          socialOffsetY: controls.socialOffsetY,
        }}
      />

      <main className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
        <div className="max-w-5xl mx-auto text-center text-black">
          <h1 className="text-[7vw] max-md:w-[90%] max-md:mx-auto max-sm:text-[9vw]">
            Immersive Full Screen Navigation
          </h1>

          <p className="mt-8 text-[1.4vw] max-sm:text-[4.5vw] max-md:text-[3vw]">
            Click on the hamburger to open the navigation
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-sm:text-[4.5vw] max-md:text-[3vw]">
            <button className=" rounded-full max-sm:min-w-[45vw] bg-black text-white font-medium ">
              <Link href={"/effects/navigation/immersive-full-screen-nav"} className="px-7 py-3 block w-full">
                Get Started
              </Link>
            </button>

            <button className=" rounded-full max-sm:min-w-[45vw] border border-black ">
              <Link href={"/effects"} className="px-7 py-3 block w-full">
                Explore Platform
              </Link>
            </button>
          </div>
        </div>
      </main>

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
              onCopyCode={() => buildImmersiveFullscreenNavCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="overlay"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
