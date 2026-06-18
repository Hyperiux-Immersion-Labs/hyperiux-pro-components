import React from "react";
import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import DocsLicense from "./DocsLicense";

export const metadata = createPageMetadata({
  title: "Hyperiux Vault License: Usage, Pro Terms, and Limits",
  description: "Learn how Hyperiux Vault licensing works for Free Core and Pro effects, including client work, SaaS use, source edits, redistribution, and template limits.",
  path: "/docs/license",
});

export default function Page() {
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/docs/license" />
      <DocsLicense />
    </>
  );
}
