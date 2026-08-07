import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import radialSliceTransitionRegistry from "../../../../../../../registry/effects/transitions/radial-slice-transition/registry.json";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionRemixerLayout
      registry={radialSliceTransitionRegistry}
      slug="radial-slice-transition"
    >
      {children}
    </TransitionRemixerLayout>
  );
}
