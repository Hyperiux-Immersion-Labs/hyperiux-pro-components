import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedSkeletonRegistry from "../../../../../../../registry/effects/components/animated-skeleton/registry.json";

export default function Page() {
  return <DemoContent registry={animatedSkeletonRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-skeleton");
}
