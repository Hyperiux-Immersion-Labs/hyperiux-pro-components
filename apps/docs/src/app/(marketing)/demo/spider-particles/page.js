import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("spider-particles");
}

export default function Page() {
  return <DemoContent />;
}
