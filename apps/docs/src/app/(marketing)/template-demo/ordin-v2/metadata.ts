// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { Metadata } from "next";
import ogImage from "./assets/ordin-og.jpg";

export const pageMetadata = (title: string, description: string, slug = ""): Metadata => ({
  title,
  description,
  alternates: { canonical: `https://vault.hyperiux.com/templates/ordin-v2${slug}` },
  openGraph: {
    title,
    description,
    images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height }],
  },
  twitter: { card: "summary_large_image", title, description, images: [ogImage.src] },
});
