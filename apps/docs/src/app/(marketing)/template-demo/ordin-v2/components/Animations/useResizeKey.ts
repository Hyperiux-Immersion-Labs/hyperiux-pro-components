// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useState } from "react";

export function useResizeKey() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    let width = window.innerWidth;
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        setKey((k) => k + 1);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, []);

  return key;
}

export function useElementHeightKey(selector: string) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const measure = () => document.querySelector(selector)?.getBoundingClientRect().height ?? -1;
    let height = measure();
    let timer = 0;
    const ro = new ResizeObserver(() => {
      const next = measure();
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setKey((k) => k + 1), 100);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [selector]);

  return key;
}
