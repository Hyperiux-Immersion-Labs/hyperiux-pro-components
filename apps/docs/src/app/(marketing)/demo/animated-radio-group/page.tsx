import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedRadioGroupRegistry from "../../../../../../../registry/effects/components/animated-radio-group/registry.json";

export default function Page() {
  return <DemoContent registry={animatedRadioGroupRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-radio-group");
}
