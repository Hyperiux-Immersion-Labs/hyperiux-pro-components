import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedHoverCardRegistry from "../../../../../../../registry/effects/components/animated-hover-card/registry.json";

export default function Page() {
  return <DemoContent registry={animatedHoverCardRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-hover-card");
}
