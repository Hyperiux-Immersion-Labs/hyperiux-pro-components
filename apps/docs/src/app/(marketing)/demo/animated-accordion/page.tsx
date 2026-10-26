import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedAccordionRegistry from "./registry.json";

export default function Page() {
  return <DemoContent registry={animatedAccordionRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-accordion");
}
