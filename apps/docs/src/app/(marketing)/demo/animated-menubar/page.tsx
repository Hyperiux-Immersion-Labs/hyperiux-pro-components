import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedMenubarRegistry from "../../../../../../../registry/effects/components/animated-menubar/registry.json";

export default function Page() {
  return <DemoContent registry={animatedMenubarRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-menubar");
}
