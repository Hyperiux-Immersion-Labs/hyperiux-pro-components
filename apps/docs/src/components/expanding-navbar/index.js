
import Link from "next/link";
import { ExpandingNavbarDesktop } from "./ExpandingNavbarDesktop";
import { ExpandingNavbarMobile } from "./ExpandingNavbarMobile";
import { ArrowUpRight } from "lucide-react";


export default function ExpandingNavbar() {
    return (
        <div className="h-screen w-full bg-primary relative overflow-hidden">
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white max-md:text-[4vw] max-sm:text-[5vw] text-[2.5vw] tracking-tight text-center w-full">
                Watch items spring, orbit and snap into place
                <br />
                <span className="text-[1.5vw] max-md:text-[2.5vw] max-sm:text-[3.5vw] opacity-70">[Click the ☰ to reveal the motion]</span>

                <span className="block mt-6">
                    <Link
                        href="/effect"
                        className="w-fit mx-auto items-center flex gap-2 rounded-full bg-white text-black px-6 py-3 text-[1vw] max-md:text-[2vw] max-sm:text-[3vw] font-medium hover:opacity-90 transition-opacity"
                    >
                        Explore all Effects
                       <ArrowUpRight className="size-4" />
                    </Link>
                </span>
            </p>
            
            <ExpandingNavbarDesktop />
            <ExpandingNavbarMobile />
        </div>
    );
}
