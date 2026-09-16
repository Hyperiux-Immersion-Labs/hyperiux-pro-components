"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

// Two bespoke curves drive the whole menu: a decelerating "out" curve for
// entrances and a symmetric "in-out" curve for exits.
const EASE_OUT_NAME = "contextShiftOut";
const EASE_IN_OUT_NAME = "contextShiftInOut";
if (!CustomEase.get(EASE_OUT_NAME)) {
  CustomEase.create(EASE_OUT_NAME, "M0,0 C0.3,0.9 0.1,1 1,1");
  CustomEase.create(EASE_IN_OUT_NAME, "M0,0 C0.7,0 0.16,1 1,1");
}

// Timing constants, kept together so the whole sequence can be retuned at once.
const PAGE_TILT = 0.72;
const GLYPH = 0.45;
const LINK_STAGGER = 0.055;
const RULE_WIPE = 0.6;
const CLOSE_SPAN = 0.58;
const LINK_OUT = 0.22;
const DRAWER_SLIDE = 0.55;
const SUBLINK_IN = 0.45;
const SUBLINK_STAGGER = 0.05;
const SUB_OFFSET = -20;
const SWAP_OUT = 0.16;
const ACC_SPAN = 0.46;
const ACC_ITEM = 0.32;
const ACC_STAGGER = 0.045;
const LINKS_START = 0.2736;

type Phase = "closed" | "opening" | "open" | "closing";

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  key?: string;
  items?: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Effects",
    href: "",
    key: "effects",
    items: [
      { label: "Text", href: "" },
      { label: "Navigation", href: "" },
      { label: "Buttons", href: "" },
      { label: "Transitions", href: "" },
      { label: "Backgrounds", href: "" },
    ],
  },
  {
    label: "Components",
    href: "",
    key: "components",
    items: [
      { label: "Carousels", href: "" },
      { label: "Cursor", href: "" },
      { label: "Loaders", href: "" },
      { label: "Scroll", href: "" },
      { label: "WebGL", href: "" },
    ],
  },
  { label: "Docs", href: "" },
  { label: "Pricing", href: "" },
  { label: "Home", href: "" },
];

const SUB_LINKS: SubItem[] = [
  { label: "All Effects", href: "" },
  { label: "Documentation", href: "" },
  { label: "Pricing", href: "" },
];

const SOCIALS: SubItem[] = [
  { label: "GitHub", href: "" },
  { label: "X", href: "" },
  { label: "LinkedIn", href: "" },
  { label: "Instagram", href: "" },
];

const CONTACT_EMAIL = "hello@hyperiux.com";

// Same per-character roll as unfold-navbar's LinkHover, but as a bare span so
// it can live inside the parent <button> that opens the drawer.
const CharRoll = ({ text, stagger = 0.015 }: { text: string; stagger?: number }) => (
  <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.2]">
    {[...text].map((char, i) => (
      <span
        key={i}
        className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] text-shadow-[0_1.2em_currentColor] group-hover/row:translate-y-[-1.2em] group-focus-visible/row:translate-y-[-1.2em]"
        style={{ transitionDelay: `${i * stagger}s` }}
      >
        {char === " " ? " " : char}
      </span>
    ))}
  </span>
);

// The separator rules and the drawer seam are scale-driven off custom
// properties so GSAP can tween them; @property registration has no Tailwind
// equivalent, so this stays as the one minimal style block.
const PROPERTY_REGISTRATION = `
@property --shift-rule { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --shift-seam { syntax: "<number>"; inherits: false; initial-value: 0; }
`;

// Links default to "" so consumers can wire their own routes. An empty href
// would still navigate to the current route, so those clicks are swallowed.
const inert = (href: string) => (e: ReactMouseEvent) => {
  if (!href) e.preventDefault();
};

const CaretIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="block h-full w-full">
    <path
      d="M6 3.5L10.5 8L6 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ContextShiftMenuProps {
  /** The page content. It sits inside the surface that tilts away on open. */
  children?: ReactNode;
}

