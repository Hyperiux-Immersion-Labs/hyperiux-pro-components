"use client";

import { useEffect, useMemo, useState } from "react";
import { Confirm, LINE_BUTTON, PANEL_CARD } from "@/components/admin/drawerUI";
import { PERMISSIONS, PERMISSION_KEYS, PRESET_ROLES } from "@/lib/admin-permissions";
import { PermissionPicker } from "@/components/admin/PermissionPicker";
import { getDashboardPreview } from "@/lib/dev/dashboardPreview";

// The Manage drawer's Access section (super admins only - ADMIN_ROLES_PLAN.md): which roles
// an account has, then the permissions as chips (PermissionPicker): filled with a check -
// from a role; a plus - added for this person; struck through - a role gives it but it's
// taken away for them. Tapping a chip switches it for this account only. No roles and no
// additions: no admin access. Saved through POST /api/admin/users/access.

// A role's chip: orange when they have it
const ROLE_CHIP = "type-small inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 ring-1 ring-inset transition-[background-color,color,box-shadow] duration-300";

export function AccessSection({ user, isOwnRow, post, notify, onSaved, onChanged, onBusyChange }) {
  const [roles, setRoles] = useState(null);
  const [loadError, setLoadError] = useState("");
  const start = useMemo(() => user.adminAccess || { roles: [], grant: [], revoke: [] }, [user.adminAccess]);
  const [picked, setPicked] = useState(start.roles);
  // The boxes: every permission they'll have
  const fromRoles = (ids, list) => new Set(ids.flatMap((id) => list?.find((role) => role.id === id)?.permissions || []));
  const [checked, setChecked] = useState(null);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoles(PRESET_ROLES);
      return undefined;
    }
    fetch("/api/admin/roles", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("roles"))))
      .then((json) => active && setRoles(json.roles || []))
      .catch(() => active && setLoadError("Couldn’t load the roles."));
    return () => {
      active = false;
    };
  }, []);

  // Once the roles are in: the boxes start from the saved access
  const saved = useMemo(() => {
    if (!roles) return null;
    const set = fromRoles(start.roles, roles);
    start.grant.forEach((key) => set.add(key));
    start.revoke.forEach((key) => set.delete(key));
    return set;
  }, [roles, start]);
  const boxes = checked || saved;

  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  if (isOwnRow) {
    return (
      <section aria-labelledby="manage-access-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
        <h3 id="manage-access-h" className="type-h3">
          Access
        </h3>
        <p className="type-small text-foreground/80">You’re a super admin: every permission, and roles and access are yours to manage.</p>
      </section>
    );
  }
  if (user.owner) {
    return (
      <section aria-labelledby="manage-access-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
        <h3 id="manage-access-h" className="type-h3">
          Access
        </h3>
        <p className="type-small text-foreground/80">A super admin: every permission. Super admins are set in Clerk, not here.</p>
      </section>
    );
  }

  // What saving sends: the roles, plus what the boxes add to or take from them
  const rolePermissions = fromRoles(picked, roles);
  const grant = boxes ? PERMISSION_KEYS.filter((key) => boxes.has(key) && !rolePermissions.has(key)) : [];
  const revoke = boxes ? PERMISSION_KEYS.filter((key) => !boxes.has(key) && rolePermissions.has(key)) : [];
  const same = (a, b) => a.length === b.length && a.every((item) => b.includes(item));
  const changed = boxes && !(same(picked, start.roles) && same(grant, start.grant) && same(revoke, start.revoke));
  const willBeAdmin = picked.length > 0 || grant.length > 0;
  const roleName = (id) => roles?.find((role) => role.id === id)?.name || id;

  const togglePick = (id) => {
    const next = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
    // Boxes follow the roles: a role's permissions tick on when it's added and off when
    // it's removed (unless another role still gives them)
    const before = fromRoles(picked, roles);
    const after = fromRoles(next, roles);
    const nextBoxes = new Set(boxes);
    before.forEach((key) => !after.has(key) && nextBoxes.delete(key));
    after.forEach((key) => !before.has(key) && nextBoxes.add(key));
    setPicked(next);
    setChecked(nextBoxes);
  };
  const toggleBox = (key) => {
    const next = new Set(boxes);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
  };

  const lines = [
    willBeAdmin
      ? { text: `Roles: ${picked.length ? picked.map(roleName).join(", ") : "none"}.` }
      : { text: `Remove all admin access from ${user.name || user.email}. They keep their account and plan.`, danger: true },
    ...(grant.length ? [{ text: `Also allow: ${grant.map((key) => PERMISSIONS[key].label).join(", ")}.` }] : []),
    ...(revoke.length ? [{ text: `Take away despite their roles: ${revoke.map((key) => PERMISSIONS[key].label).join(", ")}.`, danger: true }] : []),
    ...(grant.includes("finance.view") || grant.includes("finance.manage") || picked.some((id) => fromRoles([id], roles).has("finance.view"))
      ? [{ text: "They’ll see revenue and customers’ payments." }]
      : []),
  ];

  async function save() {
    setBusy(true);
    setError("");
    try {
      const json = await post("/api/admin/users/access", { clerkUserId: user.id, roles: picked, grant, revoke });
      onSaved({ adminAccess: json.access, isAdmin: json.admin, role: json.admin ? "admin" : null });
      setChecked(null);
      setPending(false);
      notify(
        json.admin
          ? { title: "Access Saved", description: `${user.name || user.email} gets it on their next page load.` }
          : { title: "Admin Access Removed", description: `${user.name || user.email} keeps their account and plan.` },
      );
      onChanged?.();
    } catch (err) {
      setError(err.message);
      notify({ title: "Couldn’t Save Access", description: err.message, tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  // How each permission chip shows (PermissionPicker)
  const stateOf = (key) => (boxes?.has(key) ? (rolePermissions.has(key) ? "role" : "added") : rolePermissions.has(key) ? "removed" : "off");
  const count = boxes?.size || 0;

  return (
    <section aria-labelledby="manage-access-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
      <div className="flex flex-col gap-1">
        <h3 id="manage-access-h" className="type-h3">
          Access
        </h3>
        <p className="type-small text-foreground/80">
          {boxes && willBeAdmin
            ? `Admin: ${picked.length ? picked.map(roleName).join(" + ") : "no roles"} · ${count} permission${count === 1 ? "" : "s"}. They also see Activity and Users.`
            : "Not an admin. Pick a role or a permission to make them one: they'll see Activity and Users, plus what you pick."}{" "}
          Revenue, payments and invoices stay hidden unless they have “View finances”.
        </p>
      </div>

      {(error || loadError) && (
        <p role="alert" className="type-small bg-danger/15 px-4 py-3 text-danger">
          {error || loadError}
        </p>
      )}

      {!roles ? (
        !loadError && <p className="type-small text-foreground/80">Loading…</p>
      ) : pending ? (
        <Confirm lines={lines} busy={busy} onCancel={() => setPending(false)} onConfirm={save} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="type-label text-foreground/80">Roles</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const on = picked.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    aria-pressed={on}
                    title={role.description || undefined}
                    onClick={() => togglePick(role.id)}
                    className={`${ROLE_CHIP} ${on ? "bg-primary text-background ring-primary" : "text-foreground/80 ring-foreground/20 hover:text-foreground hover:ring-primary"}`}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-foreground/10 pt-(--cvw) max-lg:pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="type-label text-foreground/80">Permissions</p>
              <p className="type-small text-foreground/80">Tap one to add or remove it for this person</p>
            </div>
            <PermissionPicker tone="dark" stateOf={stateOf} onToggle={toggleBox} />
          </div>

          <button type="button" disabled={!changed} onClick={() => setPending(true)} className={`${LINE_BUTTON} ml-auto`}>
            Save Access
          </button>
        </>
      )}
    </section>
  );
}
