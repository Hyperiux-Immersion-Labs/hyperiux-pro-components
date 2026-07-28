"use client";

import BlockTransition from "@/components/block-transition";
import ChessGridTransition from "@/components/chess-grid-transition/ChessGridTransition";
import PageFlipTransition from "@/components/page-flip-transition";
import PixelTransition from "@/components/pixel-transition";
import RadialSliceTransition from "@/components/radial-slice-transition";
import SVGBrushTransition from "@/components/svg-brush-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "./RegistryRemixerDemo";

const transitionComponents = {
  "block-transition": BlockTransition,
  "chess-grid-transition": ChessGridTransition,
  "page-flip-transition": PageFlipTransition,
  "pixel-transition": PixelTransition,
  "radial-slice-transition": RadialSliceTransition,
  "svg-brush-transition": SVGBrushTransition,
};

export default function TransitionRemixerLayout({ children, registry, slug }) {
  const Transition = transitionComponents[slug];

  if (!Transition) return children;

  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => (
        <Transition {...values}>
          <DemoHeader />
          {children}
        </Transition>
      )}
      copyCodeOptions={{
        includeDemoHeader: false,
        propsVariableName: `${registry.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Props`,
      }}
    />
  );
}
