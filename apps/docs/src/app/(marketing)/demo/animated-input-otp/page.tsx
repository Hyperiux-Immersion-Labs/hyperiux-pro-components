import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedInputOtpRegistry from "../../../../../../../registry/effects/components/animated-input-otp/registry.json";

export default function Page() {
  return <DemoContent registry={animatedInputOtpRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-input-otp");
}
