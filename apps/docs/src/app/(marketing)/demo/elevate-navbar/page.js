import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("elevate-navbar");
}

export default function Page() {
  return <DemoContent />;
}
