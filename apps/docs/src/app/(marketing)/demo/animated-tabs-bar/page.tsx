import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedTabsBarRegistry from "./registry.json";

export default function Page() {
  return <DemoContent registry={animatedTabsBarRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-tabs-bar");
}
