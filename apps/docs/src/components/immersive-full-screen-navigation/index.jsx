"use client"
import CustomNavbar from "./CustomNavbar";
import FullscreenNav from "./FullscreenNav";


const NAV_CONFIG = {
  brand: "Hyperiux",
  brandHref: "/",
  clipOrigin: "bottom",
  overlayBg: "#1a1a2e",
  headerOpenColor: "#ff6600",
  openDuration: 1.2,
  closeDuration: 1.2,
};

const NAV_CONTENT = {
  agencyName: "",
  tagline: "Crafting digital experiences.",
  location: "Noida, India",
  links: [
    { label: "Home", href: "#" },
    { label: "Work", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
  images: ["https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg", "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg"],
  socials: [
    { type: "instagram", href: "#" },
    { type: "facebook", href: "#" },
    { type: "twitter", href: "#" },
    { type: "linkedIn", href: "#" },
  ],
};

export default function ImmersiveFullscreenNav({
  navConfig = NAV_CONFIG,
  navContent = NAV_CONTENT,
}) {
  return (
    <>
      <FullscreenNav {...navConfig}>
        {(isOpen) => (
          <CustomNavbar
            {...navContent}
            isOpen={isOpen}
            overlayBg={navConfig.overlayBg}
            delay={navConfig.openDuration}
          />
        )}
      </FullscreenNav>

      <main className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
        <p className="text-5xl text-neutral-700">Click on the hamburger to open the navigation</p>
      </main>
    </>
  );
}