import Footer from "@/components/LandpageV2/Footer";
import React from "react";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import CTA2 from "@/components/LandpageV2/CTA2";

export default function layout({ children }) {
  return (
    <>
      <NavbarMobile />
      <div className="w-full">
        {children}
        {/* <CTA2 /> */}
        <Footer animations={false} />
      </div>
      </>
  );
}
