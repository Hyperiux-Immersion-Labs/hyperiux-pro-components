import TransitionRemixerLayout from "@/components/remixer-panel/TransitionRemixerLayout";
import chessGridTransitionRegistry from "../../../../../../../registry/effects/transitions/chess-grid-transition/registry.json";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionRemixerLayout
      registry={chessGridTransitionRegistry}
      slug="chess-grid-transition"
    >
      {children}
    </TransitionRemixerLayout>
  );
}
