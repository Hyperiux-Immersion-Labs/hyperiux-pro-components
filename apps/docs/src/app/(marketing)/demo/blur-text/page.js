import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./_DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("blur-text");
}

export default function Page() {
  return <DemoContent />;
}
