import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/video-player/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="video-player" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("video-player");
}
