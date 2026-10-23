import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedQuestionnaireRegistry from "../../../../../../../registry/effects/components/animated-questionnaire/registry.json";

export default function Page() {
  return <DemoContent registry={animatedQuestionnaireRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-questionnaire");
}
