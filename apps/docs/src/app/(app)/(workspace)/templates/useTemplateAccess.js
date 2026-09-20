"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// Sibling to useTemplateWishlist.js - same shape, different data source.
// Reuses api/dashboard/template-purchases (built for the dashboard's "My
// Templates" tab) rather than a new route: that endpoint already returns
// exactly "every template this signed-in user can download" (purchased, or
// included via an active annual-Pro subscription), which is exactly the set
// TemplateCard's purchase button needs to know about.
//
// This only fetches once (on sign-in), so a purchase made through a
// TemplateCard rendered from this hook's accessSlugs would otherwise leave
// that card stuck showing "Buy" forever - `hasAccess` never flips because
// nothing re-runs the fetch. markPurchased() is the same optimistic-flip
// idiom template-detail.jsx's own handlePurchased already uses (its local
// hasAccess state set true immediately, real value resynced later) - here
// "later" is just staying true for the rest of the session, which is fine
// since a real purchase can't become un-owned.
export function useTemplateAccess() {
  const { isSignedIn } = useUser();
  const [accessSlugs, setAccessSlugs] = useState([]);

  useEffect(() => {
    if (!isSignedIn) return;

    let active = true;

    fetch("/api/dashboard/template-purchases")
      .then((res) => (res.ok ? res.json() : { templates: [] }))
      .then((data) => {
        if (active) setAccessSlugs((data?.templates || []).map((t) => t.slug));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isSignedIn]);

  const markPurchased = (slug) => {
    setAccessSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
  };

  return { accessSlugs, markPurchased };
}
