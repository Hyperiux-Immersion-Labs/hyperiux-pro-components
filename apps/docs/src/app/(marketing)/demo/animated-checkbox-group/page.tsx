import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedCheckboxGroupRegistry from "../../../../../../../registry/effects/components/animated-checkbox-group/registry.json";

export default function Page() {
  return <DemoContent registry={animatedCheckboxGroupRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-checkbox-group");
}
