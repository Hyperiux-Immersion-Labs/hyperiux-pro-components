import Footer from "@/components/Homepage/Footer";
import React from "react";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import CTA2 from "@/components/Homepage/CTA2";
import FooterV3 from "@/homepage-v3/sections/FooterV3";

export default function layout({ children }) {
  return (
    <>
      <NavbarMobile />
      <div className="w-full">
        {children}
        {/* <CTA2 /> */}
        <FooterV3 animations={false} />
      </div>
      </>
  );
}
