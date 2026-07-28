import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import overflowStaggerTextRegistry from "../../../../../../../registry/effects/text/overflow-stagger-text/registry.json";


const page = () => {
  return <DemoContent registry={overflowStaggerTextRegistry} />;
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("overflow-stagger-text");
}
