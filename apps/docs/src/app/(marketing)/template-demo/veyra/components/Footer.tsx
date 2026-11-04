// Built using Hyperiux Vault: https://vault.hyperiux.com

import { Logo } from "./Buttons";
import RollingLink from "./effects/rolling-text";
import ScrambleText from "./effects/scramble-text";
import { brand, footer } from "../content";

const Footer = () => {
  return (
    <footer id="vey-footer" data-vey-tone="dark" className="relative bg-[#0b1020] text-[#f5f6fa]">
      <div className="flex flex-col gap-16 vey-container py-[6vw] max-lg:py-[10vw] max-md:gap-12 max-md:py-[14vw]">
        <div className="h-px w-full bg-white/10" />
        <div className="flex justify-between gap-10 max-lg:flex-col">
          <div className="flex w-[26%] flex-col gap-4 max-lg:w-[60%] max-md:w-full">
            <a href={brand.homeHref} aria-label={`${brand.name} home`} className="w-fit">
              <Logo />
            </a>
            <p className="text-24 text-vey-dim">{footer.about}</p>
          </div>
          <nav aria-label="Footer" className="grid w-[50%] grid-cols-3 gap-8 max-lg:w-full max-md:grid-cols-2">
            {footer.columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <span className="font-vey-mono text-14 uppercase tracking-wide text-vey-dim">
                  <ScrambleText text={col.title} triggerSelector="#vey-footer" start="top 85%" chars="upperCase" />
                </span>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <RollingLink
                        href="#"
                        text={l}
                        className="text-22 text-[#f5f6fa]/80 transition-colors duration-300 hover:text-[#aeb8e8]"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-6 max-md:flex-col-reverse max-md:items-start">
          <span className="text-14 text-vey-dim">
            &copy; {new Date().getFullYear()} {footer.copyright}
          </span>
          <ul className="flex items-center gap-6">
            {footer.socials.map((s) => (
              <li key={s}>
                <RollingLink href="#" text={s} className="text-22 text-[#f5f6fa]/80 transition-colors duration-300 hover:text-[#aeb8e8]" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
