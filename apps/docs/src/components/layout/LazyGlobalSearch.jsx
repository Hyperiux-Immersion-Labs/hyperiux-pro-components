"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIdle } from "@/lib/when-idle";

const GlobalSearch = dynamic(() => import("./SearchBar").then((m) => m.GlobalSearch), { ssr: false });

const isSearchShortcut = (event) => (event.metaKey || event.ctrlKey) && event.key?.toLowerCase() === "k";

// GlobalSearch (its dialog, results and docs list) loads once the page is idle instead of
// with the page. ⌘K or a search button pressed before then loads it straight away, open.
export default function LazyGlobalSearch({ effects, externalOpen = 0 }) {
  const idle = useIdle();
  const [shortcutUsed, setShortcutUsed] = useState(false);
  const wanted = shortcutUsed || externalOpen > 0;

  useEffect(() => {
    if (idle || shortcutUsed) return undefined;
    const onKeyDown = (event) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      setShortcutUsed(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [idle, shortcutUsed]);

  // Whether it mounts opened (a request came first) or quietly (idle), fixed at mount
  const [mountedFor, setMountedFor] = useState(null);
  if (mountedFor === null && (idle || wanted)) setMountedFor(wanted ? "open" : "idle");
  if (mountedFor === null) return null;

  return <GlobalSearch effects={effects} externalOpen={externalOpen} openOnMount={mountedFor === "open"} />;
}
