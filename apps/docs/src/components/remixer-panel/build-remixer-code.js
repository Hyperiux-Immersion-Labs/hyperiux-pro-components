"use client";

import { getCopyableRemixerValues } from "./remixer-utils";

export function buildRemixerDemoCode({
  registry,
  values,
  groups,
  componentName,
  importPath,
  propsVariableName,
  wrapperClassName = "relative min-h-screen bg-black",
  includeDemoHeader = true,
}) {
  const name = componentName ?? registry?.exportName ?? toPascalCase(registry?.name ?? "Effect");
  const resolvedImportPath = importPath ?? registry?.importPath ?? `@/components/effects/${registry?.name}`;
  const variableName = propsVariableName ?? `${toCamelCase(name)}Props`;
  const copyableValues = getCopyableRemixerValues(values, groups);
  const propEntries = Object.entries(copyableValues);
  const propComments = propEntries
    .map(([key, value]) => ` * - ${key}: ${String(value)}`)
    .join("\n");
  const propLines = propEntries
    .map(([key, value]) => `  ${key}: ${formatCodeValue(value)},`)
    .join("\n");
  const demoHeaderImport = includeDemoHeader
    ? 'import DemoHeader from "@/components/WebsiteComps/DemoHeader";\n'
    : "";
  const demoHeader = includeDemoHeader
    ? '      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />\n'
    : "";

  return `/**
 * ${registry?.title ?? name} remixer changes:
${propComments}
 */

"use client";

${demoHeaderImport}import ${name} from "${resolvedImportPath}";

const ${variableName} = {
${propLines}
};

export default function ${name}Demo() {
  return (
    <div className="${wrapperClassName}">
${demoHeader}      <${name} {...${variableName}} />
    </div>
  );
}`;
}

function formatCodeValue(value) {
  return JSON.stringify(value);
}

function toCamelCase(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function toPascalCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
