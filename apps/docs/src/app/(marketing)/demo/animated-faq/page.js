import { getDemoPageMetadata } from "@/lib/demo-metadata";
import DemoContent from "./DemoContent";

export async function generateMetadata() {
  return getDemoPageMetadata("animated-faq");
}

export default function Page() {
  return <DemoContent />;
}
