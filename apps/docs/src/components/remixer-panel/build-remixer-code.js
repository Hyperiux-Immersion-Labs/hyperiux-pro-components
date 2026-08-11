"use client";

import { getCopyableRemixerValues } from "./remixer-utils";

export function buildRemixerDemoCode({
  values,
  initialValues,
  groups,
  propsVariableName = "props",
}) {
  const copyableValues = getCopyableRemixerValues(values, groups);
  const entries = Object.entries(copyableValues);
  const propLines = entries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`).join("\n");

  if (!entries.length) return `const ${propsVariableName} = {};`;
  return `const ${propsVariableName} = {
${propLines}
};`;
}
