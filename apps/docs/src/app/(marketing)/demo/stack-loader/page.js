import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import stackLoaderRegistry from "../../../../../../../registry/effects/loaders/stack-loader/registry.json";

export default function Page() {
  return <DemoContent registry={stackLoaderRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("stack-loader");
}
