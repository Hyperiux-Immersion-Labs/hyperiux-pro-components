"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";

const panelTransition = { duration: 0.6, ease: [0.62, 0.05, 0.01, 0.99] };

const defaultControls = {
  allowMultiple: false,
  duration: 0.5,
  showIcon: true,
  iconPosition: "right",
  iconMode: "rotate",
};

const controlGroups = [
  {
    id: "behavior",
    title: "Behavior",
    controls: [
      {
        id: "allowMultiple",
        label: "Allow Multiple",
        type: "checkbox",
        description: "Lets more than one answer stay open at once.",
      },
      {
        id: "duration",
        label: "Duration",
        type: "range",
        min: 0.1,
        max: 1.5,
        step: 0.05,
        description: "Sets how long each answer takes to open and close.",
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
        description: "Turns the chevron on the trigger on or off.",
      },
      {
        id: "iconPosition",
        label: "Icon Position",
        type: "select",
        options: [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ],
        description: "Chooses which side the chevron sits on.",
      },
      {
        id: "iconMode",
        label: "Icon Mode",
        type: "select",
        options: [
          { value: "rotate", label: "Rotate Down" },
          { value: "rotate-left-down", label: "Rotate Right" },
        ],
        description: "Switches how the chevron rotates when open.",
      },
    ],
  },
];

function buildAnimatedFaqCode(values) {
  return `/**
 * Animated FAQ remixer changes:
 * - allowMultiple: ${values.allowMultiple}
 * - duration: ${values.duration}
 * - showIcon: ${values.showIcon}
 * - iconPosition: ${values.iconPosition}
 * - iconMode: ${values.iconMode}
 */

import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";

export default function AnimatedFaqDemo() {
  return (
    <FAQGroup allowMultiple={${values.allowMultiple}} defaultOpenItems={["faq-1"]}>
      {faqItems.map((item) => (
        <FAQWrapper
          key={item.id}
          itemId={item.id}
          className="rounded-md border border-white/20 px-6 py-5"
          titleClassName="text-[1.1rem] font-medium text-white"
          iconSize={16}
          iconStrokeWidth={2}
          duration={${values.duration}}
        >
          <FAQTitle
            className="pb-0"
            showIcon={${values.showIcon}}
            iconPosition="${values.iconPosition}"
            iconMode="${values.iconMode}"
          >
            {item.title}
          </FAQTitle>

          <FAQContent className="pt-4 text-neutral-400">
            {item.content}
          </FAQContent>
        </FAQWrapper>
      ))}
    </FAQGroup>
  );
}`;
}

const faqItems = [
  {
    id: "faq-1",
    title: "What makes this FAQ package more reusable?",
    content: (
      <>
        You are no longer locked into a plain data object. You can pass rich
        JSX, custom markup, inline links, badges, icons, or even other
        components inside the title and content.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-2",
    title: "Can I put custom content inside the answer?",
    content: (
      <div className="space-y-3">
        <p>Yes. This content area accepts full React nodes, not just text.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Paragraphs</li>
          <li>Lists</li>
          <li>Buttons</li>
          <li>Inline links</li>
        </ul>
      </div>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-3",
    title: "Does it use the ChevronBird trigger?",
    content: (
      <>
        Yes. The open and close state is visually driven by ChevronBird, so your
        motion language stays consistent across the whole system.
      </>
    ),
    defaultOpen: false,
  },
];

const defaultOpenItems = faqItems
  .filter((item) => item.defaultOpen)
  .map((item) => item.id);

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

      <section className="bg-black h-screen px-8 py-20 text-white">
        <div className="max-w-5xl mx-auto text-center text-white mb-12">
          <h1 className="text-[5.5vw] max-sm:text-[11vw] max-md:text-[8vw]">
            Animated Faq
          </h1>

          <p className="mt-8 text-[1.2vw] max-sm:text-[4.5vw] max-md:mt-4 max-md:text-[3vw]">
            Click on the FAQ triggers
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-4">
          <FAQGroup
            allowMultiple={controls.allowMultiple}
            defaultOpenItems={defaultOpenItems}
          >
            {faqItems.map((item) => (
              <FAQWrapper
                key={item.id}
                itemId={item.id}
                className="rounded-md border border-white/20 px-6 py-5"
                titleClassName="text-[1.1rem] font-medium text-white"
                iconSize={16}
                iconStrokeWidth={2}
                duration={controls.duration}
              >
                <FAQTitle
                  className="pb-0"
                  showIcon={controls.showIcon}
                  iconPosition={controls.iconPosition}
                  iconMode={controls.iconMode}
                >
                  {item.title}
                </FAQTitle>

                <FAQContent className="pt-4 text-neutral-400">
                  {item.content}
                </FAQContent>
              </FAQWrapper>
            ))}
          </FAQGroup>
        </div>
      </section>

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
              onCopyCode={() => buildAnimatedFaqCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="behavior"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
