import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import opalFlowRegistry from "../../../../../../../registry/effects/backgrounds/opal-flow/registry.json";

export default function Page() {
  return <DemoContent registry={opalFlowRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("opal-flow");
}
