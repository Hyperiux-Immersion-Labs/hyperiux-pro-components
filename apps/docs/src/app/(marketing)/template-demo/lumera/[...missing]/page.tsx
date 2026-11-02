// Built using Hyperiux Vault: https://vault.hyperiux.com
import { notFound } from "next/navigation";

export const metadata = {
  title: "Page not found | Lumera Heights",
  description: "This address isn't on our map. Head back to Lumera Heights to explore luxury residences in Dubai.",
};

// Any URL the template doesn't know lands here and shows ../not-found.tsx
const page = () => notFound();

export default page;
