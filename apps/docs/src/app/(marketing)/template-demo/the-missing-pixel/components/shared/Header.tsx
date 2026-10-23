// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { useMagnetic } from "../Animations/useMagnetic";
import PixelButton from "../Buttons/PixelButton";
import { LogoMark } from "../Buttons/icons";
import SoundToggle from "../Sound/SoundToggle";
import { playSound } from "../Sound/pixelSfx";
import { COVERED_EVENT } from "../effects/pixel-transition";
const Menu = dynamic(() => import("./Menu"), { ssr: false });
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP);

const MENU_OPEN_LOCK = 1400;
const MENU_CLOSE_LOCK = 1250;

const Header = () => {
  const lenis = useLenis();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const barTopRef = useRef<HTMLSpanElement | null>(null);
  const barBottomRef = useRef<HTMLSpanElement | null>(null);
  const pixelRef = useRef<SVGRectElement | null>(null);
  const lastYRef = useRef(0);
  const menuLockRef = useRef(0);
  const hiddenRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const [onPhoto, setOnPhoto] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuReady, setMenuReady] = useState(false);
  const [instantClose, setInstantClose] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMenuReady(true), 2500);
    return () => window.clearTimeout(id);
  }, []);
  const [ctaDark, setCtaDark] = useState(false);

  useMagnetic(menuButtonRef, 0.2);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;
      setScrolled(y > 24);
      const hero = document.querySelector("[data-mpx-hero]");
      setOnPhoto(!!hero && hero.getBoundingClientRect().bottom > header.offsetHeight * 0.6);

      if (!document.documentElement.hasAttribute("data-mpx-menu-open") && Math.abs(delta) > 2) {
        const hide = delta > 0 && y > 400;
        if (hide !== hiddenRef.current) {
          hiddenRef.current = hide;
          gsap.to(header, {
            yPercent: hide ? -100 : 0,
            duration: prefersReducedMotion() ? 0 : 0.7,
            ease: "power3.out",
          });
        }
      }
      lastYRef.current = y;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const blocked = document.querySelectorAll<HTMLElement>("[data-mpx-inert]");

    if (menuOpen) {
      root.setAttribute("data-mpx-menu-open", "");
      blocked.forEach((el) => {
        el.inert = true;
      });
      lenis?.stop();
    } else {
      root.removeAttribute("data-mpx-menu-open");
      blocked.forEach((el) => {
        el.inert = false;
      });
      lenis?.start();
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen && performance.now() >= menuLockRef.current) {
        menuLockRef.current = performance.now() + MENU_CLOSE_LOCK;
        setMenuOpen(false);
        playSound("close");
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen, lenis]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCtaDark(menuOpen), prefersReducedMotion() || instantClose ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [menuOpen, instantClose]);

  useGSAP(
    () => {
      const icon = iconRef.current;
      const top = barTopRef.current;
      const bottom = barBottomRef.current;
      if (!icon || !top || !bottom) return;

      const duration = prefersReducedMotion() || instantClose ? 0 : 0.6;
      gsap.to(icon, { rotate: menuOpen ? 180 : 0, duration, ease: "power3.out" });
      gsap.to(top, { yPercent: menuOpen ? 0 : -200, rotate: menuOpen ? 45 : 0, duration, ease: "power3.out" });
      gsap.to(bottom, { yPercent: menuOpen ? 0 : 200, rotate: menuOpen ? -45 : 0, duration, ease: "power3.out" });

      if (menuOpen && headerRef.current) {
        hiddenRef.current = false;
        gsap.to(headerRef.current, { yPercent: 0, duration, ease: "power3.out" });
      }
    },
    { dependencies: [menuOpen] },
  );

  useEffect(() => {
    const handleCovered = () => {
      setInstantClose(true);
      menuLockRef.current = 0;
      setMenuOpen(false);
    };
    window.addEventListener(COVERED_EVENT, handleCovered);
    return () => window.removeEventListener(COVERED_EVENT, handleCovered);
  }, []);

  useEffect(() => {
    setInstantClose(true);
    menuLockRef.current = 0;
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    if (performance.now() < menuLockRef.current) return;
    menuLockRef.current = performance.now() + (menuOpen ? MENU_CLOSE_LOCK : MENU_OPEN_LOCK);
    setInstantClose(false);
    playSound(menuOpen ? "close" : "open");
    setMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuLockRef.current = performance.now() + MENU_CLOSE_LOCK;
    setMenuOpen(false);
    playSound("close");
  };

  const handleLogo = (event: MouseEvent<HTMLAnchorElement>) => {
    closeMenu();
    if (pathname !== ROUTES.home) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.5 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const dropPixel = (active: boolean) => {
    if (!pixelRef.current || prefersReducedMotion()) return;
    gsap.to(pixelRef.current, {
      x: active ? -3 : 0,
      y: active ? 6 : 0,
      duration: 0.6,
      ease: "expo.out",
    });
  };

  const sync = instantClose ? "duration-0 delay-0" : "duration-300 delay-700";
  const syncChild = instantClose
    ? "[&_[data-sound-toggle]]:delay-0 [&_[data-sound-toggle]]:duration-0"
    : "[&_[data-sound-toggle]]:delay-700";
  const rollDuration = instantClose ? "duration-0" : "duration-1150";
  const light = menuOpen || onPhoto;
  const solid = scrolled && !menuOpen && !onPhoto;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-80 border-b transition-[background-color,border-color,color] ${sync} motion-reduce:transition-none ${syncChild} motion-reduce:[&_[data-sound-toggle]]:transition-none ${
          solid ? "border-(--mpx-ink)/10 bg-(--mpx-paper)" : "border-transparent bg-transparent"
        } ${light ? "text-(color:--mpx-paper)" : "text-(color:--mpx-ink)"}`}
      >
        <div className="flex h-[9vh]  items-center justify-between gap-5 px-[5vw] max-lg:h-[7vh] max-lg:px-[6vw] max-md:h-[7.4vh] max-md:px-[7vw]">
          <Link
            href={ROUTES.home}
            onClick={handleLogo}
            onMouseEnter={() => dropPixel(true)}
            onMouseLeave={() => dropPixel(false)}
            aria-label="The Missing Pixel, home"
            className="flex items-center gap-2 text-22 font-medium leading-none tracking-tight"
          >
            <LogoMark
              className="size-[1.4vw] max-lg:size-[4vw] max-md:size-[6.5vw]"
              pixelRef={(el) => {
                pixelRef.current = el;
              }}
            />
            <span className="font-mpx-head">
              the missing <b className="font-bold">pixel</b>
            </span>
          </Link>

          <div className="flex items-center gap-2 max-lg:gap-3 max-md:gap-2">
            <SoundToggle inverted={light} />
            <div className="max-lg:hidden">
              <PixelButton
                label="Start A Project"
                href={ROUTES.contact}
                size="sm"
                tone={ctaDark ? "dark" : onPhoto ? "media" : "light"}
              />
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              data-menu-toggle
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mpx-menu"
              className={`font-mpx-head flex h-[5vh] items-center rounded-full border px-[0.3vw] text-22 transition-[border-color] ${sync} motion-reduce:transition-none font-medium max-lg:h-[5.2vh] max-lg:px-[0.8vw] max-md:aspect-square max-md:h-[5.8vh] max-md:justify-center max-md:border-transparent max-md:px-0 ${
                menuOpen ? "border-(--mpx-accent)/60" : onPhoto ? "border-(--mpx-white)/35" : "border-(--mpx-ink)/30"
              }`}
            >
              <span className="grid min-w-[4.4vw] overflow-hidden px-[1vw] text-left max-lg:min-w-[10vw] max-lg:px-[2.4vw] max-md:hidden">
                <span
                  aria-hidden={menuOpen}
                  className={`col-start-1 row-start-1 transition-transform ${rollDuration} ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none ${
                    menuOpen ? "-translate-y-full delay-100" : "translate-y-0 delay-0"
                  }`}
                >
                  Menu
                </span>
                <span
                  aria-hidden={!menuOpen}
                  className={`col-start-1 row-start-1 transition-transform ${rollDuration} ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none ${
                    menuOpen ? "translate-y-0 delay-100" : "translate-y-full delay-0"
                  }`}
                >
                  Close
                </span>
              </span>
              <span
                ref={iconRef}
                aria-hidden
                className={`relative flex aspect-square h-[3.7vh] items-center justify-center rounded-full transition-colors ${sync} motion-reduce:transition-none max-lg:h-[4vh] max-md:h-full ${
                  menuOpen ? "bg-(--mpx-accent) text-(color:--mpx-ink)" : onPhoto ? "bg-(--mpx-white) text-(color:--mpx-ink)" : "bg-(--mpx-ink) text-(color:--mpx-paper)"
                }`}
              >
                <span ref={barTopRef} className="absolute h-px w-[0.6vw] bg-current max-lg:w-[1.8vw] max-md:h-0.5 max-md:w-[3vw]" />
                <span ref={barBottomRef} className="absolute h-px w-[0.6vw] bg-current max-lg:w-[1.8vw] max-md:h-0.5 max-md:w-[3vw]" />
              </span>
            </button>
          </div>
        </div>
      </header>
      {(menuReady || menuOpen) && <Menu open={menuOpen} onClose={closeMenu} instant={instantClose} />}
    </>
  );
};

export default Header;
