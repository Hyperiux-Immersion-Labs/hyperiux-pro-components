import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import asciiBandRegistry from "../../../../../../../registry/effects/backgrounds/ascii-band/registry.json";

export default function Page() {
  return <DemoContent registry={asciiBandRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("ascii-band");
}
