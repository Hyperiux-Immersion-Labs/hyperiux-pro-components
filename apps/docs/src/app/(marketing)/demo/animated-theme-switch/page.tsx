import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedThemeSwitchRegistry from "../../../../../../../registry/effects/components/animated-theme-switch/registry.json";

export default function Page() {
  return <DemoContent registry={animatedThemeSwitchRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-theme-switch");
}
