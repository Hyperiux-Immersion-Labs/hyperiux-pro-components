import { describe, it, expect } from "vitest";
import { buildEffectAiPrompt, findRemoteImageHosts } from "./effect-ai-prompt";

const R2 = "pub-8abee449136941f5b0a1cd2c014534e9.r2.dev";

const effect = {
  name: "link-button",
  title: "Link Button",
  description: "Animated underline link.",
  exportName: "LinkButton",
  exportKind: "default",
  dependencies: ["lucide-react"],
  props: [
    { name: "btnText", type: "string", default: "Hover me", description: "Button label | text." },
    { name: "showIcon", type: "boolean", default: true, description: "Show the arrow." },
  ],
};
const source = `"use client";\nexport default function LinkButton() { return null; }\n`;

describe("buildEffectAiPrompt", () => {
  const prompt = buildEffectAiPrompt({ effect, source });

  it("targets the same path the CLI and MCP install to", () => {
    expect(prompt).toContain("src/components/effects/link-button/index.tsx");
  });

  it("includes the full source verbatim", () => {
    expect(prompt).toContain(source.trimEnd());
  });

  it("lists dependencies as an install command", () => {
    expect(prompt).toContain("npm install lucide-react");
  });

  it("uses a default import for default exports and a named import otherwise", () => {
    expect(prompt).toContain('import LinkButton from "@/components/effects/link-button";');
    const named = buildEffectAiPrompt({ effect: { ...effect, exportKind: "named" }, source });
    expect(named).toContain('import { LinkButton } from "@/components/effects/link-button";');
  });

  it("renders a props table with escaped pipes", () => {
    expect(prompt).toContain('| `btnText` | `string` | `"Hover me"` | Button label \\| text. |');
    expect(prompt).toContain("| `showIcon` | `boolean` | `true` | Show the arrow. |");
  });

  it("says no packages are needed when there are no dependencies", () => {
    const none = buildEffectAiPrompt({ effect: { ...effect, dependencies: [] }, source });
    expect(none).toContain("No extra npm packages are needed.");
    expect(none).not.toContain("npm install");
  });

  it("adds the remote image config only when the effect needs it", () => {
    expect(prompt).not.toContain("remotePatterns");
    const withImages = buildEffectAiPrompt({
      effect,
      source: `import Image from "next/image";\nconst src = "https://${R2}/a.jpg";`,
    });
    expect(withImages).toContain(`{ protocol: "https", hostname: "${R2}" }`);
  });
});

describe("findRemoteImageHosts", () => {
  it("ignores links and files without next/image", () => {
    expect(findRemoteImageHosts(`const a = "https://${R2}/a.jpg";`)).toEqual([]);
    expect(findRemoteImageHosts(`import Image from "next/image";\n<a href="https://vault.hyperiux.com/x" />`)).toEqual([]);
  });
});
