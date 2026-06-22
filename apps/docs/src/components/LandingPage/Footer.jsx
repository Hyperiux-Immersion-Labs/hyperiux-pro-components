import React from "react";
import Button from "../WebsiteComps/Button";
import CircularButton from "../WebsiteComps/CirclularButton";
import { socialLinks, socialLinksList as AgencyLinks, vaultLinks } from "../../utils/Links";
import LinkHover from "../WebsiteComps/LinksHover";
import RandomBlur from "../WebsiteComps/RandomBlur";
import ReflectiveRods from "@/Experience/ReflectiveRods";

export default function Footer({ animations=true }) {
  return (
    <footer className="h-fit overflow-hidden max-md:mt-20   z-200 relative w-full">
      <ReflectiveRods />
      <div className="self-padd z-100 h-fit min-h-screen flex items-end justify-end relative max-md:min-h-0 max-sm:py-[15vw]">
        <div className="w-full max-md:space-y-[6vw] max-sm:space-y-[8vw] h-fit relative">
          {
            animations ? <RandomBlur
              as="h2"
              className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! px-[10vw] text-center"
            >
              Build the interaction layer your website is missing.
            </RandomBlur> : <h2

              className="text110 pointer-events-auto max-sm:w-full max-sm:px-0! px-[10vw] text-center"
            >
              Build the interaction layer your website is missing.
            </h2>
          }

          <div className="flex max-sm:flex-col items-center max-sm:gap-[4vw] py-[2vw] mb-[4vw] max-md:mb-[15vw] max-sm:mb-[10vw] justify-center gap-[2vw] fadeup">
            <Button text="Install CLI" href="/docs/installation"  />
            <Button text="Work with Hyperiux" className="border border-white" variant="white" />
          </div>
          <div className="w-full h-fit flex items-end pb-[2vw] max-md:pb-[15vw] justify-between relative max-sm:flex-col max-sm:items-center   max-sm:gap-[16vw] max-sm:pb-[8vw]">
            <div className="w-fit max-sm:mb-[-4vw] flex-col gap-[1vw] flex items-start justify-center h-full max-sm:order-2 max-sm:items-center max-sm:gap-[6vw]">
              <div className="space-y-[.5vw] max-sm:space-y-[3vw] max-sm:text-center">
                <LinkHover className="text22 block" href="mailto:hello@hyperiux.com">
                  hello@hyperiux.com
                </LinkHover>
           
           
                <LinkHover className="text22 block" href="tel:+918178026136">
                  +918178026136
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
            <div className="w-fit flex flex-row items-start justify-center gap-[4vw] max-sm:order-1 max-sm:flex-col max-sm:items-center max-md:gap-[8vw] max-sm:gap-[14vw]">
              <div className="flex flex-col gap-[2.5vw] max-sm:items-center max-sm:gap-[8vw]">
                <h3 className="text22 font-medium!">Hyperiux Vault</h3>
                <ul className="flex flex-col gap-[.5vw] max-sm:items-center max-sm:gap-[3vw]">
                  {vaultLinks.map(({ label, href }) => {
                    const isExternal = href?.startsWith("http");
                    return (
                      <li key={label}>
                        <LinkHover
                          href={href}
                          target={isExternal ? "_blank" : "_self"}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className="text18"
                        >
                          {label}
                        </LinkHover>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-col gap-[2.5vw] max-sm:items-center max-sm:gap-[8vw]">
                <h3 className="text22 font-medium!">Agency</h3>
                <ul className="flex flex-col gap-[.5vw] max-sm:items-center max-sm:gap-[3vw]">
                  {AgencyLinks.map(({ label, href }) => {
                    const isExternal = href?.startsWith("http");
                    return (
                      <li key={label}>
                        <LinkHover
                          href={href}
                          target={isExternal ? "_blank" : "_self"}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className="text18 "
                        >
                          {label}
                        </LinkHover>
                      </li>
                    );
                  })}
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
