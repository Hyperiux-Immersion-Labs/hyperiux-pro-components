"use client";

import { Link } from "next-transition-router";
import { usePathname } from "next/navigation";

export default function FlipHeader() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 px-2 py-2">
                <Link
                    href="/demo/page-flip-transition"
                    className={`text-sm font-medium tracking-tight px-4 py-2 rounded-md hover:text-[#DE4013] ${pathname === "/demo/page-flip-transition"
                            ? "text-[#DE4013]"
                            : "text-black"
                        }`}
                >
                    Page I
                </Link>
                <Link
                    href="/demo/page-flip-transition/page2"
                    className={`text-sm font-medium tracking-tight px-4 py-2 rounded-md hover:text-[#DE4013] ${pathname === "/demo/page-flip-transition/page2"
                            ? "text-[#DE4013]"
                            : "text-black"
                        }`}
                >
                    Page II
                </Link>
            </div>
        </nav>
    );
}