"use client";

import React, { useState } from "react";
import LinkHover from "../WebsiteComps/LinksHover";
import ReflectiveRods from "@/Experience/ReflectiveRods";

const vaultFooterLinks = [
  { label: "Documentations", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Github",
    href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components",
  },
];

const effectTypeColumns = [
  [
    { label: "Scroll", href: "/effects/scroll-effects" },
    { label: "Cursor", href: "/effects/cursor-effects" },
    { label: "Text", href: "/effects/text-animations" },
  ],
  [
    { label: "Transitions", href: "/effects/page-transitions" },
    { label: "WebGL", href: "/effects/webgl-effects" },
    { label: "Navigation", href: "/effects/navigation" },
  ],
  [
    { label: "Backgrounds", href: "/effects/backgrounds" },
    { label: "Buttons", href: "/effects/buttons" },
    { label: "Loaders", href: "/effects/loaders" },
  ],
];

function FooterLink({ href, children }) {
  const isExternal = href?.startsWith("http");

  return (
    <LinkHover
      href={href}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text18"
      idleColor="#939393"
      hoverColor="#ffffff"
      showUnderline={false}
    >
      {children}
    </LinkHover>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
  };

  return (
    <footer className="relative z-200 py-[10vw]  w-full overflow-hidden max-md:mt-20">
      <ReflectiveRods />
      <p className="text-center text18 absolute bottom-[2vw] left-1/2 -translate-x-1/2 text-light-grey">2026 Hyperiux Immersion Labs. All rights reserved</p>
      <div className="mx-auto w-[70vw] max-md:w-full max-md:px-[5vw]">
        <div className="flex border-x border-foreground/15 max-md:flex-col max-md:border-x-0">
          <div className="flex flex-[1.65] border-l border-r border-grey max-md:flex-col">
            <div className="flex w-[28%] flex-col gap-[2vw] px-[2vw] py-[2.5vw] max-md:w-full max-md:border-r-0 max-md:border-b max-md:px-0 max-md:py-[8vw] max-md:gap-[4vw]">
              <h3 className="text22 font-medium text-foreground">Vault</h3>
              <ul className="flex flex-col gap-[0.8vw] max-md:gap-[3vw]">
                {vaultFooterLinks.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-1 flex-col gap-[2vw] px-[2vw] py-[2.5vw] max-md:gap-[4vw] max-md:border-b max-md:border-foreground/15 max-md:px-0 max-md:py-[8vw]">
              <h3 className="text22 font-medium text-foreground">
                Effects by type
              </h3>
              <div className="grid grid-cols-3 gap-x-[2vw] max-md:grid-cols-2 max-sm:grid-cols-1 max-md:gap-y-[3vw]">
                {effectTypeColumns.map((column, columnIndex) => (
                  <ul
                    key={columnIndex}
                    className="flex flex-col gap-[0.8vw] max-md:gap-[3vw]"
                  >
                    {column.map(({ label, href }) => (
                      <li key={label}>
                        <FooterLink href={href}>{label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[1vw] px-[2vw] py-[2.5vw] max-md:border-l-0 max-md:px-0 max-md:py-[8vw] max-md:gap-[3vw]">
            <h3 className="text22 font-medium text-foreground">
              New effects, in your inbox.
            </h3>
            <p className="text18 max-w-[22vw] leading-[1.45] text-light-grey max-md:max-w-full">
              Get every new drop and the occasional behind-the-
              scenes build. No spam, unsubscribe anytime.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-[0.5vw] flex items-center gap-[1.5vw] max-md:mt-0 max-md:flex-col max-md:items-stretch max-md:gap-[4vw]"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-full border border-grey bg-transparent px-[1.4vw] py-[0.75vw] text18 text-foreground outline-none placeholder:text-light-grey/70 focus:border-white/30 max-md:px-[4vw] max-md:py-[3vw]"
              />
              <button
                type="submit"
                className="shrink-0 text18 text-foreground underline decoration-foreground underline-offset-[0.35vw] transition-colors hover:text-white max-md:self-start"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
