"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { LocalRemixerDemo } from "@/components/local-remixer";
import ParallaxStripSlider from "@/components/parallax-strip-slider";
import type {
  RegistryProp,
  RegistryRemixerConfig,
} from "@/components/remixer-panel/types";

const R2_BASE =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/strip-paralax-slider";

const SLIDES = [
  { src: `${R2_BASE}/img01.png`, title: "Fire", chapter: "Collection 01" },
  { src: `${R2_BASE}/img02.png`, title: "Allure", chapter: "Collection 02" },
  { src: `${R2_BASE}/img03.png`, title: "Ember", chapter: "Collection 03" },
];

export default function DemoContent({
  registry,
}: {
  registry: {
    name: string;
    category?: string;
    props?: RegistryProp[];
    remixer?: RegistryRemixerConfig;
  };
}) {
  return (
    <LocalRemixerDemo
      name={registry.name}
      category={registry.category}
      props={registry.props ?? []}
      remixer={registry.remixer}
      render={(values) => (
        <main className="h-dvh w-full bg-black">
          <ParallaxStripSlider
            slides={SLIDES}
            clueText="Click either side and watch the next strip cut through."
            {...values}
          />
        </main>
      )}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
        </>
      )}
    </LocalRemixerDemo>
  );
}
