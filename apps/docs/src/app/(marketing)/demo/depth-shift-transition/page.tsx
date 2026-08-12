import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export default function Page() {
  return <DemoContent />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("depth-shift-transition");
}
