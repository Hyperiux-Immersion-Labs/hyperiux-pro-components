import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
// .draft.json, not .json - keeps this demo working from real component code
// while excluding it from apps/docs/scripts/build-registry.js's folder scan
// (which only picks up files literally named registry.json), so it isn't
// listed/installable/counted anywhere until the effect is actually finished.
import registry from "../../../../../../../registry/effects/backgrounds/dotted-trail/registry.draft.json";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DottedTrailDemoPage() {
  return (
    <>
   <DemoHeader/>
    <DemoContent registry={registry} />
    </>
  )
  
}

export async function generateMetadata() {
  return getDemoPageMetadata("dotted-trail");
}
