
import Link from "next/link";
import { ExpandingNavbarDesktop } from "./ExpandingNavbarDesktop";
import { ExpandingNavbarMobile } from "./ExpandingNavbarMobile";
import { ArrowUpRight } from "lucide-react";


export default function ExpandingNavbar({
    backgroundColor = "#ffffff",
    activeColor = "#ff5f00",
    duration = 1,
    ease = "cubic-bezier(0.625, 0.05, 0, 1)",
    expandedWidth = 98,
}) {
    return (
        <div className="h-screen w-full relative overflow-hidden" style={{ backgroundColor }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#111111]">
                <h1 className="max-md:text-[4vw] max-sm:text-[5vw] text-[2.5vw] tracking-tight">
                    Watch items spring, orbit and snap into place
                    <br />
                    <span className="text-[1.5vw] max-md:text-[2.5vw] max-sm:text-[3.5vw] opacity-70">
                        [Click the menu to reveal the motion]
                    </span>
                </h1>

                <div className="mt-6 flex items-center gap-3 max-sm:flex-col">
                    <Link
                        href="/effects"
                        className="w-fit mx-auto items-center flex gap-2 rounded-full text-white px-6 py-3 text-[1vw] max-md:text-[2vw] max-sm:text-[3vw] font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: activeColor }}
                    >
                        Explore all Effects
                        <ArrowUpRight className="size-4" />
                    </Link>

                    <Link
                        href="/effects/navigation/expanding-navbar"
                        className="w-fit mx-auto items-center flex gap-2 rounded-full text-white px-6 py-3 text-[1vw] max-md:text-[2vw] max-sm:text-[3vw] font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: activeColor }}
                    >
                        Read Article
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </div>

            <ExpandingNavbarDesktop activeColor={activeColor} duration={duration} ease={ease} expandedWidth={expandedWidth} />
            <ExpandingNavbarMobile activeColor={activeColor} duration={duration} ease={ease} />
        </div>
    );
}
