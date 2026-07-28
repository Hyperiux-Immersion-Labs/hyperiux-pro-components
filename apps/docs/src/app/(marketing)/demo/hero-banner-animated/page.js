import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/hero-banner-animated/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="hero-banner-animated" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("hero-banner-animated");
}
