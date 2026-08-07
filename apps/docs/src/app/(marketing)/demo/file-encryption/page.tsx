import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/file-encryption/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="file-encryption" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("file-encryption");
}
