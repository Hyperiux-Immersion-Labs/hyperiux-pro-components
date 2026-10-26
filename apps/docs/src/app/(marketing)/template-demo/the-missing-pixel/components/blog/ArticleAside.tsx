// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { Check, Link as LinkIcon, Mail } from "lucide-react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type ArticleAsideProps = {
  links: { label: string; id: string }[];
  subject: string;
};

const ICON_BUTTON =
  "inline-flex aspect-square h-[6vh] items-center justify-center rounded-full border border-(--mpx-ink)/30 transition-colors duration-300 hover:border-(--mpx-ink) max-lg:h-[5vh] max-md:h-[7vh]";

const ICON = "size-[1.4vw] max-lg:size-[2.4vw] max-md:size-[4.6vw]";

const ArticleAside = ({ links, subject }: ArticleAsideProps) => {
  const lenis = useLenis();
  const [active, setActive] = useState(links[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLOListElement | null>(null);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const placedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    links.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    const place = (animate: boolean) => {
      const marker = markerRef.current;
      const item = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (!marker || !item) return;
      const instant = !animate || !placedRef.current || prefersReducedMotion();
      gsap.to(marker, {
        y: item.offsetTop,
        height: item.offsetHeight,
        duration: instant ? 0 : 0.7,
        ease: "power3.out",
        overwrite: true,
      });
      placedRef.current = true;
    };
    place(true);
    const handleResize = () => place(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.5 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="w-[24%] max-lg:w-full">
      <div className="sticky top-[14vh] flex flex-col gap-9 max-lg:static max-lg:gap-6">
        <nav aria-label="Contents" className="flex flex-col gap-4 max-lg:hidden">
          <h3 className="text-28">Contents</h3>
          <ol ref={listRef} className="relative flex flex-col border-l border-(--mpx-ink)/10">
            <span ref={markerRef} aria-hidden className="absolute -left-px top-0 h-0 w-px bg-(--mpx-accent)" />
            {links.map((link) => (
              <li key={link.id} data-id={link.id}>
                <Link
                  href={`#${link.id}`}
                  onClick={(event) => go(event, link.id)}
                  aria-current={active === link.id ? "true" : undefined}
                  className={`block px-[1vw] py-[0.8vh] text-22 transition-colors duration-500 hover:text-(color:--mpx-ink) max-lg:px-[2vw] ${
                    active === link.id ? "text-(color:--mpx-ink)" : "text-(color:--mpx-muted)"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-4">
          <h3 className="text-22 text-mpx-muted">Share</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} aria-label="Copy link to this article" className={ICON_BUTTON}>
              {copied ? <Check className={ICON} /> : <LinkIcon className={ICON} />}
            </button>
            <Link href={`mailto:?subject=${encodeURIComponent(subject)}`} aria-label="Share by email" className={ICON_BUTTON}>
              <Mail className={ICON} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ArticleAside;
