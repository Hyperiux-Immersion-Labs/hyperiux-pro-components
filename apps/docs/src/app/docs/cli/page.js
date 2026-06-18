import React from "react";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import DocsCli from "./DocsCli";

export const metadata = createPageMetadata({
  title: "Hyperiux Vault CLI: Add, Upgrade, and Manage Effects",
  description: "Use the Hyperiux Vault CLI to initialize projects, add effects, run doctor checks, manage dependencies, and keep creative frontend code editable.",
  path: "/docs/cli",
});

export default function Page() {
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/docs/cli" />
      <React.Suspense fallback={null}>
        <DocsCli />
      </React.Suspense>
    </>
  );
}
