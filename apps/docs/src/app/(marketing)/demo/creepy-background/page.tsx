import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import creepyBackgroundRegistry from "../../../../../../../registry/effects/backgrounds/creepy-background/registry.json";

export default function Page() {
  return <DemoContent registry={creepyBackgroundRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("creepy-background");
}
