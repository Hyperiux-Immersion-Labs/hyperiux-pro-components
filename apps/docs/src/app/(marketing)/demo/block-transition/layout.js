import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import blockTransitionRegistry from "../../../../../../../registry/effects/transitions/block-transition/registry.json";

export default function layout({ children }) {
  return (
    <TransitionRemixerLayout registry={blockTransitionRegistry} slug="block-transition">
      {children}
    </TransitionRemixerLayout>
  );
}
