// Built using Hyperiux Vault: https://vault.hyperiux.com
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page not found | Veyra",
  description: "This page could not be found. Head back to Veyra.",
};

const page = () => notFound();

export default page;
