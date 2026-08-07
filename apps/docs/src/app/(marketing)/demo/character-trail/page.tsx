import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/character-trail/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="character-trail" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("character-trail");
}
