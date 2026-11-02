import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import arcLightRegistry from "../../../../../../../registry/effects/backgrounds/arc-light/registry.json";

export default function Page() {
  return <DemoContent registry={arcLightRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("arc-light");
}
