import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/book-flip/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="book-flip" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("book-flip");
}
