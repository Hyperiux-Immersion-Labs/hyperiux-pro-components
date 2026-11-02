// Built using Hyperiux Vault: https://vault.hyperiux.com
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page not found | Kyntra",
  description:
    "Nothing needs fixing here. This page has moved out, so head back home to Kyntra.",
};

// Any URL the template doesn't know lands here and shows ../not-found.tsx
const page = () => notFound();

export default page;
