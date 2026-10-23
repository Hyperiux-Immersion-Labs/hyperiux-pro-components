import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedButtonRegistry from "../../../../../../../registry/effects/components/animated-button/registry.json";

export default function Page() {
  return <DemoContent registry={animatedButtonRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-button");
}
