import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-perspective-slider");
}

export default function Page() {
  return <DemoContent />;
}
