import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import flowerFieldRegistry from "../../../../../../../registry/effects/backgrounds/flower-field/registry.json";

export default function Page() {
  return <DemoContent registry={flowerFieldRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("flower-field");
}
