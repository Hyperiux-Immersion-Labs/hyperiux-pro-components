// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";

type ArticleAsideProps = {
  links: { label: string; id: string }[];
  subject: string;
};

const PILL =
  "font-mpx-head inline-flex h-[5vh] items-center rounded-full border border-black/30 px-[1.2vw] text-22 transition-colors duration-300 hover:border-[#0a0a0a] max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw]";

const ArticleAside = ({ links, subject }: ArticleAsideProps) => {
  const lenis = useLenis();
  const [active, setActive] = useState(links[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

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
        <nav aria-label="Contents" className="flex flex-col gap-4 max-md:hidden">
          <h2 className="text-30">Contents</h2>
          <ol className="flex flex-col border-l border-black/10">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => go(event, link.id)}
                  aria-current={active === link.id ? "true" : undefined}
                  className={`-ml-px block border-l px-[1vw] py-[0.8vh] text-24 transition-colors duration-300 hover:text-[#0a0a0a] max-lg:px-[2vw] ${
                    active === link.id
                      ? "border-[#ff5f00] text-[#0a0a0a]"
                      : "border-transparent text-[#5e5e5e]"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-4">
          <h2 className="text-30">Share</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} aria-label="Copy link to this article" className={PILL}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <a href={`mailto:?subject=${encodeURIComponent(subject)}`} aria-label="Share by email" className={PILL}>
              Email
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ArticleAside;
