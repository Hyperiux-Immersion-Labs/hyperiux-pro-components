import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import pageFlipTransitionRegistry from "../../../../../../../registry/effects/transitions/page-flip-transition/registry.json";

export default function layout({ children }) {
  return (
    <TransitionRemixerLayout
      registry={pageFlipTransitionRegistry}
      slug="page-flip-transition"
    >
      {children}
    </TransitionRemixerLayout>
  );
}
