import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import asciiDomeRegistry from "../../../../../../../registry/effects/backgrounds/ascii-dome/registry.json";

export default function Page() {
  return <DemoContent registry={asciiDomeRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("ascii-dome");
}
