import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedDatePickerRegistry from "../../../../../../../registry/effects/components/animated-date-picker/registry.json";

export default function Page() {
  return <DemoContent registry={animatedDatePickerRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-date-picker");
}
