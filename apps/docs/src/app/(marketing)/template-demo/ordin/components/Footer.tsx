// Built using Hyperiux Vault: https://vault.hyperiux.com

import { OrdMark } from "./Buttons";
import { LINKS } from "./nav";
import ColorfulCursorAura from "./effects/colorful-cursor-aura";
import FooterParallax from "./effects/parallax-footer";
import ScrambleLinkButton from "./effects/scramble-link-button";

const SOCIALS = [
  { label: "X", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

const Footer = () => {
  return (
    <FooterParallax id="ord-footer" data-ord-orb="footer" data-ord-light footerClassName="bg-ord-bone text-ord-ink">
      <div className="flex flex-col overflow-hidden ord-container pt-[5vw] pb-[1.4vw] max-lg:gap-[6vw] max-lg:pt-[8vw] max-md:gap-12 max-md:py-[12vw]">
        <div className="flex items-start justify-between gap-10 max-md:flex-col">
          <div className="flex w-[34%] flex-col gap-5 max-lg:w-[44%] max-md:w-full">
            <a href="#" className="ord-draw group flex items-center gap-3">
              <OrdMark />
              <span className="text-30 font-medium">Ordin</span>
            </a>
            <p className="text-24 text-[#4d5f5a]">The operating layer for autonomous work.</p>
          </div>
          <div className="flex gap-[6vw] max-md:w-full max-md:justify-between">
            <div className="flex flex-col gap-4">
              <p className="ord-label text-14 uppercase text-ord-primary-deep">Explore</p>
              <ul className="flex flex-col gap-2">
                {LINKS.map((l) => (
                  <li key={l}>
                    <ScrambleLinkButton href="#" text={l} hoverColor="#13605d" className="text-22 text-[#0c1218]" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <p className="ord-label text-14 uppercase text-ord-primary-deep">Follow</p>
              <ul className="flex flex-col gap-2">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <ScrambleLinkButton
                      href={s.href}
                      text={s.label}
                      target="_blank"
                      rel="noreferrer"
                      hoverColor="#13605d"
                      className="text-22 text-[#0c1218]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <ColorfulCursorAura
          className="-mb-[1.6vw] cursor-crosshair select-none"
          textClassName="text-[20vw] font-normal leading-[0.85] tracking-[-0.06em] text-[#d3ddd3]"
        >
          ordin
        </ColorfulCursorAura>
        <div className="flex justify-between gap-6 border-t border-[#0c1218]/15 pt-[1.4vw] ord-label text-14 uppercase text-[#4d5f5a] max-lg:pt-[3vw] max-md:flex-col max-md:pt-[5vw] mt-[4vw]">
          <span>(c) 2026 Ordin Labs</span>
          <span className="flex items-center gap-2">
            <span className="h-[0.6vh] aspect-square rounded-full bg-[#73bea1]" />
            <span>All systems operational</span>
          </span>
          <span>Privacy / Terms</span>
        </div>
      </div>
    </FooterParallax>
  );
};

export default Footer;
