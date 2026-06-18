import React from "react";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import DocsIntro from "./DocsIntro";

export const metadata = createPageMetadata({
  title: "Hyperiux Vault: Creative React & Next.js Effects",
  description: "Explore Hyperiux Vault, a source-first library of scroll effects, cursors, text animations, WebGL scenes, and microinteractions for React and Next.js.",
  path: "/docs",
});

export default function Page() {
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/docs" />
      <DocsIntro />
    </>
  );
}
