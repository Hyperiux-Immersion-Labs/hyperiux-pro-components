import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedSidebarRegistry from "../../../../../../../registry/effects/components/animated-sidebar/registry.json";

export default function Page() {
  return <DemoContent registry={animatedSidebarRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-sidebar");
}
