import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedTooltipRegistry from "../../../../../../../registry/effects/components/animated-tooltip/registry.json";

export default function Page() {
  return <DemoContent registry={animatedTooltipRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-tooltip");
}
