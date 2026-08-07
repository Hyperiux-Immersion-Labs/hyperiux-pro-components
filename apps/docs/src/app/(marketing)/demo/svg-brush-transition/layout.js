import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import svgBrushTransitionRegistry from "../../../../../../../registry/effects/transitions/svg-brush-transition/registry.json";

export default function layout({ children }) {
  return (
    <TransitionRemixerLayout
      registry={svgBrushTransitionRegistry}
      slug="svg-brush-transition"
    >
      {children}
    </TransitionRemixerLayout>
  );
}
