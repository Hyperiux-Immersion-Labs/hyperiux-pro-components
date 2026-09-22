"use client";

import SideNavbar from "@/components/side-navbar";
import type { NavLinkItem } from "@/components/side-navbar";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";

// This effect carries its own nav, so the demo points two of its existing
// links at the usual targets rather than layering a DemoHeader over it.
const LI_CLASS = "overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]";

const DEMO_NAV_LINKS: NavLinkItem[] = [
  { href: "/", text: "Home", liClassName: LI_CLASS },
  { href: "/effects/navigation/side-navbar", text: "Read Article", liClassName: LI_CLASS },
  { href: "/effects", text: "Explore Effects", liClassName: LI_CLASS },
  { href: "#", text: "Pricing", liClassName: LI_CLASS },
  { href: "#", text: "Docs", liClassName: LI_CLASS },
];

export default function DemoContent({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={{
        ...registry,
        remixer: {
          ...registry.remixer,
          layout: {
            ...registry.remixer?.layout,
            containerClassName: "[&>div]:top-[14vh]!",
          },
        },
      }}
      render={(values) => <SideNavbar {...values} navLinks={DEMO_NAV_LINKS} />}
      copyCodeOptions={{ propsVariableName: "sideNavbarProps" }}
    >
      {({ effect }) => <div className="relative h-screen w-screen bg-white">{effect}</div>}
    </RegistryRemixerDemo>
  );
}
