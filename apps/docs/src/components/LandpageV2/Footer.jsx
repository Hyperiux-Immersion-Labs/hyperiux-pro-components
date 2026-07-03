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
      className="text20"
      duration={0.3}
      idleColor="#939393"
      hoverColor="#ff5f00"
      showUnderline={false}
    >
      {children}
    </LinkHover>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <footer className="relative z-200 py-[15vw]  w-full overflow-hidden max-sm:mt-16 ">
      <ReflectiveRods />
      <p className="text-center max-sm:w-full text18 absolute bottom-[2vw] max-sm:bottom-[7vw] left-1/2 -translate-x-1/2 text-light-grey">2026 Hyperiux Immersion Labs. All rights reserved</p>
      <div className="mx-auto w-[70vw] max-sm:w-full max-sm:px-[5vw]">
        <div className="flex border-x border-foreground/15 max-sm:flex-col max-sm:border-x-0">
          <div className="flex flex-[1.65]  border-r border-grey max-sm:border-r-0 max-sm:border-b-0 max-sm:flex-col">
            <div className="flex w-[28%] flex-col gap-[2vw] px-[2vw] max-sm:w-full max-sm:border-r-0 max-sm:border-0 max-sm:px-0 max-sm:py-[8vw] max-sm:gap-[4vw]">
              <h3 className="text22 font-medium text-foreground max-sm:mx-auto">Vault</h3>
              <ul className="flex flex-col max-sm:items-center gap-[0.8vw] max-sm:gap-[3vw]">
                {vaultFooterLinks.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-1 flex-col gap-[2vw] px-[2vw] max-sm:gap-[4vw] max-sm:border-b-0 max-sm:border-foreground/15 max-sm:px-0 max-sm:py-[8vw]">
              <h3 className="text22 max-sm:mx-auto font-medium text-foreground">
                Effects by type
              </h3>
              <div className="grid grid-cols-3 gap-x-[2vw] max-sm:grid-cols-1 max-sm:gap-y-[3vw]">
                {effectTypeColumns.map((column, columnIndex) => (
                  <ul
                    key={columnIndex}
                    className="flex flex-col max-sm:items-center gap-[0.8vw] max-sm:gap-[3vw]"
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

          <div className="flex flex-1  flex-col gap-[1vw] px-[2vw] max-sm:border-l-0 max-sm:px-0 max-sm:py-[8vw] max-sm:gap-[3vw]">
            <h3 className="text22 font-medium max-sm:mx-auto text-foreground">
              New effects, in your inbox.
            </h3>
            <p className="text18 max-sm:text-center max-w-[22vw] leading-[1.45] text-light-grey max-sm:max-w-full">
              Get every new drop and the occasional behind-the-
              scenes build. No spam, unsubscribe anytime.
            </p>
            {status === "success" ? (
              <p className="mt-[0.5vw] text18 text-[#ff5f00] max-sm:mt-0 max-sm:text-center">
                You&apos;re in. Welcome to the list.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="mt-[0.5vw] flex flex-col gap-[0.75vw] max-sm:mt-0 max-sm:gap-[4vw]"
              >
                <div className="flex items-center gap-[1.5vw] max-sm:flex-col max-sm:items-stretch max-sm:gap-[4vw]">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Email"
                    aria-label="Email address"
                    disabled={status === "loading"}
                    className="min-w-0 flex-1 rounded-full border border-grey bg-transparent px-[1.4vw] py-[0.75vw] text18 text-foreground outline-none placeholder:text-light-grey/70 focus:border-white/30 disabled:opacity-50 max-sm:px-[4vw] max-sm:py-[3vw]"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 text18 max-sm:mx-auto text-foreground underline decoration-foreground underline-offset-[0.35vw] transition-colors hover:text-white disabled:opacity-50 max-sm:self-start"
                  >
                    {status === "loading" ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-400 px-[1.4vw] max-sm:px-0 max-sm:text-center">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
