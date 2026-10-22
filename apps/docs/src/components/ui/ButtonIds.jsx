"use client";

import { createContext, useCallback, useContext } from "react";
import { buttonId } from "@/lib/button-id";

// Whether buttons carry ids here (lib/button-id). On by default; the admin dashboard
// turns them off (components/layout/VaultLayout), so GTM's click tracking - which reads
// the clicked element's id - has nothing to record there.
const ButtonIdsContext = createContext(true);

export function ButtonIdsProvider({ on = true, children }) {
  return <ButtonIdsContext.Provider value={on}>{children}</ButtonIdsContext.Provider>;
}

/**
 * buttonId(), or nothing where ids are off: `id={bid("vault-header-sign-in")}`,
 * `id={id || bid(label)}`. An empty result is undefined, so no id="" is rendered.
 */
export function useButtonId() {
  const on = useContext(ButtonIdsContext);
  return useCallback((...parts) => (on ? buttonId(...parts) || undefined : undefined), [on]);
}
