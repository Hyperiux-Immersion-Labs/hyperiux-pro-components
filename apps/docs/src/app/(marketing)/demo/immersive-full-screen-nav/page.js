import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import immersiveFullscreenNavRegistry from "../../../../../../../registry/effects/navigation/immersive-full-screen-nav/registry.json";

export default function Page() {
  return <DemoContent registry={immersiveFullscreenNavRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("immersive-full-screen-nav");
}
