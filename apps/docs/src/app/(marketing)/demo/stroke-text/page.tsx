import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import strokeTextRegistry from "../../../../../../../registry/effects/text/stroke-text/registry.json";

export default function Page() {
  return <DemoContent registry={strokeTextRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("stroke-text");
}
