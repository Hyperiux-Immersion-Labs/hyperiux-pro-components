import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedCommandMenuRegistry from "../../../../../../../registry/effects/components/animated-command-menu/registry.json";

export default function Page() {
  return <DemoContent registry={animatedCommandMenuRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-command-menu");
}
