import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import neonStreakRegistry from "../../../../../../../registry/effects/backgrounds/neon-streak/registry.json";

export default function Page() {
  return <DemoContent registry={neonStreakRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("neon-streak");
}
