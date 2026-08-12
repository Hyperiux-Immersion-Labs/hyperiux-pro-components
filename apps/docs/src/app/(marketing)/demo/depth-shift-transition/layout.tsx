import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import depthShiftTransitionRegistry from "../../../../../../../registry/effects/transitions/depth-shift-transition/registry.json";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionRemixerLayout
      registry={depthShiftTransitionRegistry}
      slug="depth-shift-transition"
    >
      {children}
    </TransitionRemixerLayout>
  );
}
