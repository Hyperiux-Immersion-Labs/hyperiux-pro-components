import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import auroraRibbonRegistry from "../../../../../../../registry/effects/backgrounds/aurora-ribbon/registry.json";

export default function Page() {
  return <DemoContent registry={auroraRibbonRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("aurora-ribbon");
}
