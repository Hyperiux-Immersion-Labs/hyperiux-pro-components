import React from "react";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import DocsInstallation from "./DocsInstallation";

export const metadata = createPageMetadata({
  title: "Hyperiux Vault Installation Guide for React & Next.js",
  description: "Install Hyperiux Vault effects with the CLI or manually. Add editable source files, manage dependencies, and ship creative interactions in React or Next.js.",
  path: "/docs/installation",
});

export default function Page() {
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/docs/installation" />
      <DocsInstallation />
    </>
  );
}
