import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/3d-portfolio-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="3d-portfolio-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("3d-portfolio-slider");
}
