import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/loaders/lines-loader/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="lines-loader" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("lines-loader");
}
