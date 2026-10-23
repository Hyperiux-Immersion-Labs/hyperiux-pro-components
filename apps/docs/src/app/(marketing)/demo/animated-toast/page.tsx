import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedToastRegistry from "../../../../../../../registry/effects/components/animated-toast/registry.json";

export default function Page() {
  return <DemoContent registry={animatedToastRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-toast");
}
