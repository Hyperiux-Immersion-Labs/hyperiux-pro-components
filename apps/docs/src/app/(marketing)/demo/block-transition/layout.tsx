import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import blockTransitionRegistry from "../../../../../../../registry/effects/transitions/block-transition/registry.json";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionRemixerLayout registry={blockTransitionRegistry} slug="block-transition">
      {children}
    </TransitionRemixerLayout>
  );
}
