
import Link from "next/link";
import { ExpandingNavbarDesktop } from "./ExpandingNavbarDesktop";
import { ExpandingNavbarMobile } from "./ExpandingNavbarMobile";
import { ArrowUpRight } from "lucide-react";


export default function ExpandingNavbar() {
    return (
        <div className="h-screen w-full bg-white relative overflow-hidden flex flex-col items-center justify-center">
            <h1 className=" text-[#111111] max-md:text-[4vw] max-sm:text-[5vw] text-[2.5vw] tracking-tight text-center w-full">
                Watch items spring, orbit and snap into place
                <br />
                <span className="text-[1.5vw] max-md:text-[2.5vw] max-sm:text-[3.5vw] opacity-70">[Click the ☰ to reveal the motion]</span>
                </h1>
<div className="flex items-center gap-3">
                <span className="block mt-6">
                    <Link
                        href="/effects"
                        className="w-fit mx-auto items-center flex gap-2 rounded-full bg-[#ff5f00] text-white px-6 py-3 text-[1vw] max-md:text-[2vw] max-sm:text-[3vw] font-medium hover:opacity-90 transition-opacity"
                    >
                        Explore all Effects
                       <ArrowUpRight className="size-4" />
                    </Link>
                </span>
                <span className="block mt-6">
                    <Link
                        href="/effects/navigation/expanding-navbar"
                        className="w-fit mx-auto items-center flex gap-2 rounded-full bg-[#ff5f00] text-white px-6 py-3 text-[1vw] max-md:text-[2vw] max-sm:text-[3vw] font-medium hover:opacity-90 transition-opacity"
                    >
                        Read Article
                       <ArrowUpRight className="size-4" />
                    </Link>
                </span>
                </div>
            
            
            <ExpandingNavbarDesktop />
            <ExpandingNavbarMobile />
        </div>
    );
}
