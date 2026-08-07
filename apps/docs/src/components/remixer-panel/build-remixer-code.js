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
  const componentImport =
    registry?.exportKind === "named"
      ? `import { ${name} } from "${resolvedImportPath}";`
      : `import ${name} from "${resolvedImportPath}";`;
  const variableName = propsVariableName ?? `${toCamelCase(name)}Props`;
  const copyableValues = getCopyableRemixerValues(values, groups);
  const entries = Object.entries(copyableValues);
  const comments = entries.map(([key, value]) => ` * - ${key}: ${String(value)}`).join("\n");
  const propLines = entries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`).join("\n");
  const headerImport = includeDemoHeader ? 'import DemoHeader from "@/components/WebsiteComps/DemoHeader";\n' : "";
  const header = includeDemoHeader ? '      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />\n' : "";

  return `/**
 * ${registry?.title ?? name} remixer changes:
${comments}
 */

"use client";

${headerImport}${componentImport}

const ${variableName} = {
${propLines}
};

export default function ${name}Demo() {
  return (
    <div className="${wrapperClassName}">
${header}      <${name} {...${variableName}} />
    </div>
  );
}`;
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
