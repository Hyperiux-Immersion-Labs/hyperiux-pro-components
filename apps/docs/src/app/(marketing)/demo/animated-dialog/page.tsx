import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedDialogRegistry from "../../../../../../../registry/effects/components/animated-dialog/registry.json";

export default function Page() {
  return <DemoContent registry={animatedDialogRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-dialog");
}
