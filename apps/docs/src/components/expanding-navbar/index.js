import React from "react";
import { ExpandingNavbarDesktop } from "./ExpandingNavbarDesktop";
import { ExpandingNavbarMobile } from "./ExpandingNavbarMobile";


export default function ExpandingNavbar() {
    return (
        <div className="h-screen w-full bg-primary relative overflow-hidden">
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white max-md:text-[4vw] max-sm:text-[5vw] text-[2.5vw] tracking-tight text-center w-full">
                Watch items spring, orbit and snap into place
                <br />
                <span className="text-[1.5vw] max-md:text-[2.5vw] max-sm:text-[3.5vw] opacity-70">[Click the ☰ to reveal the motion]</span>
            </p>
            
            <ExpandingNavbarDesktop />
            <ExpandingNavbarMobile />
        </div>
    );
}
