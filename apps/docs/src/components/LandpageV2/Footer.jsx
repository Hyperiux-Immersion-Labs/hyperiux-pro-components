"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DeferredMount from "../WebsiteComps/DeferredMount";
import FlowFieldHero from "../WebsiteComps/FlowFieldPlane";
import RandomBlur from "../WebsiteComps/RandomBlur";
import Button from "../WebsiteComps/Button";
import { UnlockIcon } from "../WebsiteComps/Icons";
import ShimmerText from "../WebsiteComps/ShimmerText";
import Input from "../animated-form/Input";
// import Input from "../form-comp/Input";

// Three.js footer scene — own chunk, mounted only when the footer nears the viewport.
const ReflectiveRods = dynamic(() => import("@/Experience/ReflectiveRods"), {
  ssr: false,
});

const vaultFooterLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Github", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components" },
];

const categoryColumns = [
  [
    { label: "All Effects", href: "/effects" },
    { label: "WebGL", href: "/effects/webgl-effects" },
    { label: "Text", href: "/effects/text-animations" },
    { label: "Backgrounds", href: "/effects/backgrounds" },
    { label: "Buttons", href: "/effects/buttons" },
    { label: "Carousels", href: "/effects/carousels" },
  ],
  [
    { label: "Scroll", href: "/effects/scroll-effects" },
    { label: "Components", href: "/effects/components" },
    { label: "Navigation", href: "/effects/navigation" },
    { label: "Cursor", href: "/effects/cursor-effects" },
    { label: "Transitions", href: "/effects/page-transitions" },
    { label: "Loaders", href: "/effects/loaders" },
  ],
  
];

const docsLinks = [
  { label: "Introduction", href: "/docs" },
  { label: "CLI", href: "/docs/cli" },
  { label: "Dependencies", href: "/docs/dependencies" },
  { label: "Licence", href: "/docs/license" },
];

