import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import pixelTransitionRegistry from "../../../../../../../registry/effects/transitions/pixel-transition/registry.json";

export default function layout({ children }) {
  return (
    <TransitionRemixerLayout registry={pixelTransitionRegistry} slug="pixel-transition">
      {children}
    </TransitionRemixerLayout>
  );
}
