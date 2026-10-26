"use client";

import PortalCarousel, { type PortalCarouselProps } from "@/components/portal-carousel";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";

export default function PortalCarouselDemo({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => (
        <PortalCarousel
          label={values.label as string}
          thumbWidth={values.thumbWidth as number}
          followSpeed={values.followSpeed as number}
          duration={values.duration as number}
          ease={values.ease as PortalCarouselProps["ease"]}
        />
      )}
      copyCodeOptions={{ propsVariableName: "portalCarouselProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The gallery swaps with a fade.",
              body: "With reduced motion, the preview sits on the cursor without trailing, each new image fades in over the old one instead of expanding from the preview, and the counter and title fade instead of rolling.",
            }}
          />
          {effect}
        </>
      )}
    </RegistryRemixerDemo>
  );
}
