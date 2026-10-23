// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import ClipNav from "../effects/immersive-full-screen-nav";
import UnderlineLink from "../Buttons/UnderlineLink";
import menuPoster from "../../assets/pictures/menu-ink-poster.webp";
import reelPoster from "../../assets/pictures/reel-poster.webp";
import workCloudline from "../../assets/pictures/w-cloudline.webp";
import serviceIdentity from "../../assets/pictures/s-identity.webp";
import studio from "../../assets/pictures/studio-1.webp";
import journal from "../../assets/pictures/j-1.webp";
import founder from "../../assets/pictures/founder.webp";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP);

const MENU_LINKS = [
  { label: "Home", target: ROUTES.home, preview: reelPoster },
  { label: "Work", target: ROUTES.work, preview: workCloudline },
  { label: "Services", target: ROUTES.services, preview: serviceIdentity },
  { label: "About", target: ROUTES.about, preview: studio },
  { label: "Journal", target: ROUTES.blog, preview: journal },
  { label: "Contact", target: ROUTES.contact, preview: founder },
];

const WORTH_A_LOOK = [
  { label: "Case study", target: ROUTES.caseStudy },
  { label: "Service detail", target: ROUTES.service },
  { label: "Journal article", target: ROUTES.article },
  { label: "The team", target: ROUTES.team },
  { label: "404, playable", target: ROUTES.notFound },
];


const PREVIEW_HIDDEN = "inset(100% 0% 0% 0%)";
const PREVIEW_SHOWN = "inset(0% 0% 0% 0%)";
const PREVIEW_EXIT = "inset(0% 0% 100% 0%)";

type MenuProps = {
  open: boolean;
  onClose: () => void;
};

