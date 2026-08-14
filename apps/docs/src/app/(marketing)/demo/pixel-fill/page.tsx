import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import pixelFillRegistry from "../../../../../../../registry/effects/text/pixel-fill/registry.json";

export default function Page() {
  return <DemoContent registry={pixelFillRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("pixel-fill");
}
