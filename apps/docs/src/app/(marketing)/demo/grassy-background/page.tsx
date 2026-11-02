import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import grassyBackgroundRegistry from "../../../../../../../registry/effects/backgrounds/grassy-background/registry.json";

export default function Page() {
  return <DemoContent registry={grassyBackgroundRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("grassy-background");
}
