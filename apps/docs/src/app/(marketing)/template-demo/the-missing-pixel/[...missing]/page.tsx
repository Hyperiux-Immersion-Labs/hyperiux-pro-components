// Built using Hyperiux Vault: https://vault.hyperiux.com
import { notFound } from "next/navigation";
import { pageMetadata } from "../metadata";

export const metadata = pageMetadata(
  "Page not found | The Missing Pixel",
  "This page went missing. Head back home or find the missing pixel.",
);

// Any URL the template doesn't know lands here and shows ../not-found.tsx inside the template layout
const page = () => notFound();

export default page;
