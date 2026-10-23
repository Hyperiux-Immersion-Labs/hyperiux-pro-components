import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedAttachmentRegistry from "../../../../../../../registry/effects/components/animated-attachment/registry.json";

export default function Page() {
  return <DemoContent registry={animatedAttachmentRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-attachment");
}
