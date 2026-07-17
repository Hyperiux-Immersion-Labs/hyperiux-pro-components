import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("immersive-full-screen-nav");
}

export default function Page() {
  return <DemoContent />;
}
