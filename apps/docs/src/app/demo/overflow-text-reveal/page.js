import OverflowTextRevealWrapper from "./OverflowTextRevealWrapper";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return <OverflowTextRevealWrapper />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("overflow-text-reveal");
}
