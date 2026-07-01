import StackLoader from "@/components/stack-loader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return <StackLoader />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("stack-loader");
}
