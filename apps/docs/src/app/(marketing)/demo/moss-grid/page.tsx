import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import mossGridRegistry from "../../../../../../../registry/effects/backgrounds/moss-grid/registry.json";

export default function Page() {
  return <DemoContent registry={mossGridRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("moss-grid");
}
