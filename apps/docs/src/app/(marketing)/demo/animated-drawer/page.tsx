import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedDrawerRegistry from "../../../../../../../registry/effects/components/animated-drawer/registry.json";

export default function Page() {
  return <DemoContent registry={animatedDrawerRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-drawer");
}
