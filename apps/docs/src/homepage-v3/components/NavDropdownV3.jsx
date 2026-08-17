"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/motion";
import HoverLinkV3 from "./HoverLinkV3";
import NavMenuIconV3 from "./NavMenuIconV3";
import { NAV_MENUS_V3 } from "./nav-menu-v3";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const CLOSED_CLIP = "inset(0% 0% 100% 0%)";
const OPEN_CLIP = "inset(0% 0% 0% 0%)";

function MenuItem({ item, onNavigate }) {
  return (
    <HoverLinkV3
      href={item.href}
      text={item.label}
      onClick={onNavigate}
      leading={
        <NavMenuIconV3
          src={item.icon}
          className="size-[1.2vw] text-light-grey transition-colors duration-300 group-hover:text-primary motion-reduce:transition-none"
        />
      }
      className="relative isolate px-[0.8vw] py-[0.55vw] text18 leading-[1.15] text-white/75 hover:text-white"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-top scale-y-0 bg-white/6 transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
      />
    </HoverLinkV3>
  );
}

/**
 * Full-width menu panel under the v3 navbar.
 *
 * @param {'categories'|'docs'|null} panel — which menu the bar wants open.
 *   The panel keeps rendering the last menu while it plays its close, so a
 *   null here is a request, not an immediate unmount.
 * @param {() => void} onNavigate — called when a row is clicked, so the bar can
 *   drop the menu before the route changes.
 */
export default function NavDropdownV3({ panel, onNavigate }) {
  const shellRef = useRef(null);
  const timelineRef = useRef(null);
  const revealedRef = useRef(false);
  const widthRef = useRef(0);
  const [visible, setVisible] = useState(null);

  // Adjusted during render rather than from an effect, so a menu-to-menu switch
  // lands in the same commit and the layout effect below always animates the
  // columns it just saw.
  if (panel && panel !== visible) setVisible(panel);

  useIsoLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const separators = shell.querySelectorAll("[data-nav-v3-sep]");
    const headings = shell.querySelectorAll("[data-nav-v3-head]");
    const rows = shell.querySelectorAll("[data-nav-v3-item]");
    const targets = [shell, ...separators, ...headings, ...rows];
    const reduce = prefersReducedMotion();

    // Every path below leaves a timeline running; killing it here covers both
    // the unmount and a hover that switches menus mid-animation. Killing the
    // timeline itself (not just its tweens) also stops a half-played close from
    // reporting complete and unmounting a panel that was re-opened.
    const cleanup = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(targets);
    };

    if (!panel) {
      revealedRef.current = false;

      if (reduce) {
        timelineRef.current = gsap.timeline({
          onComplete: () => setVisible(null),
        });
        timelineRef.current.to(shell, { opacity: 0, duration: 0.15 });

        return cleanup;
      }

      timelineRef.current = gsap
        .timeline({ onComplete: () => setVisible(null) })
        .to(
          rows,
          {
            opacity: 0,
            y: 8,
            duration: 0.18,
            ease: "power2.in",
            stagger: { each: 0.012, from: "end" },
          },
          0
        )
        .to(headings, { opacity: 0, duration: 0.15, ease: "power2.in" }, 0)
        .to(
          shell,
          {
            clipPath: CLOSED_CLIP,
            y: -6,
            duration: 0.34,
            ease: "power3.inOut",
          },
          0.06
        );

      return cleanup;
    }

    // A menu-to-menu switch keeps the shell where it is and only replays the
    // contents; only a cold open wipes the whole panel down.
    const fresh = !revealedRef.current;
    revealedRef.current = true;

    // The menus are different widths now, so a switch has to travel between
    // them: measure the natural width of the columns that just rendered, then
    // tween from the width the previous menu was showing.
    const previousWidth = widthRef.current;

    // clearProps, not `width: "auto"` — an inline auto would outrank `w-max`
    // and stretch the shell across both gutters instead of hugging its columns.
    gsap.set(shell, { clearProps: "width" });
    const naturalWidth = shell.getBoundingClientRect().width;
    widthRef.current = naturalWidth;

    const resizes =
      !fresh && previousWidth > 0 && Math.abs(previousWidth - naturalWidth) > 1;

    if (reduce) {
      gsap.set(shell, { clipPath: OPEN_CLIP, y: 0, opacity: 1 });
      gsap.set(separators, { scaleY: 1 });
      timelineRef.current = gsap.timeline();
      timelineRef.current.fromTo(
        [...headings, ...rows],
        { opacity: 0 },
        { opacity: 1, duration: 0.2, clearProps: "opacity" }
      );

      return cleanup;
    }

    const timeline = gsap.timeline();
    timelineRef.current = timeline;

    if (fresh) {
      timeline.fromTo(
        shell,
        { clipPath: CLOSED_CLIP, y: -10, opacity: 1 },
        { clipPath: OPEN_CLIP, y: 0, duration: 0.55, ease: "power3.inOut" },
        0
      );
    } else {
      gsap.set(shell, { clipPath: OPEN_CLIP, y: 0, opacity: 1 });
    }

    if (resizes) {
      timeline.fromTo(
        shell,
        { width: previousWidth },
        {
          width: naturalWidth,
          duration: 0.36,
          ease: "power3.out",
          // Back to `w-max` once it lands, so the panel keeps sizing itself.
          clearProps: "width",
        },
        0
      );
    }

    timeline
      .fromTo(
        separators,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: fresh ? 0.5 : 0.4,
          ease: "power3.out",
          stagger: 0.06,
        },
        fresh ? 0.12 : 0
      )
      .fromTo(
        headings,
        { opacity: 0, y: -8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.06,
          clearProps: "opacity,transform",
        },
        fresh ? 0.16 : 0.02
      )
      .fromTo(
        rows,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.03,
          clearProps: "opacity,transform",
        },
        fresh ? 0.22 : 0.06
      );

    return cleanup;
  }, [panel, visible]);

  const menu = visible ? NAV_MENUS_V3[visible] : null;
  if (!menu) return null;

  return (
    <div
      ref={shellRef}
      // `w-max` lets each menu size to its own columns — Docs has two, so it
      // comes out narrower than Categories instead of both sharing one width.
      // `mx-auto` centres it inside the left/right gutters, and `max-w-full`
      // keeps a long menu from spilling past them.
      className="absolute top-[85%] right-[3vw] left-[3vw] mx-auto w-max max-w-full border border-white/10 bg-[#121212] will-change-[clip-path]"
    >
      <div className="flex min-h-[19vw] w-full">
        {menu.columns.map((column, index) => (
          // A fixed column width is what makes the panel size to its menu:
          // three columns for Categories, two (so two thirds as wide) for Docs,
          // with the same generous gutter inside each either way.
          <div key={column.title} className="relative w-[23vw] shrink-0">
            {index > 0 && (
              <span
                data-nav-v3-sep
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-px origin-top bg-white/12"
              />
            )}

            <p
              data-nav-v3-head
              className="border-b border-white/10 bg-white/2 px-[1.5vw] py-[0.85vw] text18 flex items-center gap-[1vw] text-light-grey capitalize"
            >

              <span className="size-[.6vw] font-neue-haas bg-primary inline-block" />
              {column.title}
            </p>

            <div className="flex flex-col px-[0.8vw] py-[0.9vw]">
              {column.items.map((item) => (
                <div key={item.label} data-nav-v3-item>
                  <MenuItem item={item} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
