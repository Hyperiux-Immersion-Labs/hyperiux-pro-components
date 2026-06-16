import React from "react";
import Button from "../Reusable/Button";
import Link from "next/link";
import CircularButton from "../Reusable/CirclularButton";
import { socialLinks, socialLinksList, vaultLinks } from "../../utils/Links";
import LinkHover from "../Reusable/LinksHover";
import SplitLine from "../Reusable/SplitLine";
import RandomBlur from "../Reusable/RandomBlur";
import ReflectiveRods from "@/Experience/ReflectiveRods";

export default function Footer() {
  return (
    <footer className="h-fit overflow-hidden  z-200 relative w-full">
      <ReflectiveRods />
      <div className="self-padd z-100 h-fit min-h-screen flex items-end justify-end relative max-:min-h-0 max-sm:py-[15vw]">
        <div className="w-full max-sm:space-y-[8vw] h-fit relative">
          <RandomBlur
            as="h2"
            className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! px-[10vw] text-center"
          >
            Build the interaction layer your website is missing.
          </RandomBlur>
          <div className="flex max-sm:flex-col items-center max-sm:gap-[4vw] py-[2vw] mb-[4vw] max-sm:mb-[10vw] justify-center gap-[2vw]">
            <Button text="Install CLI" />
            <Button text="Work with Hyperiux" className="border border-white" variant="white" />
          </div>
          <div className="w-full h-fit flex items-end pb-[2vw] justify-between relative max-sm:flex-col max-sm:items-center   max-sm:gap-[16vw] max-sm:pb-[8vw]">
            <div className="w-fit max-sm:mb-[-4vw] flex-col gap-[1vw] flex items-start justify-center h-full max-sm:order-2 max-sm:items-center max-sm:gap-[6vw]">
              <div className="space-y-[.5vw] max-sm:space-y-[3vw] max-sm:text-center">
                <LinkHover className="text22 block" href="/">
                  hi@hyperiux.com
                </LinkHover>
                <LinkHover className="text22 block" href="/">
                  +91817802636
                </LinkHover>
              </div>
              <div className="flex mt-4 gap-3 max-sm:mt-0 max-sm:gap-[4vw]">
                {socialLinks.map(({ href, Icon, label }) => (
                  <CircularButton key={label} href={href} variant={undefined}>
                    <Icon />
                  </CircularButton>
                ))}
              </div>
            </div>
            <div className="w-fit flex flex-row items-start justify-center gap-[4vw] max-sm:order-1 max-sm:flex-col max-sm:items-center max-sm:gap-[14vw]">
              <div className="flex flex-col gap-[2.5vw] max-sm:items-center max-sm:gap-[8vw]">
                <h3 className="text22 font-medium!">Hyperiux Vault</h3>
                <ul className="flex flex-col gap-[.5vw] max-sm:items-center max-sm:gap-[3vw]">
                  {vaultLinks.map(({ label, href }) => (
                    <li key={label}>
                      <LinkHover
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text18"
                      >
                        {label}
                      </LinkHover>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-[2.5vw] max-sm:items-center max-sm:gap-[8vw]">
                <h3 className="text22 font-medium!">Socials</h3>
                <ul className="flex flex-col gap-[.5vw] max-sm:items-center max-sm:gap-[3vw]">
                  {socialLinksList.map(({ label, href }) => (
                    <li key={label}>
                      <LinkHover
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text18"
                      >
                        {label}
                      </LinkHover>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text18 text-center absolute bottom-[2vw] left-1/2 text-light-grey/60 -translate-x-1/2 max-sm:order-3 max-sm:relative max-sm:bottom-auto max-sm:left-auto max-sm:translate-x-0 ">
              2026 Hyperiux Immersion Labs. All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
