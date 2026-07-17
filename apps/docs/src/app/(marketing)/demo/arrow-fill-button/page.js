import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("arrow-fill-button");
}

export default function Page() {
  return <DemoContent />;
}
