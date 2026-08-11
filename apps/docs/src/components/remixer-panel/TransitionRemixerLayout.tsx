"use client";

import type { ReactNode } from "react";
import BlockTransition from "@/components/block-transition";
import ChessGridTransition from "@/components/chess-grid-transition/ChessGridTransition";
import PageFlipTransition from "@/components/page-flip-transition";
import PixelTransition from "@/components/pixel-transition";
import RadialSliceTransition from "@/components/radial-slice-transition";
import SVGBrushTransition from "@/components/svg-brush-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "./RegistryRemixerDemo";
import type { RegistryLike, RemixerComponent } from "./types";

const transitionComponents: Record<string, RemixerComponent> = {
  "block-transition": BlockTransition,
  "chess-grid-transition": ChessGridTransition,
  "page-flip-transition": PageFlipTransition,
  "pixel-transition": PixelTransition,
  "radial-slice-transition": RadialSliceTransition,
  "svg-brush-transition": SVGBrushTransition,
};

export default function TransitionRemixerLayout({
  children,
  registry,
  slug,
}: {
  children: ReactNode;
  registry?: RegistryLike;
  slug: string;
}) {
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
        propsVariableName: `${(registry?.name ?? "").replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}Props`,
      }}
    />
  );
}
