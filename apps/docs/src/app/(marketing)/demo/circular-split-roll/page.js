import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./_DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("circular-split-roll");
}

export default function Page() {
  return <DemoContent />;
}
