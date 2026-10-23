import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedSliderRegistry from "../../../../../../../registry/effects/components/animated-slider/registry.json";

export default function Page() {
  return <DemoContent registry={animatedSliderRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-slider");
}
