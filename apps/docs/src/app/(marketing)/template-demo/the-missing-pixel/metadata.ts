// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { Metadata } from "next";
import ogImage from "./assets/missing-pixel-og.jpg";

export const pageMetadata = (
  title: string,
  description: string,
  slug = "",
): Metadata => ({
  title,
  description,
  alternates: {
    canonical: `https://vault.hyperiux.com/templates/the-missing-pixel${slug}`,
  },
  openGraph: {
    title,
    description,
    images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.src],
  },
});