const formatTime = (zone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(new Date());

const Menu = ({ open, onClose }: MenuProps) => {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const openedRef = useRef(false);
  const activePreviewRef = useRef(-1);
  const stackRef = useRef(0);
  const shownRef = useRef<Set<HTMLElement>>(new Set());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [times, setTimes] = useState<string[]>(STUDIOS.map(() => ""));

  useEffect(() => {
    const tick = () => setTimes(STUDIOS.map((item) => formatTime(item.zone)));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open && !prefersReducedMotion()) {
      video.preload = "auto";
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [open]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
      const fades = gsap.utils.toArray<HTMLElement>("[data-menu-fade]", root);
      const reset = () => {
        gsap.set(links, { yPercent: 115, rotate: 4 });
        gsap.set(root.querySelectorAll("[data-roll-alt]"), { yPercent: 110 });
        gsap.set(fades, { autoAlpha: 0, y: 24 });
      };

      if (!open) {
        if (!openedRef.current) reset();
        return;
      }

      openedRef.current = true;

      if (prefersReducedMotion()) {
        gsap.set(links, { yPercent: 0, rotate: 0 });
        gsap.set(fades, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          links,
          { yPercent: 115, rotate: 4 },
          { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.06, ease: "power3.out" },
          0.4,
        )
        .fromTo(
          fades,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.04, ease: "power3.out" },
          0.9,
        );
    },
    { dependencies: [open], scope: rootRef },
  );

  const rollLink = (index: number, active: boolean) => {
    const link = linkRefs.current[index];
    if (!link) return;
    const [first, second] = link.querySelectorAll<HTMLElement>("[data-roll]");
    const duration = prefersReducedMotion() ? 0 : 0.75;
    gsap.to(first, { yPercent: active ? -110 : 0, duration, ease: "power3.out" });
    gsap.to(second, { yPercent: active ? 0 : 110, duration, ease: "power3.out" });
  };

  const showPreview = (index: number) => {
    const reduce = prefersReducedMotion();
    const duration = reduce ? 0 : 0.8;

    if (index !== activePreviewRef.current) {
      const token = ++stackRef.current;
      const previews = previewRefs.current;
      const settle = (keep: HTMLElement | null) => {
        previews.forEach((preview) => {
          if (!preview || preview === keep) return;
          gsap.killTweensOf(preview);
          gsap.set(preview, { clipPath: PREVIEW_HIDDEN, scale: 1.2 });
        });
        shownRef.current.clear();
        if (keep) shownRef.current.add(keep);
      };

      const next = index === -1 ? null : previews[index];

      if (next) {
        gsap.killTweensOf(next);
        gsap.set(next, { zIndex: token, clipPath: PREVIEW_HIDDEN, scale: 1.2 });
        shownRef.current.add(next);
        gsap.to(next, {
          clipPath: PREVIEW_SHOWN,
          scale: 1,
          duration,
          ease: "power3.inOut",
          onComplete: () => {
            if (stackRef.current === token) settle(next);
          },
        });
      } else if (shownRef.current.size) {
        gsap.to(Array.from(shownRef.current), {
          clipPath: PREVIEW_EXIT,
          duration,
          ease: "power3.inOut",
          onComplete: () => {
            if (stackRef.current === token) settle(null);
          },
        });
      }

      activePreviewRef.current = index;
    }

    linkRefs.current.forEach((link, i) => {
      if (!link) return;
      gsap.to(link, {
        opacity: index === -1 || i === index ? 1 : 0.4,
        duration: reduce ? 0 : 0.4,
        ease: "power2.out",
      });
    });
  };

  return (
    <ClipNav
      open={open}
      id="mpx-menu"
      rootRef={rootRef}
      className="fixed inset-0 z-70 overflow-y-auto overscroll-contain bg-(--mpx-ink) text-(color:--mpx-paper)"
      innerClassName="mpx-container flex min-h-full origin-top flex-col justify-between gap-7 py-[1.3vw] max-lg:gap-16 max-lg:py-[4vw] max-md:py-[6vw]"
    >
        <div className="h-[6.4vh] max-lg:h-[7vh] max-md:h-[6.4vh]" />

        <div className="flex flex-1 items-center justify-between gap-9 max-lg:flex-col max-lg:items-start max-lg:gap-16">
          <nav aria-label="Main" className="w-[62%] max-lg:w-full">
            <ul className="flex flex-col" onPointerLeave={() => showPreview(-1)}>
              {MENU_LINKS.map((link, index) => (
                <li key={link.label} className="flex overflow-hidden py-[0.4vw] text-64 max-md:py-[0.6vw]">
                  <Link
                    ref={(el) => {
                      linkRefs.current[index] = el;
                    }}
                    href={link.target}
                    tabIndex={open ? 0 : -1}
                    aria-current={pathname === link.target ? "page" : undefined}
                    onClick={onClose}
                    onPointerEnter={() => {
                      rollLink(index, true);
                      showPreview(index);
                    }}
                    onPointerLeave={() => rollLink(index, false)}
                    onFocus={() => showPreview(index)}
                    className="font-mpx-head relative flex items-start gap-3 font-medium max-lg:gap-2 max-md:gap-1 leading-[1.1]"
                  >
                    <span className="relative block overflow-hidden px-[0.4vw] max-md:px-[0.6vw]">
                      <span data-roll className={`block ${pathname === link.target ? "text-(color:--mpx-accent)" : ""}`}>
                        {link.label}
                      </span>
                      <span
                        data-roll
                        data-roll-alt
                        aria-hidden
                        className="absolute left-0 top-0 block font-normal italic text-(color:--mpx-accent)"
                      >
                        {link.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex w-[30%] flex-col gap-6 max-lg:w-full max-lg:gap-8 max-md:gap-7">
            <div data-menu-fade className="relative isolate h-[min(38vh,19vw)] w-[15vw] overflow-hidden rounded-lg [transform:translateZ(0)] bg-(--mpx-ink) max-lg:hidden">
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                poster={menuPoster.src}
                aria-hidden="true"
                className="h-full w-full object-cover"
              >
                <source src="/templates/the-missing-pixel/menu-ink.mp4" type="video/mp4" />
              </video>
              {MENU_LINKS.map((link, index) => (
                <div
                  key={link.label}
                  ref={(el) => {
                    previewRefs.current[index] = el;
                  }}
                  className="absolute inset-0 overflow-hidden rounded-lg [clip-path:inset(100%_0%_0%_0%)]"
                >
                  <Image quality={95} src={link.preview} alt="" sizes="24vw" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h2 data-menu-fade className="mpx-eyebrow text-14 font-semibold text-(color:--mpx-grey)">Also worth a look</h2>
              <ul className="flex flex-wrap gap-2">
                {WORTH_A_LOOK.map((link) => (
                  <li key={link.label} data-menu-fade>
                    <Link
                      href={link.target}
                      tabIndex={open ? 0 : -1}
                      onClick={onClose}
                      className="inline-flex h-[3.2vh] items-center rounded-full border border-(--mpx-white)/20 px-[0.9vw] text-22 font-medium transition-colors duration-300 hover:border-(--mpx-paper) hover:bg-(--mpx-paper) hover:text-(color:--mpx-ink) max-lg:h-[4.4vh] max-lg:px-[2.6vw] max-md:h-[4.1vh] max-md:px-[3.5vw]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 data-menu-fade className="mpx-eyebrow text-14 font-semibold text-(color:--mpx-grey)">New business</h2>
              <div data-menu-fade>
                <UnderlineLink
                  href="mailto:hello@themissingpixel.studio"
                  tabIndex={open ? 0 : -1}
                  className="font-mpx-head text-30 font-medium tracking-tight"
                >
                  hello@themissingpixel.studio
                </UnderlineLink>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 max-lg:gap-6 max-md:gap-5">
          <div data-menu-fade className="h-px w-full bg-(--mpx-white)/15" />
          <div className="grid grid-cols-4 gap-9 text-22 font-medium max-lg:gap-8 max-md:grid-cols-2 max-md:gap-6">
            {STUDIOS.map((item, index) => (
              <div key={item.city} data-menu-fade className="flex flex-col gap-3 max-lg:gap-2">
                <h2 className="mpx-eyebrow text-14 font-semibold text-(color:--mpx-grey)">
                  {item.city} <span className="tabular-nums">{times[index]}</span>
                </h2>
                <p>{item.address}</p>
              </div>
            ))}
          </div>
        </div>
    </ClipNav>
  );
};

export default Menu;

const STUDIOS = [
  { city: "Delhi", zone: "Asia/Kolkata", address: "14 Hauz Khas Village" },
  { city: "London", zone: "Europe/London", address: "22 Redchurch Street" },
  { city: "Dubai", zone: "Asia/Dubai", address: "Alserkal Avenue, Warehouse 47" },
  { city: "New York", zone: "America/New_York", address: "88 Walker Street" },
];