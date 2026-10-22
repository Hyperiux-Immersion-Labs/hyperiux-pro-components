"use client";

import { useEffect } from "react";

// Every click on a button with an id (lib/button-id) goes to GTM's dataLayer as one
// event, so a single GTM trigger - Custom Event "button_click" - and one GA4 event tag can
// track every button on the site:
//   { event: "button_click", button_id, button_text, button_kind, page_path }
// Buttons, link buttons (the site's <Button> is a link), menu items, tabs and radio chips
// count. The admin pages don't: their ids carry account ids, which don't belong in Google
// Analytics. Pushing before GTM has loaded is fine - it reads the queue when it starts.
const CLICKABLE = 'button[id], a[id], [role="button"][id], [role="menuitem"][id], [role="tab"][id], [role="radio"][id]';
const ADMIN_PATH = /^\/dashboard\/[^/]+\/admin(\/|$)/;

export default function ButtonClickTracking() {
  useEffect(() => {
    const onClick = (event) => {
      if (ADMIN_PATH.test(window.location.pathname)) return;
      const target = event.target instanceof Element ? event.target.closest(CLICKABLE) : null;
      // (the site's <Button> renders id="" when it's given none)
      if (!target?.id || target.matches(":disabled, [aria-disabled='true']")) return;
      const text = (target.getAttribute("aria-label") || target.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "button_click",
        button_id: target.id,
        button_text: text,
        button_kind: target.tagName === "A" ? "link" : target.getAttribute("role") || "button",
        page_path: window.location.pathname,
      });
    };
    // Capture: a button that stops the click's propagation (menus, drawers) still counts
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
