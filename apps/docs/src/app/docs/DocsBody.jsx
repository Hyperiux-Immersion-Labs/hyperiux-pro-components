"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RouteFade } from "@/components/layout/RouteFade";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function RouteAnimationSync({ syncKey }) {
  const refreshCallRef = useRef(null);

  useEffect(() => {
    refreshCallRef.current?.kill();

    refreshCallRef.current = gsap.delayedCall(0.12, () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
        });
      });
    });

    return () => {
      refreshCallRef.current?.kill();
    };
  }, [syncKey]);

  return null;
}

function TableOfContents({ containerRef, watchKey }) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const lenis = useLenis();
  const activeLockRef = useRef({ id: "", targetTop: 0, timeoutId: null });
  const scrollTweenRef = useRef(null);

  const onTocClick = (e, id) => {
    e.preventDefault();

    const el = document.getElementById(id);

    if (!el) return;

    const topOffset = window.innerHeight * 0.2;
    const targetTop =
      el.getBoundingClientRect().top + window.scrollY - topOffset;

    if (activeLockRef.current.timeoutId) {
      window.clearTimeout(activeLockRef.current.timeoutId);
    }

    activeLockRef.current = { id, targetTop, timeoutId: null };
    setActiveId(id);

    scrollTweenRef.current?.kill();
    scrollTweenRef.current = null;

    window.history.pushState(null, "", `#${id}`);

    const scrollDuration = 1.15;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const releaseLock = () => {
      if (activeLockRef.current.timeoutId) {
        window.clearTimeout(activeLockRef.current.timeoutId);
      }
      activeLockRef.current = { id: "", targetTop: 0, timeoutId: null };
    };

    if (lenis) {
      lenis.scrollTo(targetTop, {
        duration: scrollDuration,
        easing: easeOutCubic,
        lock: true,
        force: true,
        onComplete: releaseLock,
      });

      // Safety net in case onComplete never fires (e.g. target clamped).
      activeLockRef.current.timeoutId = window.setTimeout(
        releaseLock,
        scrollDuration * 1000 + 300
      );

      return;
    }

    const scrollState = {
      y: window.scrollY,
    };

    scrollTweenRef.current = gsap.to(scrollState, {
      y: targetTop,
      duration: scrollDuration,
      ease: "power3.out",
      onUpdate: () => {
        window.scrollTo(0, scrollState.y);
      },
      onComplete: () => {
        scrollTweenRef.current = null;
        releaseLock();
      },
    });
  };

  useEffect(() => {
    const root = containerRef?.current;

    if (!root) return;

    const updateVisibility = () => {
      const rect = root.getBoundingClientRect();

      setIsVisible(
        rect.top <= window.innerHeight * 0.45 &&
          rect.bottom >= window.innerHeight * 0.25
      );
    };

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [containerRef, watchKey]);

  useEffect(() => {
    const root = containerRef?.current;

    if (!root) return;

    const headings = Array.from(root.querySelectorAll("h2[id]")).map(
      (el, index) => {
        if (!el.id) {
          el.id =
            el.textContent
              ?.toLowerCase()
              .replaceAll(" ", "-")
              .replace(/[^\w-]/g, "") || `section-${index}`;
        }

        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName.toLowerCase(),
        };
      }
    );

    setItems(headings);
  }, [containerRef, watchKey]);

  useEffect(() => {
    const root = containerRef?.current;

    if (!root) return;

    const headings = Array.from(root.querySelectorAll("h2"));

    headings.forEach((el, index) => {
      if (!el.id) {
        el.id =
          el.textContent
            ?.toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^\w-]/g, "") || `section-${index}`;
      }
    });

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (activeLockRef.current.id) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1
          )[0];

        const id = visible?.target?.id;

        if (id) setActiveId(id);
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [containerRef, items.length]);

  useEffect(() => {
    return () => {
      scrollTweenRef.current?.kill();

      if (activeLockRef.current.timeoutId) {
        window.clearTimeout(activeLockRef.current.timeoutId);
      }
    };
  }, []);

  if (items.length === 0 || !isVisible) return null;

  return (
    <div className="group relative flex items-center gap-4 max-md:hidden">
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 h-full min-h-48 w-8 -translate-y-1/2"
      />

      <div className="pointer-events-none absolute h-fit max-h-[60vh] overflow-y-auto overflow-hidden right-[calc(100%+1.5rem)] top-1/2 w-[18vw] -translate-y-1/2 rounded-md bg-[#272727] p-2 py-4 opacity-0 shadow-2xl transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100 toc">
        <div className="w-full h-fit">
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className={[
                    "block rounded-sm px-3 py-2 text20 font-medium leading-[1.2] text-white transition-colors duration-300 ease-out",
                    activeId === it.id ? "bg-black" : "hover:bg-black/55",
                  ].join(" ")}
                  onClick={(e) => onTocClick(e, it.id)}
                >
                  {it.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="flex max-h-[70vh] w-12 flex-col items-end gap-5 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-label={it.text}
              className="block cursor-pointer py-1"
              onClick={(e) => onTocClick(e, it.id)}
            >
              <span
                className={[
                  "block h-0.5 rounded-full transition-all duration-300 ease-out",
                  activeId === it.id
                    ? "w-8 bg-primary"
                    : "w-8 bg-[#272727] hover:w-8 hover:bg-[#272727]",
                ].join(" ")}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BreadcrumbNav({ onDocsNavigate }) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      return { label, href };
    }),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="fadeup flex items-center gap-2 text20 text-muted max-sm:text-xs max-md:px-0"
    >
      {breadcrumbItems.map((item, index, items) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-2">
            {index > 0 && <span className="text-white/25">/</span>}

            {isLast ? (
              <span className="capitalize text-primary">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                scroll={false}
                onClick={(event) => {
                  if (item.href.startsWith("/docs")) {
                    event.preventDefault();
                    onDocsNavigate(item.href);
                  }
                }}
                className="capitalize transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function DocsBody({ children }) {
  const contentRef = useRef(null);
  const routeContentRef = useRef(null);
  const routeTweenRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const navigateWithDocsFade = useCallback(
    (href) => {
      if (!href || href === pathname) return true;

      const routeContent = routeContentRef.current;

      routeTweenRef.current?.kill();

      if (!routeContent) {
        router.push(href, { scroll: false });
        return true;
      }

      routeTweenRef.current = gsap.to(routeContent, {
        autoAlpha: 0,
        y: 0,
        duration: 0.32,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(href, { scroll: false });

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              ScrollTrigger.refresh(true);
            });
          });
        },
      });

      return true;
    },
    [pathname, router]
  );

  useEffect(() => {
    const handleDocsRouteRequest = (event) => {
      const href = event.detail?.href;

      if (!href || !href.startsWith("/docs")) return;

      event.preventDefault();
      navigateWithDocsFade(href);
    };

    window.addEventListener("hyperiux:docs-route-request", handleDocsRouteRequest);

    return () => {
      window.removeEventListener(
        "hyperiux:docs-route-request",
        handleDocsRouteRequest
      );
    };
  }, [navigateWithDocsFade]);

  useEffect(() => {
  routeTweenRef.current?.kill();

  const routeContent = routeContentRef.current;

  if (routeContent) {
    gsap.killTweensOf(routeContent);

    gsap.set(routeContent, {
      autoAlpha: 1,
      y: 0,
      clearProps: "transform",
    });
  }

  const refreshCall = gsap.delayedCall(0.12, () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    });
  });

  return () => {
    routeTweenRef.current?.kill();
    refreshCall.kill();
  };
}, [pathname]);

  return (
    <div className="mx-auto w-full pt-25">
      <RouteFade
        key={pathname}
        motionKey={pathname}
        className="relative min-h-screen"
      >
        <div ref={routeContentRef}>
          <RouteAnimationSync syncKey={pathname} containerRef={contentRef} />

          <BreadcrumbNav onDocsNavigate={navigateWithDocsFade} />

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div
              ref={contentRef}
              className="max-md:px-0 [&_h1]:text-[4vw] [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:text-white [&_h2]:text-[clamp(1.45rem,2vw,2rem)] [&_h2]:font-normal [&_h2]:leading-[1.12] [&_h2]:tracking-[-0.04em] [&_h2]:text-white [&_h3]:text-[clamp(1.05rem,1.45vw,1.35rem)] [&_h3]:font-normal [&_h3]:leading-[1.15] [&_h3]:tracking-[-0.03em] [&_h3]:text-white [&_p]:text-[clamp(0.95rem,1.05vw,1.05rem)] [&_p]:leading-[1.72] [&_p]:text-white [&_li]:text-[clamp(0.95rem,1.05vw,1.05rem)] [&_li]:leading-[1.65] [&_li]:text-white [&_strong]:text-white [&_.docs-heading2-line]:bg-white/20 [&_li::marker]:text-white max-sm:[&_h1]:text-[4vw]"
            >
              {children}
            </div>

          </div>
        </div>
            <aside className="h-fit fixed right-4 top-1/2 -translate-y-1/2">
                <TableOfContents containerRef={contentRef} watchKey={pathname} />
            </aside>
      </RouteFade>
    </div>
  );
}