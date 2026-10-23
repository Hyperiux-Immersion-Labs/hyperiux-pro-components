import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedSwitchRegistry from "../../../../../../../registry/effects/components/animated-switch/registry.json";

export default function Page() {
  return <DemoContent registry={animatedSwitchRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-switch");
}
