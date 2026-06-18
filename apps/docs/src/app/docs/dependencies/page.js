import React from "react";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import DocsDependencies from "./DocsDependencies";

export const metadata = createPageMetadata({
  title: "Hyperiux Vault Dependencies for Motion and WebGL Effects",
  description: "Understand how Hyperiux Vault handles per-effect dependencies for React, Next.js, Tailwind, GSAP, Motion, Three.js, WebGL, and canvas effects.",
  path: "/docs/dependencies",
});

export default function Page() {
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/docs/dependencies" />
      <DocsDependencies />
    </>
  );
}
