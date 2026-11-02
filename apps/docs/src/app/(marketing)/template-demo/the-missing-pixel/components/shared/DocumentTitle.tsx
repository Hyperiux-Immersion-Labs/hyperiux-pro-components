// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect } from "react";

// A 404 only gets its layout's metadata title, and Next can stream that in after
// this runs, so the tab title is set here and re-applied whenever <head> changes.
// That rewrites the layout's own <title>, so its text is restored on the way out.
// The layout's metadata has no default title, so a 404 may have no <title> at all;
// one is added for it then and removed again on the way out.
const DocumentTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    const originals = new Map<HTMLTitleElement, string>();
    let added: HTMLTitleElement | null = null;
    const apply = () => {
      let el = document.querySelector("title");
      if (!el) {
        added = el = document.createElement("title");
        document.head.appendChild(el);
      }
      if (el.textContent === title) return;
      if (!originals.has(el)) originals.set(el, el.textContent ?? "");
      el.textContent = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      added?.remove();
      originals.forEach((text, el) => {
        if (el.isConnected && el.textContent === title) el.textContent = text;
      });
    };
  }, [title]);
  return null;
};

export default DocumentTitle;
