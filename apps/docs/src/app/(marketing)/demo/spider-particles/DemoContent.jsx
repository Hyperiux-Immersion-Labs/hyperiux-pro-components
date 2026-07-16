"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerPanel from "@/components/ui/RemixerPanel";
import remixerStyles from "@/components/ui/remixer-panel.module.css";
import SpiderParticles from "@/components/spider-particles";

const defaultControls = {
  particleCount: 180,
  gridGap: 0,
  particleSize: 20,
  mouseConnectDist: 160,
  spotlightRadius: 300,
  particleColor: "#ffffff",
  lerpSpeed: 0.1,
  fadeSpeed: 0.04,
  showWeb: true,
};

const controlGroups = [
  {
    id: "density",
    title: "Density",
    controls: [
      {
        id: "particleCount",
        label: "Particle Count",
        type: "range",
        min: 20,
        max: 1200,
        step: 1,
        description: "Controls how many particles are drawn.",
      },
      {
        id: "gridGap",
        label: "Grid Gap",
        type: "range",
        min: 0,
        max: 80,
        step: 1,
        description: "Switches to a spaced lattice when above zero.",
      },
      {
        id: "particleSize",
        label: "Particle Size",
        type: "range",
        min: 1,
        max: 60,
        step: 0.5,
        description: "Makes each dot larger or smaller.",
      },
    ],
  },
  {
    id: "interaction",
    title: "Interactions",
    controls: [
      {
        id: "mouseConnectDist",
        label: "Mouse Connect Dist",
        type: "range",
        min: 10,
        max: 500,
        step: 1,
        description: "Sets the web connection radius around the cursor.",
      },
      {
        id: "spotlightRadius",
        label: "Spotlight Radius",
        type: "range",
        min: 20,
        max: 700,
        step: 1,
        description: "Controls the cursor spotlight falloff.",
      },
      {
        id: "lerpSpeed",
        label: "Lerp / Smooth",
        type: "range",
        min: 0.01,
        max: 0.5,
        step: 0.01,
        description: "Adjusts how quickly the mouse follows.",
      },
      {
        id: "fadeSpeed",
        label: "Fade Speed",
        type: "range",
        min: 0.005,
        max: 0.2,
        step: 0.005,
        description: "Controls how fast the effect fades in and out.",
      },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    controls: [
      {
        id: "particleColor",
        label: "Particle Color",
        type: "color",
        description: "Colors the particles, web lines, and center dot.",
      },
      {
        id: "showWeb",
        label: "Show Web",
        type: "checkbox",
        description: "Turns the connection lines on or off.",
      },
    ],
  },
];

function buildSpiderParticlesCode(values) {
  return `/**
 * Spider Particles remixer changes:
 * - particleCount: ${values.particleCount}
 * - gridGap: ${values.gridGap}
 * - particleSize: ${values.particleSize}
 * - mouseConnectDist: ${values.mouseConnectDist}
 * - spotlightRadius: ${values.spotlightRadius}
 * - particleColor: ${values.particleColor}
 * - lerpSpeed: ${values.lerpSpeed}
 * - fadeSpeed: ${values.fadeSpeed}
 * - showWeb: ${values.showWeb}
 */

"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SpiderParticles from "@/components/spider-particles";

const spiderParticlesProps = {
  particleCount: ${values.particleCount},
  gridGap: ${values.gridGap},
  particleSize: ${values.particleSize},
  mouseConnectDist: ${values.mouseConnectDist},
  spotlightRadius: ${values.spotlightRadius},
  particleColor: "${values.particleColor}",
  lerpSpeed: ${values.lerpSpeed},
  fadeSpeed: ${values.fadeSpeed},
  showWeb: ${values.showWeb},
};

export default function SpiderParticlesDemo() {
  return (
    <div className="relative min-h-screen bg-black">
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <SpiderParticles {...spiderParticlesProps} />
    </div>
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
    <div className="relative min-h-screen bg-black">
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />

      <SpiderParticles
        particleCount={controls.particleCount}
        gridGap={controls.gridGap}
        particleSize={controls.particleSize}
        mouseConnectDist={controls.mouseConnectDist}
        spotlightRadius={controls.spotlightRadius}
        particleColor={controls.particleColor}
        lerpSpeed={controls.lerpSpeed}
        fadeSpeed={controls.fadeSpeed}
        showWeb={controls.showWeb}
      />

      <div className="pointer-events-none absolute inset-0 z-40 hidden xl:block">
        <button
          type="button"
          onClick={() => setIsPanelExpanded((current) => !current)}
          className={`${remixerStyles.footerButton} pointer-events-auto z-50 w-auto flex-none px-4`}
          style={{
            position: "absolute",
            right: "1rem",
            top: "78px",
            flex: "none",
            background: "rgba(18, 18, 20, 0.96)",
            borderColor: "rgba(255, 255, 255, 0.14)",
          }}
        >
          <PanelLeft
            className={`${remixerStyles.actionIcon} transition-transform duration-300 ${
              isPanelExpanded ? "" : "scale-x-[-1]"
            }`}
          />
          <span className={remixerStyles.footerButtonText}>Controls</span>
        </button>

        <div
          className={`pointer-events-auto absolute right-0 top-[132px] h-[calc(100%-132px)] w-[344px] bg-[rgba(30,30,34,0.98)] shadow-[-24px_0_80px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out ${
            isPanelExpanded ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="h-full p-4">
            <RemixerPanel
              isExpanded={isPanelExpanded}
              groups={controlGroups}
              values={controls}
              onChange={updateControl}
              onCopyCode={() => buildSpiderParticlesCode(controls)}
              onReset={resetControls}
              defaultOpenGroupId="density"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
