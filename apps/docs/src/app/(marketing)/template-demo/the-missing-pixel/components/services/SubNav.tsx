// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";

type SubNavProps = {
  links: { label: string; id: string }[];
};

const SubNav = ({ links }: SubNavProps) => {
  const lenis = useLenis();
  const [active, setActive] = useState(links[0]?.id ?? "");
  const railRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    links.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    const rail = railRef.current;
    const item = itemRefs.current[active];
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: item.offsetLeft - rail.clientWidth / 2 + item.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.5 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-40 border-y border-(--mpx-ink)/10 bg-(--mpx-paper)/90 backdrop-blur-lg"
    >
      <ul ref={railRef} className="flex gap-2 overflow-x-auto px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[1.2vh] [scrollbar-width:none] max-lg:py-[1.4vh] max-md:py-[1.6vh]">
        {links.map((link) => (
          <li key={link.id} ref={(el) => { itemRefs.current[link.id] = el; }} className="shrink-0">
            <Link
              href={`#${link.id}`}
              onClick={(event) => go(event, link.id)}
              aria-current={active === link.id ? "true" : undefined}
              className={`font-mpx-head inline-flex h-[5vh] items-center rounded-full px-[1.2vw] text-22 font-medium transition-colors duration-300 max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw] ${
                active === link.id
                  ? "bg-(--mpx-ink) text-(color:--mpx-paper)"
                  : "text-(color:--mpx-ink) hover:bg-(--mpx-paper)"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNav;
