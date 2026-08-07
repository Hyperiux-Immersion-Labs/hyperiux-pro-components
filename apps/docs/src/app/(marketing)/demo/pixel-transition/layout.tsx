import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import pixelTransitionRegistry from "../../../../../../../registry/effects/transitions/pixel-transition/registry.json";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionRemixerLayout registry={pixelTransitionRegistry} slug="pixel-transition">
      {children}
    </TransitionRemixerLayout>
  );
}
