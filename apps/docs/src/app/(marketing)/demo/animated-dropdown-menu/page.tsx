import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedDropdownMenuRegistry from "../../../../../../../registry/effects/components/animated-dropdown-menu/registry.json";

export default function Page() {
  return <DemoContent registry={animatedDropdownMenuRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-dropdown-menu");
}