const ContextShiftMenu = ({ children }: ContextShiftMenuProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const subpanelRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const glyphPageRef = useRef<HTMLSpanElement>(null);
  const glyphColRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openTl = useRef<gsap.core.Timeline | null>(null);
  const closeTl = useRef<gsap.core.Timeline | null>(null);
  const drawerTl = useRef<gsap.core.Timeline | null>(null);
  const accTl = useRef<gsap.core.Timeline | null>(null);

  const phaseRef = useRef<Phase>("closed");
  const drawerOpen = useRef(false);
  const activeKey = useRef<string | null>(null);
  const renderedKey = useRef<string | null>(null);
  const pendingKey = useRef<string | null>(null);
  const scrollLock = useRef(0);

  const [phase, setPhase] = useState<Phase>("closed");
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const page = pageRef.current;
    const surface = surfaceRef.current;
    const dim = dimRef.current;
    const subpanel = subpanelRef.current;
    const stack = stackRef.current;
    if (!wrap || !page || !surface || !dim || !subpanel || !stack) return;

    // Re-bound as consts so narrowing survives inside the hoisted functions.
    const wrapEl = wrap;
    const pageEl = page;
    const surfaceEl = surface;
    const dimEl = dim;
    const subpanelEl = subpanel;
    const stackEl = stack;

    const ctx = gsap.context(() => {
      const labels = gsap.utils.toArray<HTMLElement>("[data-shift-label]", surfaceEl);
      const links = gsap.utils.toArray<HTMLElement>("[data-shift-link]", surfaceEl);
      const sublinks = gsap.utils.toArray<HTMLElement>("[data-shift-sublink]", surfaceEl);

      const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
      const canHover = () => window.matchMedia("(hover: hover)").matches;

      const setPhaseState = (next: Phase) => {
        phaseRef.current = next;
        wrapEl.dataset.shiftPhase = next;
        setPhase(next);
      };

      // Lock the pageEl where it is. Using fixed + a negative offset keeps the
      // exact mid-scroll position instead of snapping to the top, and the
      // scrollbar gutter is replaced so nothing shifts sideways.
      const lockScroll = () => {
        scrollLock.current = window.scrollY;
        const gutter = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollLock.current}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
      };

      const unlockScroll = () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, scrollLock.current);
      };

      const listFor = (key: string) =>
        stackEl.querySelector<HTMLElement>(`[data-shift-sublist="${key}"]`);

      const labelsFor = (el: HTMLElement | null) =>
        el ? gsap.utils.toArray<HTMLElement>("[data-shift-sublabel]", el) : [];

      const rowsOf = (els: HTMLElement[]) =>
        els.map((el) => el.parentElement).filter(Boolean) as HTMLElement[];

      // Align the drawer list with the parent link that opened it, so the
      // first sub-item sits on the same baseline as its trigger.
      const alignOffset = (key: string) => {
        if (isMobile()) return null;
        const parent = surfaceEl.querySelector<HTMLElement>(`[data-shift-parent="${key}"]`);
        const list = listFor(key);
        const items = list?.querySelector<HTMLElement>("[data-shift-subitems]");
        if (!parent || !items) return null;
        const current = parseFloat(gsap.getProperty(stackEl, "y") as string) || 0;
        return current + (parent.getBoundingClientRect().top - items.getBoundingClientRect().top);
      };

      const accFor = (key: string) =>
        surfaceEl.querySelector<HTMLElement>(`[data-shift-acc="${key}"]`);

      const accItems = (el: HTMLElement | null) =>
        el ? gsap.utils.toArray<HTMLElement>("[data-shift-acc-item]", el) : [];

      // Mobile: expand the sub-list inline under its parent. Animating height
      // to the measured content height is what pushes the links below it down.
      const openAcc = (key: string) => {
        const panel = accFor(key);
        if (!panel) return;
        const items = accItems(panel);

        accTl.current?.kill();
        const tl = gsap.timeline({ defaults: { ease: EASE_OUT_NAME } });

        gsap.set(panel, { height: "auto" });
        const target = panel.offsetHeight;
        gsap.set(panel, { height: 0 });
        gsap.set(items, { autoAlpha: 0, y: 10 });

        tl.to(panel, {
          height: target,
          duration: ACC_SPAN,
          onComplete: () => gsap.set(panel, { height: "auto" }),
        }, 0);
        tl.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: ACC_ITEM,
          stagger: ACC_STAGGER,
          overwrite: "auto",
        }, 0.08);

        accTl.current = tl;
      };

      const closeAcc = (key: string | null) => {
        const panel = key ? accFor(key) : null;
        if (!panel) return;
        accTl.current?.kill();
        const tl = gsap.timeline({ defaults: { ease: EASE_IN_OUT_NAME } });
        tl.to(accItems(panel), {
          autoAlpha: 0,
          y: -6,
          duration: ACC_ITEM * 0.6,
          overwrite: "auto",
        }, 0);
        tl.to(panel, { height: 0, duration: ACC_SPAN * 0.8 }, 0.04);
        accTl.current = tl;
      };

      const resetAcc = () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-shift-acc]", surfaceEl);
        panels.forEach((panel) => {
          gsap.set(panel, { height: 0 });
          gsap.set(accItems(panel), { autoAlpha: 0, y: 10 });
        });
      };

      const resetDrawer = () => {
        const allLabels = gsap.utils.toArray<HTMLElement>("[data-shift-sublabel]", stackEl);
        gsap.set(subpanelEl, { "--shift-seam": 0, x: isMobile() ? "100%" : "-100%", opacity: 1 });
        subpanelEl.style.visibility = "hidden";
        subpanelEl.setAttribute("aria-hidden", "true");
        if (allLabels.length) {
          gsap.set(allLabels, { autoAlpha: 0, xPercent: SUB_OFFSET, force3D: true });
          gsap.set(rowsOf(allLabels), { "--shift-rule": 0 });
        }
      };

      // Each open drawer level pushes the pageEl one step further back.
      const leanPage = (depth: number) => {
        if (isMobile()) return;
        gsap.to(pageEl, {
          rotationY: -20 - 4 * depth,
          duration: DRAWER_SLIDE,
          ease: EASE_OUT_NAME,
          overwrite: "auto",
          force3D: true,
        });
      };

      const buildOpen = () => {
        openTl.current?.kill();
        const mobile = isMobile();

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: EASE_OUT_NAME, force3D: true },
          onStart: () => {
            surfaceEl.removeAttribute("inert");
            surfaceEl.setAttribute("aria-hidden", "false");
            surfaceEl.style.visibility = "visible";
            setPhaseState("opening");
          },
          onComplete: () => {
            setPhaseState("open");
            if (pendingKey.current) {
              const key = pendingKey.current;
              pendingKey.current = null;
              openDrawer(key);
            }
          },
        });

        if (glyphPageRef.current) {
          tl.to(glyphPageRef.current, { rotationY: -52, duration: GLYPH, ease: EASE_OUT_NAME }, 0);
        }
        if (glyphColRef.current) {
          tl.to(glyphColRef.current, { scaleX: 1, duration: GLYPH * 0.8, ease: EASE_OUT_NAME }, 0.0675);
        }

        if (mobile) {
          tl.to(pageEl, {
            scale: 0.94,
            opacity: 0.55,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            duration: PAGE_TILT,
          }, 0);
          tl.to(surfaceEl, { x: 0, duration: 0.62 }, 0);
          tl.to(dimEl, { opacity: 1, duration: 0.612, ease: "power2.out" }, 0);
        } else {
          tl.to(surfaceEl, { x: 0, duration: 0.62 }, 0);
          tl.to(pageEl, {
            rotationY: -20,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            duration: PAGE_TILT,
          }, 0);
          tl.to(dimEl, { opacity: 1, duration: 0.612, ease: "power2.out", force3D: false }, 0);
        }

        labels.forEach((el, i) => {
          tl.to(el, {
            autoAlpha: 1,
            xPercent: 0,
            duration: 0.52,
            overwrite: "auto",
          }, LINKS_START + i * LINK_STAGGER);
        });

        if (links.length) {
          tl.to(links, { "--shift-rule": 1, duration: RULE_WIPE, stagger: LINK_STAGGER }, LINKS_START);
        }

        const tail = LINKS_START + (labels.length - 1) * LINK_STAGGER + 0.26;
        sublinks.forEach((el, i) => {
          tl.to(el, {
            autoAlpha: 1,
            xPercent: 0,
            duration: 0.38,
            overwrite: "auto",
          }, tail + 0.04 * i);
        });

        if (metaRef.current) {
          tl.to(metaRef.current, {
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
          }, tail + 0.04 * sublinks.length + 0.06);
        }

        openTl.current = tl;
        return tl;
      };

      // Swap one drawer list for another without closing the drawer.
      const swapDrawer = (key: string) => {
        const list = listFor(key);
        if (!list) return;
        const outgoing = labelsFor(renderedKey.current ? listFor(renderedKey.current) : null);
        const incoming = labelsFor(list);

        activeKey.current = key;
        setOpenKey(key);
        drawerTl.current?.kill();

        const tl = gsap.timeline({ defaults: { ease: EASE_OUT_NAME, force3D: true } });
        tl.to(subpanelEl, { x: 0, duration: DRAWER_SLIDE, overwrite: "auto" }, 0);
        leanPage(1);

        if (outgoing.length) {
          tl.to(outgoing, {
            autoAlpha: 0,
            xPercent: 20,
            duration: SWAP_OUT,
            ease: "power2.in",
            stagger: 0.02,
            overwrite: "auto",
          }, 0);
        }

        tl.call(() => {
          renderedKey.current = key;
          if (incoming.length) {
            gsap.set(incoming, { autoAlpha: 0, xPercent: SUB_OFFSET, force3D: true });
            gsap.set(rowsOf(incoming), { "--shift-rule": 0 });
          }
          const offset = alignOffset(key);
          if (offset !== null) {
            gsap.to(stackEl, {
              y: offset,
              duration: SUBLINK_IN,
              ease: EASE_OUT_NAME,
              overwrite: "auto",
              force3D: true,
            });
          }
        }, undefined, 0.18);

        if (incoming.length) {
          tl.to(incoming, {
            autoAlpha: 1,
            xPercent: 0,
            duration: SUBLINK_IN,
            stagger: SUBLINK_STAGGER,
            overwrite: "auto",
          }, 0.2);
          tl.to(rowsOf(incoming), {
            "--shift-rule": 1,
            duration: RULE_WIPE,
            stagger: SUBLINK_STAGGER,
          }, 0.2);
        }

        drawerTl.current = tl;
      };

      function openDrawer(key: string) {
        if (phaseRef.current === "opening") {
          pendingKey.current = key;
          return;
        }
        if (phaseRef.current !== "open") return;

        // Mobile: inline accordion, one open at a time.
        if (isMobile()) {
          if (drawerOpen.current && activeKey.current === key) {
            closeAcc(key);
            drawerOpen.current = false;
            activeKey.current = null;
            setOpenKey(null);
            return;
          }
          if (drawerOpen.current) closeAcc(activeKey.current);
          drawerOpen.current = true;
          activeKey.current = key;
          renderedKey.current = key;
          setOpenKey(key);
          openAcc(key);
          return;
        }

        if (drawerOpen.current && activeKey.current === key) {
          closeDrawer(false);
          return;
        }
        if (drawerOpen.current) {
          swapDrawer(key);
          return;
        }

        const list = listFor(key);
        if (!list) return;
        const incoming = labelsFor(list);

        drawerOpen.current = true;
        activeKey.current = key;
        renderedKey.current = key;
        setOpenKey(key);

        subpanelEl.removeAttribute("inert");
        subpanelEl.setAttribute("aria-hidden", "false");
        subpanelEl.style.visibility = "visible";

        const offset = alignOffset(key);
        if (offset !== null) gsap.set(stackEl, { y: offset });
        if (incoming.length) {
          gsap.set(incoming, { autoAlpha: 0, xPercent: SUB_OFFSET, force3D: true });
        }

        drawerTl.current?.kill();
        const tl = gsap.timeline({ defaults: { ease: EASE_OUT_NAME, force3D: true } });
        tl.to(subpanelEl, { "--shift-seam": 1, duration: DRAWER_SLIDE }, 0);
        tl.to(subpanelEl, { x: 0, duration: DRAWER_SLIDE }, 0);

        if (incoming.length) {
          tl.to(incoming, {
            autoAlpha: 1,
            xPercent: 0,
            duration: SUBLINK_IN,
            stagger: SUBLINK_STAGGER,
            overwrite: "auto",
          }, 0.12);
          tl.to(rowsOf(incoming), {
            "--shift-rule": 1,
            duration: RULE_WIPE,
            stagger: SUBLINK_STAGGER,
          }, 0.12);
        }

        leanPage(1);
        drawerTl.current = tl;
      }

      function closeDrawer(withMenu: boolean) {
        if (!drawerOpen.current) return;
        const wasKey = activeKey.current;
        drawerOpen.current = false;
        activeKey.current = null;
        setOpenKey(null);

        if (isMobile()) {
          closeAcc(wasKey);
          return;
        }

        subpanelEl.setAttribute("aria-hidden", "true");

        const mobile = isMobile();
        drawerTl.current?.kill();

        const tl = gsap.timeline({
          defaults: { ease: EASE_IN_OUT_NAME, force3D: true },
          onComplete: resetDrawer,
        });
        tl.to(subpanelEl, { "--shift-seam": 0, duration: 0.33 }, 0);

        if (withMenu) {
          const off = mobile ? "-100%" : -(surfaceEl.offsetWidth + subpanelEl.offsetWidth);
          tl.to(subpanelEl, { x: off, duration: CLOSE_SPAN }, 0);
        } else {
          tl.to(subpanelEl, { x: mobile ? "100%" : "-100%", duration: DRAWER_SLIDE * 0.8 }, 0);
          leanPage(0);
        }

        drawerTl.current = tl;
      }

      function openMenu() {
        if (phaseRef.current === "open" || phaseRef.current === "opening") return;
        if (phaseRef.current === "closing") closeTl.current?.pause();

        drawerTl.current?.kill();
        drawerOpen.current = false;
        activeKey.current = null;
        renderedKey.current = null;
        pendingKey.current = null;
        setOpenKey(null);
        resetDrawer();
        resetAcc();
        lockScroll();
        buildOpen().restart();
      }

      function closeMenu() {
        if (phaseRef.current === "closed" || phaseRef.current === "closing") return;
        if (phaseRef.current === "opening") openTl.current?.pause();
        pendingKey.current = null;
        if (drawerOpen.current) closeDrawer(true);

        closeTl.current?.kill();
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: EASE_IN_OUT_NAME, force3D: true },
          onStart: () => setPhaseState("closing"),
          onComplete: () => {
            surfaceEl.setAttribute("inert", "");
            surfaceEl.setAttribute("aria-hidden", "true");
            surfaceEl.style.visibility = "hidden";
            gsap.set(surfaceEl, { x: "-100%" });
            gsap.set(links, { "--shift-rule": 0 });
            if (labels.length) {
              gsap.killTweensOf(labels);
              gsap.set(labels, { x: 0 });
            }
            setPhaseState("closed");
            unlockScroll();
          },
        });

        labels.forEach((el, i) => {
          tl.to(el, {
            autoAlpha: 0,
            xPercent: -18,
            duration: LINK_OUT,
            ease: "power2.in",
            overwrite: "auto",
          }, 0.025 * i);
        });

        if (sublinks.length) {
          tl.to(sublinks, {
            autoAlpha: 0,
            xPercent: -22,
            duration: LINK_OUT * 0.8,
            ease: "power2.in",
          }, 0);
        }
        if (metaRef.current) {
          tl.to(metaRef.current, { opacity: 0, duration: 0.18, ease: "power2.out" }, 0);
        }
        if (glyphPageRef.current) {
          tl.to(glyphPageRef.current, { rotationY: 0, duration: CLOSE_SPAN * 0.7 }, 0.11);
        }
        if (glyphColRef.current) {
          tl.to(glyphColRef.current, { scaleX: 0, duration: CLOSE_SPAN * 0.7 }, 0.11);
        }

        const at = LINK_OUT * 0.55;
        tl.to(surfaceEl, { x: "-100%", duration: CLOSE_SPAN }, at);
        tl.to(pageEl, {
          rotationY: 0,
          scale: 1,
          x: 0,
          opacity: 1,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          duration: CLOSE_SPAN,
          overwrite: "auto",
        }, at);
        tl.to(dimEl, { opacity: 0, duration: CLOSE_SPAN * 0.7, ease: "power2.out" }, at);

        closeTl.current = tl;
        tl.restart();
      }

      const toggleMenu = () => {
        if (phaseRef.current === "open" || phaseRef.current === "opening") closeMenu();
        else openMenu();
      };

      // --- initial state -------------------------------------------------
      gsap.set(pageEl, {
        rotationY: 0,
        scale: 1,
        x: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        transformOrigin: "right center",
      });
      gsap.set(dimEl, { opacity: 0 });
      gsap.set(surfaceEl, { x: "-100%" });
      gsap.set(labels, { autoAlpha: 0, xPercent: -18, force3D: true });
      gsap.set(links, { "--shift-rule": 0 });
      gsap.set(sublinks, { autoAlpha: 0, xPercent: -22, force3D: true });
      if (metaRef.current) gsap.set(metaRef.current, { opacity: 0 });
      if (glyphPageRef.current) {
        gsap.set(glyphPageRef.current, { rotationY: 0, transformOrigin: "right center" });
      }
      if (glyphColRef.current) {
        gsap.set(glyphColRef.current, { scaleX: 0, transformOrigin: "left center" });
      }
      surfaceEl.setAttribute("inert", "");
      surfaceEl.setAttribute("aria-hidden", "true");
      surfaceEl.style.visibility = "hidden";
      resetDrawer();
      resetAcc();
      setPhaseState("closed");

      // --- listeners -----------------------------------------------------
      const trigger = triggerRef.current;
      trigger?.addEventListener("click", toggleMenu);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        if (drawerOpen.current) closeDrawer(false);
        else if (phaseRef.current === "open" || phaseRef.current === "opening") closeMenu();
      };
      document.addEventListener("keydown", onKeyDown);

      const onDimClick = () => {
        if (phaseRef.current === "open") closeMenu();
      };
      dimEl.addEventListener("click", onDimClick);

      const back = subpanelEl.querySelector<HTMLElement>("[data-shift-back]");
      const onBack = () => closeDrawer(false);
      back?.addEventListener("click", onBack);

      const parents = gsap.utils.toArray<HTMLElement>("[data-shift-parent]", surfaceEl);
      const parentCleanups = parents.map((el) => {
        const key = el.dataset.shiftParent as string;
        // Hover targets the label + caret, not the empty space past the text.
        const hot = el.querySelector<HTMLElement>("[data-shift-label]") ?? el;

        const enter = () => {
          if (canHover() && !isMobile() && !(drawerOpen.current && activeKey.current === key)) {
            openDrawer(key);
          }
        };
        const leave = () => {
          if (pendingKey.current === key) pendingKey.current = null;
        };
        const click = () => {
          // On hover-capable desktops mouseenter already opened (or queued)
          // this drawer; re-entering openDrawer here would stack a second one.
          if (canHover() && !isMobile()) {
            if (pendingKey.current === key || activeKey.current === key) return;
          }
          openDrawer(key);
        };
        hot.addEventListener("mouseenter", enter);
        hot.addEventListener("mouseleave", leave);
        el.addEventListener("click", click);
        return () => {
          hot.removeEventListener("mouseenter", enter);
          hot.removeEventListener("mouseleave", leave);
          el.removeEventListener("click", click);
        };
      });

      // Nudge the label on hover; hovering a leaf link tucks the drawer away.
      const linkCleanups = links.map((el) => {
        const label = el.querySelector<HTMLElement>("[data-shift-label]");
        if (!label) return () => {};
        const isParent = el.hasAttribute("data-shift-parent");

        // The row stays full width for the separator rule, so the nudge binds
        // to the label itself - hovering the empty space past the text does
        // nothing.
        const enter = () => {
          if (phaseRef.current !== "open") return;
          gsap.to(label, { x: 6, duration: 0.28, ease: EASE_OUT_NAME, overwrite: "auto", force3D: true });
        };
        const leave = () => {
          gsap.to(label, { x: 0, duration: 0.28, ease: EASE_OUT_NAME, overwrite: "auto", force3D: true });
        };
        label.addEventListener("mouseenter", enter);
        label.addEventListener("mouseleave", leave);

        // Closing the drawer still belongs to the whole row: sweeping anywhere
        // across a link with no sublist should tuck an open drawer away.
        const rowEnter = () => {
          if (phaseRef.current !== "open") return;
          if (!isParent && drawerOpen.current && canHover() && !isMobile()) closeDrawer(false);
        };
        el.addEventListener("mouseenter", rowEnter);

        return () => {
          label.removeEventListener("mouseenter", enter);
          label.removeEventListener("mouseleave", leave);
          el.removeEventListener("mouseenter", rowEnter);
        };
      });

      // Leaving both columns for anywhere else tucks the drawer back.
      const onColumnLeave = (e: MouseEvent) => {
        if (!drawerOpen.current || !canHover() || isMobile()) return;
        const to = e.relatedTarget as Node | null;
        if (to && (surfaceEl.contains(to) || subpanelEl.contains(to))) return;
        closeDrawer(false);
      };
      surfaceEl.addEventListener("mouseleave", onColumnLeave);
      subpanelEl.addEventListener("mouseleave", onColumnLeave);

      let resizeId: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeId);
        resizeId = setTimeout(() => {
          if (phaseRef.current === "open" || phaseRef.current === "opening") closeMenu();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      return () => {
        trigger?.removeEventListener("click", toggleMenu);
        document.removeEventListener("keydown", onKeyDown);
        dimEl.removeEventListener("click", onDimClick);
        back?.removeEventListener("click", onBack);
        parentCleanups.forEach((fn) => fn());
        linkCleanups.forEach((fn) => fn());
        surfaceEl.removeEventListener("mouseleave", onColumnLeave);
        subpanelEl.removeEventListener("mouseleave", onColumnLeave);
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeId);
        unlockScroll();
      };
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const lit = phase === "open" || phase === "opening";

  return (
    <>
      <style>{PROPERTY_REGISTRATION}</style>

      {/* Header: fixed sibling, so it stays put while the page scrolls and
          is outside the perspective/transform context that would break it. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-300 flex items-center justify-between p-[2.1vw] max-[1025px]:p-[3vw] max-md:p-[5vw]">
        <Link
          href=""
          onClick={inert("")}
          aria-label="Hyperiux"
          className={`pointer-events-auto block text-[1.1vw] font-medium tracking-[-0.02em] transition-[color,opacity] duration-400 ease-out max-[1025px]:text-[2vw] max-md:text-[4vw] ${
            lit ? "text-[#fffaf2]/90" : "text-[#111111]"
          } ${lit ? "max-md:pointer-events-none max-md:opacity-0" : ""}`}
        >
          HYPERIUX
        </Link>

        {/* Closed: an outlined page next to a hidden column. Open: the page
            tilts away on its right edge while the column slides in. */}
        <button
          type="button"
          ref={triggerRef}
          data-shift-trigger
          aria-expanded={lit}
          aria-controls="context-shift-surface"
          aria-label={lit ? "Close navigation" : "Open navigation"}
          className="pointer-events-auto relative z-301 flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent p-0"
        >
          <span className="relative block h-4 w-6 perspective-[90px]" aria-hidden="true">
            <span
              ref={glyphColRef}
              className={`absolute top-px left-0 block h-3.5 w-0.75 origin-left transition-colors duration-350 ${
                lit ? "bg-[#fffaf2]/90" : "bg-[#111111]"
              }`}
            />
            <span
              ref={glyphPageRef}
              className={`absolute top-px right-0 block h-3.5 w-4.75 origin-right border-[1.5px] transition-colors duration-350 ${
                lit ? "border-[#fffaf2]/90" : "border-[#111111]"
              }`}
            />
          </span>
        </button>
      </header>


      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden bg-[#0e0e0e] perspective-[1200px] perspective-origin-[50%_40%]"
      >
        {/* The page. Its content is whatever the consumer passes as children;
            it is this surface that tilts away when the menu opens. */}
        <div
          ref={pageRef}
          className="relative w-full origin-right overflow-hidden bg-[#e8e6e1] will-change-transform"
        >
          {children}
        </div>

      </div>

        {/* Dim overlay between the receded page and the nav column */}
        <div
          ref={dimRef}
          aria-hidden="true"
          className={`fixed inset-0 z-50 bg-black/40 ${
            phase === "open" ? "pointer-events-auto" : "pointer-events-none"
          }`}
        />

        {/* Nav column */}
        <div
          id="context-shift-surface"
          ref={surfaceRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="invisible fixed top-0 left-0 z-200 flex h-screen w-[22vw] flex-col justify-between bg-[#0e0e0e] px-[2.1vw] py-[5.2vw] max-[1025px]:w-[38vw] max-[1025px]:px-[3vw] max-[1025px]:py-[7vw] max-md:w-full max-md:px-[5vw] max-md:py-[12vw]"
        >
          <nav
            aria-label="Main navigation"
            className="-ml-10 flex flex-1 flex-col overflow-y-auto pl-10 max-md:justify-end"
          >
            <ul className="mt-auto mb-0 list-none p-0">
              {NAV_ITEMS.map((item) => {
                const isParent = Boolean(item.items);
                const expanded = isParent && openKey === item.key;
                const shared =
                  "relative flex w-full items-baseline justify-between gap-3 py-3.25 text-left no-underline after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-[#fffaf2]/10 after:[transform:scaleX(var(--shift-rule,0))] after:content-['']";

                const label = (
                  <span
                    data-shift-label
                    className={`group/row w-fit text-[clamp(26px,min(2.9vw,4.8vh),46px)] leading-[1.05] font-light tracking-[-0.03em] transition-colors duration-250 ${
                      expanded ? "text-white" : "text-[#fffaf2]/70"
                    } hover:text-white`}
                  >
                    <span className="sr-only">{item.label}</span>
                    <CharRoll text={item.label} />
                  </span>
                );

                const caret = (
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 flex-shrink-0 self-center transition-[transform,color,opacity] duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      lit ? "opacity-55" : "opacity-0"
                    } ${expanded ? "rotate-90 text-[#fffaf2]/90 opacity-100" : "text-[#fffaf2]/40"}`}
                  >
                    <CaretIcon />
                  </span>
                );

                return (
                  <li key={item.label} className="relative last:[&>*]:after:content-none">
                    {isParent ? (
                      <button
                        type="button"
                        data-shift-link
                        data-shift-parent={item.key}
                        aria-expanded={expanded}
                        aria-controls="context-shift-subpanel"
                        className={`${shared} cursor-pointer border-none bg-transparent font-[inherit] text-[#fffaf2]/90 group`}
                      >
                        {label}
                        {caret}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={inert(item.href)}
                        data-shift-link
                        className={`${shared} text-[#fffaf2]/90`}
                      >
                        <span
                          data-shift-label
                          className="group/row w-fit text-[clamp(26px,min(2.9vw,4.8vh),46px)] leading-[1.05] font-light tracking-[-0.03em] text-[#fffaf2]/70 transition-colors duration-250 hover:text-white"
                        >
                          <span className="sr-only">{item.label}</span>
                          <CharRoll text={item.label} />
                        </span>
                      </Link>
                    )}

                    {/* Mobile only: the sub-list expands inline beneath its
                        parent, so the links below it slide down. Desktop keeps
                        the side drawer and never renders this open. */}
                    {isParent && (
                      <div
                        data-shift-acc={item.key}
                        className="hidden h-0 overflow-hidden max-md:block"
                        aria-hidden={!expanded}
                      >
                        <ul className="m-0 flex list-none flex-col gap-2 p-0 pb-[4vw]">
                          {item.items?.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                href={sub.href}
                                onClick={inert(sub.href)}
                                data-shift-acc-item
                                className="group/sub block w-fit  text-[3.8vw] leading-[1.2] font-light tracking-[-0.01em] text-[#fffaf2]/50 no-underline transition-colors duration-250 hover:text-white"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <ul className="mt-5 mb-auto flex list-none flex-col gap-1 p-0">
              {SUB_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={inert(link.href)}
                    data-shift-sublink
                    className="block py-0.5 text-[0.8rem] font-light tracking-[0.04em] text-[#fffaf2]/40 no-underline transition-colors duration-220 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div ref={metaRef} className="mt-auto flex flex-col gap-1.5 opacity-0">
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[0.75rem] font-normal tracking-[0.05em] text-[#fffaf2]/70 no-underline"
            >
              {CONTACT_EMAIL}
            </Link>
            <span className="flex gap-3">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={inert(s.href)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.7rem] font-normal tracking-[0.06em] text-[#fffaf2]/40 uppercase no-underline transition-colors duration-220 hover:text-white"
                >
                  {s.label}
                </Link>
              ))}
            </span>
          </div>
        </div>

        {/* Drawer: a second column that slides out from behind the nav column */}
        <div
          id="context-shift-subpanel"
          ref={subpanelRef}
          aria-hidden="true"
          className="invisible fixed top-0 left-[22vw] z-150 flex h-screen w-[18vw] flex-col justify-start bg-[#0e0e0e] px-[2.1vw] py-[5.2vw] before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:origin-bottom before:bg-[#fffaf2]/10 before:[transform:scaleY(var(--shift-seam,0))] before:content-[''] max-[1025px]:left-[38vw] max-[1025px]:w-[30vw] max-[1025px]:px-[3vw] max-[1025px]:py-[7vw] max-md:left-0 max-md:z-210 max-md:w-full max-md:px-[5vw] max-md:py-[12vw]"
        >
          <button
            type="button"
            data-shift-back
            className="absolute top-[5vw] left-[5vw] hidden h-11 cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-[inherit] text-[0.75rem] font-normal tracking-[0.06em] text-[#fffaf2]/70 uppercase max-md:flex"
          >
            <span aria-hidden="true" className="h-3.5 w-3.5">
              <svg viewBox="0 0 16 16" fill="none" className="block h-full w-full">
                <path
                  d="M10 3.5L5.5 8L10 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Back</span>
          </button>

          <div ref={stackRef} className="grid">
            {NAV_ITEMS.filter((i) => i.items).map((item) => (
              <div
                key={item.key}
                data-shift-sublist={item.key}
                className={`[grid-area:1/1] ${openKey === item.key ? "visible" : "invisible"}`}
              >
                <ul data-shift-subitems className="m-0 list-none p-0">
                  {item.items?.map((sub) => (
                    <li key={sub.label} className="relative last:[&>*]:after:content-none">
                      <Link
                        href={sub.href}
                        onClick={inert(sub.href)}
                        className="group/sub relative block py-3 no-underline after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-[#fffaf2]/[0.06] after:[transform:scaleX(var(--shift-rule,0))] after:content-['']"
                      >
                        <span
                          data-shift-sublabel
                          className="inline-block w-fit text-[1.15rem] leading-[1.2] font-medium tracking-[-0.01em] text-[#fffaf2]/70 transition-colors duration-250 group-hover/sub:text-white"
                        >
                          {sub.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
    </>
  );
};

export default ContextShiftMenu;
