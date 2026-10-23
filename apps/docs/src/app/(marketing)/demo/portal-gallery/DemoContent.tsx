"use client";

import PortalGallery from "@/components/portal-gallery";
import DemoHeader from "@/components/preview-chrome/DemoHeader";

const ASSETS = "/assets/portal-gallery";

const images = [
  { src: `${ASSETS}/crimson-drift.jpg`, title: "Crimson Drift", alt: "Woman tossing her hair in red and amber light, motion-blurred" },
  { src: `${ASSETS}/night-rider.jpg`, title: "Night Rider", alt: "Cyclist in an orange jacket panning past city lights at night" },
  { src: `${ASSETS}/light-trails.jpg`, title: "Light Trails", alt: "Dark SUV streaking past with headlight trails" },
  { src: `${ASSETS}/ember-motion.jpg`, title: "Ember Motion", alt: "Dancers blurred mid-movement in an orange-lit room" },
  { src: `${ASSETS}/platform-wind.jpg`, title: "Platform Wind", alt: "Woman on a subway platform, hair swept by a passing train" },
];

export default function PortalGalleryDemo() {
  return (
    <>
      <DemoHeader />
      <PortalGallery images={images} />
    </>
  );
}
