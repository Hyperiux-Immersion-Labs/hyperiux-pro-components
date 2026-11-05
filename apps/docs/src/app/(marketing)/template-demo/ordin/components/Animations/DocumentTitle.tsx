// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect } from "react";

// not-found.tsx can't export metadata on every Next.js setup, so the 404 sets its own tab title
export default function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
