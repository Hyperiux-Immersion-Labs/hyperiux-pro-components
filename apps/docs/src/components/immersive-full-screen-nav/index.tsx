"use client"
import CustomNavbar, { type CustomNavbarProps } from "./CustomNavbar";
import FullscreenNav, { type FullscreenNavProps } from "./FullscreenNav";


const NAV_CONFIG: Partial<FullscreenNavProps> = {
  brand: "Hyperiux",
  brandHref: "/",
  clipOrigin: "bottom",
  overlayBg: "#ff5f00",
  headerOpenColor: "#ffffff",
  openDuration: 1.2,
  closeDuration: 1.2,
};




const NAV_CONTENT: Partial<CustomNavbarProps> = {
  agencyName: "",
  tagline: "Crafting digital experiences.",
  location: "Noida, India",
  links: [
    { label: "Home", href: "#" },
    { label: "Work", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
  images: ["https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg", "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg"],
  socials: [
    { type: "instagram", href: "#" },
    { type: "facebook", href: "#" },
    { type: "twitter", href: "#" },
    { type: "linkedin", href: "#" },
  ],
};

export interface ImmersiveFullscreenNavProps {
  navConfig?: Partial<FullscreenNavProps>;
  navContent?: Partial<CustomNavbarProps>;
}

export default function ImmersiveFullscreenNav({
  navConfig = NAV_CONFIG,
  navContent = NAV_CONTENT,
}: ImmersiveFullscreenNavProps) {
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


    </>
  );
}
