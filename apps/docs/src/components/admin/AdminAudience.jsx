"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { FILTER_WIDTH } from "@/components/Dashboard/DashboardUI";

// Whose data the admin pages count: customers (the default), our own team's
// internal accounts (lib/admin-data isInternalUser), or everyone. One choice
// for every admin page that splits by account (Activity, Users, Invoicing), remembered
// in this browser and picked from the dropdown beside the page's date filter.
export const AUDIENCE_ITEMS = [
  { id: "customers", label: "Customers" },
  { id: "internal", label: "Internal" },
  { id: "all", label: "All" },
];

const STORAGE_KEY = "vault:admin-audience";
const CHANGE_EVENT = "vault:admin-audience-change";
const DEFAULT = "customers";

function read() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return AUDIENCE_ITEMS.some((item) => item.id === value) ? value : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function subscribe(onChange) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// [audience, setAudience] - pass `audience` to every admin API as ?audience=
export function useAdminAudience() {
  const audience = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const setAudience = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Without storage the choice can't be kept; the pages stay on Customers
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [audience, setAudience];
}

const AUDIENCE_LABELS = Object.fromEntries(AUDIENCE_ITEMS.map((item) => [item.id, item.label]));

// The dropdown, styled like the date filter beside it: orange when it isn't the
// default (Customers), as the date filter is when it isn't "All time". Beside it, both
// go in AUDIENCE_PAIR: a row, and on phones two equal halves of the width.
export const AUDIENCE_PAIR = "flex items-center gap-[calc(var(--cvw)*0.7)] max-md:grid max-md:w-full max-md:grid-cols-2 max-md:gap-[2.5vw]";
export const PAIR_WIDTH = `${FILTER_WIDTH} max-md:w-full`;
export function AdminAudienceFilter({ widthClassName = FILTER_WIDTH }) {
  const [audience, setAudience] = useAdminAudience();
  return (
    <FilterMenu
      tone="light"
      variant="label"
      alignRight
      widthClassName={widthClassName}
      label="Whose accounts"
      panelClassName="left-auto! right-0"
      options={AUDIENCE_ITEMS.map((item) => item.id)}
      categoryFilter={audience}
      activeFilter={audience === DEFAULT ? null : audience}
      getLabel={(id) => AUDIENCE_LABELS[id]}
      onSelect={setAudience}
    />
  );
}
