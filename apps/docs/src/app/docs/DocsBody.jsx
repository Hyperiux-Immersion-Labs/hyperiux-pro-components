"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useLenis } from "lenis/react";

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
    const targetTop = el.getBoundingClientRect().top + window.scrollY - topOffset;

    if (activeLockRef.current.timeoutId) {
      window.clearTimeout(activeLockRef.current.timeoutId);
    }

    activeLockRef.current = { id, targetTop, timeoutId: null };
    setActiveId(id);

    scrollTweenRef.current?.kill();

    const scrollState = {
      y: window.scrollY,
    };

    scrollTweenRef.current = gsap.to(scrollState, {
      y: targetTop,
      duration: 1.15,
      ease: "power3.out",
      onUpdate: () => {
        if (lenis) {
          lenis.scrollTo(scrollState.y, {
            immediate: true,
            force: true,
          });
          return;
        }

        window.scrollTo(0, scrollState.y);
      },
      onComplete: () => {
        scrollTweenRef.current = null;
      },
    });

    window.history.pushState(null, "", `#${id}`);

    const releaseWhenSettled = (startedAt = performance.now()) => {
      const isSettled = Math.abs(window.scrollY - targetTop) < 2;
      const timedOut = performance.now() - startedAt > 1800;

      if (isSettled || timedOut) {
        activeLockRef.current = { id: "", targetTop: 0, timeoutId: null };
        return;
      }

      activeLockRef.current.timeoutId = window.setTimeout(
        () => releaseWhenSettled(startedAt),
        80,
      );
    };

    activeLockRef.current.timeoutId = window.setTimeout(
      () => releaseWhenSettled(),
      120,
    );
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

    const headings = Array.from(
      root.querySelectorAll("h2[id]")
    ).map((el, index) => {
      if (!el.id) {
        el.id =
          el.textContent
            ?.toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^\w-]/g, "") ||
          `section-${index}`;
      }

      return {
        id: el.id,
        text: el.textContent || "",
        level: el.tagName.toLowerCase(),
      };
    });
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
            .replace(/[^\w-]/g, "") ||
          `section-${index}`;
      }
    });

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (activeLockRef.current.id) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1))[0];
        const id = visible?.target?.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
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
    <div className="group relative flex items-center gap-4">
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 h-full min-h-48 w-8 -translate-y-1/2"
      />
      <div className="pointer-events-none absolute right-[calc(100%+1.5rem)] top-1/2 w-[18vw] -translate-y-1/2 rounded-md bg-[#272727] p-2 py-4 opacity-0 shadow-2xl transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={[
                  "block rounded-sm px-3 py-2 text20 font-medium leading-none text-white transition-colors duration-300 ease-out",
                  activeId === it.id
                    ? "bg-black"
                    : "hover:bg-black/55",
                ].join(" ")}
                onClick={(e) => onTocClick(e, it.id)}
              >
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex w-12 flex-col items-end gap-5">
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
                  "block h-[2px] rounded-full transition-all duration-300 ease-out",
                  activeId === it.id
                    ? "w-12 bg-white"
                    : "w-7 bg-white/35 hover:w-9 hover:bg-white/65",
                ].join(" ")}
              >
                <span className="sr-only">{it.text}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DocsBody({ children }) {
  const contentRef = useRef(null);
  const pathname = usePathname();

  return (
    <>
      <div className="mx-auto w-full pt-16 bg-black">
        <div className="grid grid-cols-1 gap-20 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div
            ref={contentRef}
            className="px-8 [&_h1]:text-[4vw] [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:text-white [&_h2]:text-[clamp(1.45rem,2vw,2rem)] [&_h2]:font-normal [&_h2]:leading-[1.12] [&_h2]:tracking-[-0.04em] [&_h2]:text-white [&_h3]:text-[clamp(1.05rem,1.45vw,1.35rem)] [&_h3]:font-normal [&_h3]:leading-[1.15] [&_h3]:tracking-[-0.03em] [&_h3]:text-white [&_p]:text-[clamp(0.95rem,1.05vw,1.05rem)] [&_p]:leading-[1.72] [&_p]:text-white [&_li]:text-[clamp(0.95rem,1.05vw,1.05rem)] [&_li]:leading-[1.65] [&_li]:text-white [&_strong]:text-white [&_.docs-heading2-line]:bg-white/20 [&_li::marker]:text-white max-sm:[&_h1]:text-[4vw]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <aside className="hidden xl:block pr-6">
            <div className="fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
              <TableOfContents containerRef={contentRef} watchKey={pathname} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
