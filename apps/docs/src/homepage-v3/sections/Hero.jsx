"use client";

import Button from "@/components/WebsiteComps/Button";
import CubeBackgroundAscii from "../components/CubeBackgroundAscii";
import ButtonV3 from "../components/ButtonV3";

export default function Hero() {
    return (
        <main className="relative h-dvh w-screen overflow-hidden bg-background">
            <CubeBackgroundAscii debug />
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-[12vw] p-[3vw] max-md:items-end max-md:p-6 max-sm:p-5">
                {/* <div className="w-full bg-gradient-to-r pointer-events-none from-black/50 to-transparent h-full absolute inset-0" /> */}
                <div className="space-y-[2.5vw] relative z-10 max-md:space-y-[10vw] max-sm:space-y-[12vw]">
                    <div className="flex flex-col h-fit font-neue-haas w-full items-start max-sm:gap-2 max-md:gap-5">
                        <h1 className="relative t96 mt-[1vw] w-[60vw]">
                            The Interaction Layer your Website is <span className="gradient-text-animate">Missing</span>
                        </h1>
                    </div>

                    <p className="t22 text-secondary w-[40vw] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left">
                        100+ copy-paste effects for React & Next.js. Scroll, cursor, text, and WebGL interactions, preview and install with the CLI.
                    </p>

                    <div className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-[88%] gap-[1vw] max-md:gap-5">
                        <ButtonV3
                            text="Browse Effects"
                            href="/effects/free"
                            variant="black"
                            className="border-white/40 bg-[#0e0e0e]!"
                        />
                        <ButtonV3
                            text="Upgrade to Pro"
                            href="/sign-up"
                            variant="orange"
                            scrollOffset={-1000}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
