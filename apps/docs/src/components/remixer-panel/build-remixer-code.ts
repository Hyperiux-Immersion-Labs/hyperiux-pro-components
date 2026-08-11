"use client";

import { getCopyableRemixerValues } from "./remixer-utils";
import type { RemixerGroup, RemixerValues } from "./types";

interface BuildRemixerDemoCodeArgs {
  values: RemixerValues;
  initialValues: RemixerValues;
  groups: RemixerGroup[];
  propsVariableName?: string;
  [key: string]: unknown;
}

export function buildRemixerDemoCode({
  values,
  initialValues: _initialValues,
  groups,
  propsVariableName = "props",
}: BuildRemixerDemoCodeArgs) {
  const copyableValues = getCopyableRemixerValues(values, groups);
  const entries = Object.entries(copyableValues);
  const propLines = entries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`).join("\n");

  if (!entries.length) return `const ${propsVariableName} = {};`;
  return `const ${propsVariableName} = {
${propLines}
};`;
}
