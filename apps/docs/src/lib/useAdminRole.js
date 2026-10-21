"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// The signed-in account's admin access, from GET /api/admin/me - the client can't work it
// out itself (the ADMIN_EMAIL fallback and the roles table are server-side). One request
// per account per page load, shared by every component that asks; refreshAdminRole()
// reads it again (after the owner changes their own view of access).
//   role        - "super_admin" (the owner), "admin" or null
//   owner       - the one super admin: every permission, plus roles and access
//   permissions - lib/admin-permissions keys; can(key) checks one
// It only shapes the screens: the server checks every request again.
const EMPTY = { role: null, owner: false, roleNames: [], permissions: [] };
let shared = null; // { userId, promise }

function load(userId) {
  if (!shared || shared.userId !== userId) {
    shared = {
      userId,
      promise: fetch("/api/admin/me", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : EMPTY))
        .catch(() => EMPTY),
    };
  }
  return shared.promise;
}

export function refreshAdminRole() {
  shared = null;
}

export function useAdminRole() {
  const { user, isLoaded } = useUser();
  const [access, setAccess] = useState(null);

  useEffect(() => {
    if (!isLoaded) return undefined;
    if (!user) {
      // Signed out: no access (Clerk's auth state only resolves on the client)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccess(EMPTY);
      return undefined;
    }
    let cancelled = false;
    load(user.id).then((json) => !cancelled && setAccess({ role: json.role || null, owner: Boolean(json.owner), roleNames: json.roleNames || [], permissions: json.permissions || [] }));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const permissions = access?.permissions;
  const can = useCallback((key) => Boolean(access?.owner || permissions?.includes(key)), [access?.owner, permissions]);

  return {
    role: access?.role ?? null,
    isAdmin: access?.role === "admin" || access?.role === "super_admin",
    isSuperAdmin: Boolean(access?.owner),
    owner: Boolean(access?.owner),
    permissions: permissions || [],
    // The names of their roles (empty for a super admin, who has everything)
    roleNames: access?.roleNames || [],
    can,
    loading: access === null,
  };
}
