// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { brand, footer } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, ready, scene } from "./Animations/scroll";
import { LogoMark, SocialIcon } from "./Icon";

gsap.registerPlugin(useGSAP);

const linkClass = "text-14 text-orn-muted transition-colors duration-200 hover:text-[var(--orn-text)]";

const Footer = () => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 90%", "top 40%");
      fade(tl, "[data-orn-wordmark]", 0, 0, 32);
      fade(tl, "[data-orn-col]", 0.2, 0.1, 16);
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="footer" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light">
      <div className="orn-container flex flex-col gap-16 py-[6vw] max-lg:py-[8vw] max-md:gap-12 max-md:py-[12vw]">
        <div className="flex justify-between gap-12 max-lg:flex-col">
          <a data-orn-wordmark data-orn-fade href={brand.homeHref} className="flex h-fit items-center gap-3 text-72 font-orn-display font-semibold">
            <LogoMark className="h-[6vh] aspect-square max-lg:h-[4.4vh] max-md:h-[5.6vh]" />
            {brand.name}
          </a>
          <div className="grid w-[56%] grid-cols-4 gap-8 max-lg:w-full max-md:grid-cols-2 max-md:gap-y-10">
            {footer.groups.map((group) => (
              <nav key={group.title} data-orn-col data-orn-fade aria-label={group.title} className="flex flex-col gap-4">
                <h3 className="text-14 font-medium">{group.title}</h3>
                <ul className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav data-orn-col data-orn-fade aria-label={footer.social.title} className="flex flex-col gap-4">
              <h3 className="text-14 font-medium">{footer.social.title}</h3>
              <ul className="flex flex-col gap-3">
                {footer.social.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${linkClass}`}>
                      <SocialIcon name={link.icon} className="h-[1.8vh] aspect-square max-lg:h-[1.4vh] max-md:h-[2vh]" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="h-px w-full bg-[var(--orn-border)]" />
          <div className="flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
            <p className="text-12 text-orn-muted">{footer.copyright}</p>
            <ul className="flex gap-8">
              {footer.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
