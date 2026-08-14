"use client";

import CubeBackgroundAscii from "@/homepage-v3/components/CubeBackgroundAscii";
import Button from "@/components/WebsiteComps/Button";

export default function Page() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-black">
      <CubeBackgroundAscii debug />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end p-[3vw] max-md:items-end max-md:p-6 max-sm:p-5">
        {/* <div className="w-full bg-gradient-to-r pointer-events-none from-black/50 to-transparent h-full absolute inset-0" /> */}
        <div className="space-y-[2vw] relative z-10 max-md:space-y-[10vw] max-sm:space-y-[12vw]">
          <div className="flex flex-col h-fit w-full items-start max-sm:gap-2 max-md:gap-5">
            <h1 className="relative text120 mt-[1vw] w-[60vw] capitalize max-sm:font-medium! font-semibold max-md:w-[90%] max-sm:w-[95%] max-md:indent-0!">
              The Interaction Layer your Website is <span className="text-primary">Missing</span>
            </h1>
          </div>

          <p className="text24 w-[40vw] text-[#C9C9C9] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left">
            100+ copy-paste effects for React & Next.js. Scroll, cursor, text, and WebGL interactions, preview and install with the CLI.
          </p>

          <div className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-[88%] gap-[1vw] max-md:gap-5">
            <Button
              text="Browse Free Effects"
              href="/effects/free"
              variant="black"
              className="border-white/40 bg-[#0e0e0e]!"
            />
            <Button
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
