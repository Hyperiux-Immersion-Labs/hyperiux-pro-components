"use client";

import { VariableTextProximityDemo } from "@/components/variable-text-proximity";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

const variableTextProximityDemoRegistry = {
  name: "variable-text-proximity-demo",
  title: "Variable Text Proximity",
  props: [
    {
      name: "radius",
      type: "number",
      default: 100,
      description: "Pointer influence radius.",
      remixer: {
        control: "range",
        group: "motion",
        groupTitle: "Motion",
        min: 24,
        max: 240,
        step: 1,
      },
    },
    {
      name: "falloff",
      type: "string",
      default: "linear",
      description: "How quickly the font variation fades with distance.",
      remixer: {
        control: "select",
        group: "motion",
        groupTitle: "Motion",
        options: [
          { value: "linear", label: "Linear" },
          { value: "exponential", label: "Exponential" },
          { value: "gaussian", label: "Gaussian" },
        ],
      },
    },
    {
      name: "baseWeight",
      type: "number",
      default: 300,
      description: "Font weight away from the pointer.",
      remixer: {
        control: "range",
        group: "motion",
        groupTitle: "Motion",
        min: 100,
        max: 900,
        step: 10,
      },
    },
    {
      name: "hoverWeight",
      type: "number",
      default: 800,
      description: "Font weight nearest the pointer.",
      remixer: {
        control: "range",
        group: "motion",
        groupTitle: "Motion",
        min: 100,
        max: 1000,
        step: 10,
      },
    },
    {
      name: "baseOpticalSize",
      type: "number",
      default: 9,
      description: "Optical size away from the pointer.",
      remixer: {
        control: "range",
        group: "motion",
        groupTitle: "Motion",
        min: 8,
        max: 80,
        step: 1,
      },
    },
    {
      name: "hoverOpticalSize",
      type: "number",
      default: 40,
      description: "Optical size nearest the pointer.",
      remixer: {
        control: "range",
        group: "motion",
        groupTitle: "Motion",
        min: 8,
        max: 144,
        step: 1,
      },
    },
    {
      name: "backgroundColor",
      type: "string",
      default: "#080808",
      description: "Demo background color.",
      remixer: {
        control: "color",
        group: "colors",
        groupTitle: "Colors",
      },
    },
    {
      name: "textColor",
      type: "string",
      default: "#000000",
      description: "Text color.",
      remixer: {
        control: "color",
        group: "colors",
        groupTitle: "Colors",
      },
    },
    {
      name: "fontSize",
      type: "number",
      default: 55,
      description: "Paragraph font size in pixels.",
      remixer: {
        control: "range",
        group: "type",
        groupTitle: "Type",
        min: 24,
        max: 88,
        step: 1,
      },
    },
    {
      name: "lineHeight",
      type: "number",
      default: 1.18,
      description: "Paragraph line height.",
      remixer: {
        control: "range",
        group: "type",
        groupTitle: "Type",
        min: 0.9,
        max: 1.7,
        step: 0.01,
      },
    },
    {
      name: "maxWidth",
      type: "number",
      default: 1040,
      description: "Maximum paragraph width in pixels.",
      remixer: {
        control: "range",
        group: "type",
        groupTitle: "Type",
        min: 520,
        max: 1320,
        step: 10,
      },
    },
    {
      name: "minWidth",
      type: "number",
      default: 920,
      description: "Minimum paragraph width in pixels.",
      remixer: {
        control: "range",
        group: "type",
        groupTitle: "Type",
        min: 420,
        max: 1320,
        step: 10,
      },
    },
    {
      name: "italic",
      type: "boolean",
      default: false,
      description: "Slant nearby letters toward italic on pointer proximity.",
      remixer: {
        control: "checkbox",
        group: "type",
        groupTitle: "Type",
      },
    },
  ],
  remixer: {
    enabled: true,
    defaultOpenGroupId: "motion",
    layout: {
      buttonClassName: "right-4! top-25!",
      panelClassName: "right-0! top-[132px]! h-[calc(100%-132px)]! w-[344px]!",
    },
    copyCode: {
      includeOnlyPublicProps: true,
    },
  },
};

export default function Page() {
  return (
    <RegistryRemixerDemo
      registry={variableTextProximityDemoRegistry}
      render={(values) => <VariableTextProximityDemo {...values} />}
      copyCodeOptions={{ propsVariableName: "variableTextProximityProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
