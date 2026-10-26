import type { Metadata } from "next";
import DemoContent from "./DemoContent";

export const metadata: Metadata = {
  title: "Pixel Reveal Demo",
};

export default function Page() {
  return <DemoContent />;
}
