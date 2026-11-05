// Built using Hyperiux Vault: https://vault.hyperiux.com
import { notFound } from "next/navigation";
import { pageMetadata } from "../metadata";

export const metadata = pageMetadata("Page not found | Ordin", "This page does not exist. Head back home or talk to the team.");

// Any URL the template doesn't know lands here and shows ../not-found.tsx inside the template layout
const page = () => notFound();

export default page;
