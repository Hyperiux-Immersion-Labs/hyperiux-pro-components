// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

type FooterParallaxProps = {
  children?: ReactNode;
  id?: string;
  outerClassName?: string;
  footerClassName?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "id">;

const FooterParallax = ({
  children,
  id = "footer",
  outerClassName = "",
  footerClassName = "",
  ...props
}: FooterParallaxProps) => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);
  const [fits, setFits] = useState(true);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    let frameId = 0;

    const updateHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const next = el.getBoundingClientRect().height;
        setHeight(next);
        setFits(next <= window.innerHeight + 1);
      });
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(el);
    window.addEventListener("resize", updateHeight);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [children]);

  useEffect(() => {
    const outer = outerRef.current;
    const footer = footerRef.current;
    if (!outer || !footer || fits) return;

    const follow = () => {
      footer.style.transform = `translate3d(0, ${Math.min(0, outer.getBoundingClientRect().top)}px, 0)`;
    };

    follow();
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);

    return () => {
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
      footer.style.removeProperty("transform");
    };
  }, [fits, height]);

  return (
    <div
      ref={outerRef}
      id={id}
      className={`relative z-1 w-full [clip-path:rect(0px,100%,100%,0px)] ${outerClassName}`.trim()}
      style={height ? { height } : undefined}
      {...props}
    >
      <footer
        ref={footerRef}
        className={`fixed inset-x-0 ${fits ? "bottom-0" : "top-0 will-change-transform"} ${footerClassName}`.trim()}
      >
        {children}
      </footer>
    </div>
  );
};

export default FooterParallax;
export { FooterParallax };
