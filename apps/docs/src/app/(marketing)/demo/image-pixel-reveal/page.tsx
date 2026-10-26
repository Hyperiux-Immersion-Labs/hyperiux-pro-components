import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/image-pixel-reveal/registry.json";

export default function Page() {
  return <DemoContent registry={registry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("image-pixel-reveal");
}
