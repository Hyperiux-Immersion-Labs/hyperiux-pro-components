import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page not found | Elena Voss",
  description: "This page didn't make the final cut. Head back to the Elena Voss portfolio.",
};

// Any URL the template doesn't know lands here and shows ../not-found.tsx
const page = () => notFound();

export default page;
