import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedDataTableRegistry from "../../../../../../../registry/effects/components/animated-data-table/registry.json";

export default function Page() {
  return <DemoContent registry={animatedDataTableRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-data-table");
}