const legalLinks = [
  { label: "Licence", href: "/license" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refund", href: "/refund" },
];

const socialLinks = [
  { label: "Twitter / X", href: "https://x.com/hyperiux" },
  { label: "LinkedIn", href: "https://linkedin.com/company/hyperiux" },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components" },
  { label: "Instagram", href: "https://instagram.com/hyperiux" },
];

function FooterBlockLink({ href, children }) {
  const isExternal = href?.startsWith("http");
  return (
    <Link
      href={href}
      prefetch={false}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block overflow-hidden bg-transparent transition-colors duration-300 ease-in-out hover:duration-0 hover:bg-[#ff5f00]"
    >
      <span className="block py-[0.15vw] max-md:py-1.5 max-md:px-2 text20 text-foreground transition-transform duration-200 ease-out group-hover:translate-x-5 group-hover:duration-0">
        {children}
      </span>
    </Link>
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
    <footer className="relative z-200 py-[7vw]  w-full overflow-hidden max-sm:mt-16 px-[3.5vw] max-sm:px-[7vw]">

      {/* <div className="absolute inset-0 top-0 z-1 pointer-events-auto">
        <FlowFieldHero texturePath="/assets/textures/orange.png" />
      </div> */}
      <div className="w-full max-md:space-y-[6vw] max-sm:space-y-[8vw] h-fit relative z-3">

        <RandomBlur
          as="h2"
          className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! w-[70%]"
        >
          Build The Interaction Layer Your Website Is Missing.
        </RandomBlur>


        <p className="text24 py-[2vw] max-sm:py-[6vw]">Start with Free Core today. Join Founding Access for Pro next week.
        </p>

        <div className="flex max-sm:flex-col  max-sm:gap-[4vw] pb-[2vw] mb-[4.5vw] max-md:mb-[15vw] relative max-sm:mb-[10vw] gap-[2vw] fadeup">
          <Button variant='outline2' text="Browse the Effects" href="/effects" className='max-sm:w-[88%] border-white/40' />
          <Button text="Join Founding Access" className="max-sm:w-[88%]" href="#pricing" variant="orange" />
          <p
            className="shimmer-text w-full flex items-center gap-[0.5vw] text-[#939393] leading-none max-md:gap-2 absolute max-sm:bottom-[-12vw] max-md:bottom-[-5vw] bottom-[-.8vw] left-1/2 -translate-x-1/2"
          >
            <span className="inline-block size-[0.9vw] shrink-0 text-[#d2d2d2] max-md:size-3">
              <UnlockIcon className="h-full w-full" />
            </span>

            <ShimmerText baseColor="#d2d2d2" shimmerColor="#ffffff" className='max-sm:text-sm max-sm:leading-[1.2]'>
              30+ effects free, forever. No credit card.
            </ShimmerText>
          </p>
        </div>

      </div>
      <p className="text-center text18 absolute bottom-[2vw] max-sm:bottom-[7vw] left-[4%] text-light-grey z-4 max-md:w-[75vw] max-sm:left-[12%]">© 2026 Hyperiux. All rights reserved. · Vault is built by Hyperiux Studio · Small motion. Big signal.</p>
      {/* ── Footer links grid ── */}
      <div className="relative z-3 mt-[10vw] max-sm:mt-[25vw] ">

        {/* Platform label */}
        <div className="flex items-center gap-[0.5vw] max-md:gap-2 pb-[1vw] max-md:pb-[3vw]">
          <span className="size-[0.45vw] max-md:size-2 rounded-full bg-[#ff5f00]" />
          <span className="text18 text-[#B3B3B3] font-heading">Platform</span>
        </div>

        {/* Top 4-column grid: Vault | Categories | Documents | Legal */}
        <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr]  gap-[2vw]  max-md:grid-cols-2 max-sm:grid-cols-1 ">

          {/* Vault */}
          <div className="flex flex-col gap-[1.5vw] py-[1.2vw] max-sm:py-[6vw] border-t  border-foreground/50 max-md:-0 max-md:pb-[5vw] max-md:gap-[3vw] max-sm:pb-[6vw]">
            <h3 className="text22 font-medium text-[#979797]">Vault</h3>
            <ul className="flex flex-col max-md:gap-1">
              {vaultFooterLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterBlockLink href={href}>{label}</FooterBlockLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-[1.5vw] py-[1.2vw] max-sm:py-[6vw]  border-t  border-foreground/50 max-md:-0  max-md:pb-[5vw] max-md:gap-[3vw] -0 max-sm:px-0 max-sm:pt-[6vw] max-sm:pb-[6vw] max-sm:border-t max-sm:border-foreground/50">
            <h3 className="text22 font-medium text-[#979797]">Categories</h3>
            <div className="grid grid-cols-2 gap-x-[1vw] max-sm:grid-cols-2 max-sm:gap-x-4">
              {categoryColumns.map((col, ci) => (
                <ul key={ci} className="flex flex-col max-md:gap-1">
                  {col.map(({ label, href }) => (
                    <li key={label}>
                      <FooterBlockLink href={href}>{label}</FooterBlockLink>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="flex flex-col gap-[1.5vw] py-[1.2vw] max-sm:py-[6vw]  border-t  border-foreground/50 max-md:-0 max-md:border-t max-md:border-foreground/50 max-md:pt-[5vw] max-md:gap-[3vw] max-sm:px-0 max-sm:pt-[6vw] max-sm:pb-[6vw]">
            <h3 className="text22 font-medium text-[#979797]">Documents</h3>
            <ul className="flex flex-col max-md:gap-1">
              {docsLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterBlockLink href={href}>{label}</FooterBlockLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-[1.5vw] py-[1.2vw] max-sm:py-[6vw]  border-t  border-foreground/50  max-md:border-foreground/50 max-md:border-t max-md:pt-[5vw] max-md:gap-[3vw] -0 max-sm:pl-0 max-sm:border-t max-sm:border-foreground/50 max-sm:pt-[6vw]">
            <h3 className="text22 font-medium text-[#979797]">Legal</h3>
            <ul className="flex flex-col max-md:gap-1">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterBlockLink href={href}>{label}</FooterBlockLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row: Socials | Contact Us | (gap) | Newsletter */}
        <div className="grid grid-cols-[1fr_1.2fr_1.5fr_2.3fr] py-[3vw] max-md:grid-cols-2 max-sm:flex max-sm:flex-col max-md:py-[6vw] max-sm:py-[8vw]">

          {/* Socials */}
          <div className="flex flex-col gap-[1.1vw] pr-[2vw]  border-foreground/50 max-md:-0 max-md:pb-[5vw] max-md:gap-[3vw] max-sm:pb-[6vw]">
            <div className="flex items-center gap-[0.5vw] max-md:gap-2">
              <span className="size-[0.45vw] max-md:size-2 rounded-full bg-[#ff5f00]" />
              <span className="text18 text-[#B3B3B3] font-heading">Socials</span>
            </div>
            <div className="w-full h-px  border-t  border-foreground/50" />
            {/* <p className="text18 text-[#B3B3B3] font-heading">Connect with us on</p> */}
            <ul className="flex flex-col max-md:gap-1">
              {socialLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterBlockLink href={href}>{label}</FooterBlockLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-[1.1vw] px-[2vw]  border-foreground/50 max-md:-0  max-md:pb-[5vw] max-md:gap-[3vw] -0 max-sm:px-0 max-sm:pt-[6vw] max-sm:pb-[6vw] max-sm:border-foreground/50">
            <div className="flex items-center gap-[0.5vw] max-md:gap-2">
              <span className="size-[0.45vw] max-md:size-2 rounded-full bg-[#ff5f00] " />
              <span className="text18 text-[#B3B3B3] font-heading">Contact Us</span>
            </div>
            <div className="w-full h-px  border-t  border-foreground/50" />
            <ul className="flex flex-col max-md:gap-1">
              <li>
                <FooterBlockLink href="mailto:hello@hyperiux.com">hello@hyperiux.com</FooterBlockLink>
              </li>
              <li>
                <FooterBlockLink href="tel:+918178026136">+91 81780 26136</FooterBlockLink>
              </li>
            </ul>
          </div>

          {/* Empty spacer */}
          <div className="max-md:hidden" />


          {/* Newsletter */}
          <div className="flex flex-col gap-[1.15vw] pl-[2vw]  border-foreground/50  max-md:border-foreground/50 max-md:pt-[5vw] max-md:col-span-2 max-md:pl-0 max-md:gap-[3vw] max-sm:py-[6vw] max-sm:pb-[20vw]">
            <div className="flex items-center gap-[0.5vw] max-md:gap-2">
              <span className="size-[0.45vw] max-md:size-2 rounded-full bg-[#ff5f00]" />
              <span className="text18 text-[#B3B3B3] font-heading">New effects, in your inbox.</span>
            </div>
            <div className="w-full h-px border-t  border-foreground/50" />
            <p className="text18 leading-[1.45] max-w-[25vw] mb-[1vw] max-md:max-w-full max-sm:mb-[6vw] text-[#979797]">
              Every new drop, plus the occasional behind-the-scenes build. No spam. Unsubscribe anytime.
            </p>
            {status === "success" ? (
              <p className="text18 text-[#ff5f00]">You&apos;re in. Welcome to the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-[0.6vw] max-md:gap-3">
                <div className="flex items-center gap-[1vw] max-md:gap-3">
                  <Input
                    type="email"
                    value={email}
                    label={"Email"}
                    labelBg="bg-[#111210]! text-[#979797]!"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder=""
                    aria-label="Email address"
                    disabled={status === "loading"}
                    className="min-w-0 flex-1 rounded-none border border-grey bg-transparent! px-[1.2vw] py-[0.6vw] max-md:px-4 max-md:py-3 text18 outline-none placeholder:text-light-grey/70 focus:border-white/30 disabled:opacity-50 text-white"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 text18 text-foreground underline decoration-foreground underline-offset-[0.35vw] transition-colors hover:text-white disabled:opacity-50"
                  >
                    {status === "loading" ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-400 px-[1.2vw] max-md:px-0">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="absolute  bottom-0 left-0 z-2 h-[70%] w-full bg-linear-to-b from-transparent via-[#111210] to-[#111210]">

      </div>
    </footer>
  );
}
