import PixelRandom from "@/components/pixel-random";
import Footer from "@/components/LandingPage/Footer";
import React from "react";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export default function layout({ children }) {
  return (
    // <PixelRandom color="#ff5f00">
    <>
      <NavbarMobile />
      <div className="w-full">
        {children}
        <Footer animations={false} />
      </div>
      </>
    // </PixelRandom>
  );
}
