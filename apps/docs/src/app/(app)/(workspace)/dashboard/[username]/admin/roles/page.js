"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ACTION_LINE, ACTION_PRIMARY, CARD, CARD_PAD, TextButton } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { PERMISSIONS, PERMISSION_GROUPS, PRESET_ROLES } from "@/lib/admin-permissions";
import { PermissionPicker } from "@/components/admin/PermissionPicker";
import { getDashboardPreview } from "@/lib/dev/dashboardPreview";

// The admin Roles tab (the owner only - ADMIN_ROLES_PLAN.md): named sets of permissions,
// given to admins in the Users tab's Manage drawer (Access). Every admin also has the basic
// views - Activity and Users - with no revenue or payments (those need
// finance.view); roles add the rest.
// Create, edit, delete (only a role nobody has); every change is in the admin log.

const INPUT = "type-body w-full bg-black/3 px-3 py-2 text-ink ring-1 ring-inset ring-black/10 outline-none placeholder:text-black/40 focus:ring-primary";
const EMPTY = { id: null, name: "", description: "", permissions: [] };

// A role's fields: name, what it's for, and its permissions as chips (a chip's tooltip
// says what it allows)
function RoleForm({ initial, busy, error, onSave, onCancel }) {
  const [role, setRole] = useState(initial);
  const toggle = (key) =>
    setRole((current) => ({ ...current, permissions: current.permissions.includes(key) ? current.permissions.filter((item) => item !== key) : [...current.permissions, key] }));
  const money = role.permissions.some((key) => PERMISSIONS[key].group === "finance");
  const count = role.permissions.length;

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*1.4)] max-lg:gap-6">
      <div className="flex gap-[calc(var(--cvw)*1.2)] max-md:flex-col max-lg:gap-4">
        <label className="flex w-[35%] flex-col gap-2 max-md:w-full">
          <span className="type-label text-black/60">Name</span>
          <input value={role.name} maxLength={40} onChange={(event) => setRole({ ...role, name: event.target.value })} placeholder="Support" className={INPUT} />
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className="type-label text-black/60">What it’s for</span>
          <input value={role.description} maxLength={200} onChange={(event) => setRole({ ...role, description: event.target.value })} placeholder="Helps customers with credits and resets" className={INPUT} />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="type-label text-black/60">Permissions · {count} picked</p>
          <p className="type-small text-black/60 max-lg:hidden">Hover one to see what it allows</p>
        </div>
        <PermissionPicker stateOf={(key) => (role.permissions.includes(key) ? "on" : "off")} onToggle={toggle} />
      </div>

      {money && <p className="type-small text-ink">This role sees revenue and customers’ payments{role.permissions.includes("finance.manage") ? ", and can refund and cancel" : ""}.</p>}
      {error && (
        <p role="alert" className="type-small bg-danger-strong/10 px-4 py-3 text-danger-strong ring-1 ring-inset ring-danger-strong/30">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" disabled={busy || !role.name.trim()} onClick={() => onSave(role)} className={ACTION_PRIMARY}>
          {busy ? "Saving…" : role.id ? "Save Role" : "Create Role"}
        </button>
        <TextButton tone="light" onClick={onCancel} disabled={busy}>
          Cancel
        </TextButton>
      </div>
    </div>
  );
}

export default function AdminRolesPage() {
  const { path, isSuperAdmin: owner, accessLoaded } = useDashboard();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  // The role being edited: EMPTY for a new one, a role, or null
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Only the owner manages roles: anyone else goes back to Users
  useEffect(() => {
    if (accessLoaded && !owner) router.replace(path("admin/users"));
  }, [accessLoaded, owner, router, path]);

  useEffect(() => {
    if (!owner) return undefined;
    let active = true;
    if (getDashboardPreview()) {
      requestAnimationFrame(() => active && setData({ stored: true, roles: PRESET_ROLES.map((role) => ({ ...role, preset: true, holders: [] })) }));
      return () => {
        active = false;
      };
    }
    fetch("/api/admin/roles", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`roles ${res.status}`))))
      .then((json) => active && setData(json))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [owner, reload]);

  async function send(method, body, done) {
    setBusy(true);
    setError("");
    try {
      if (getDashboardPreview()) throw new Error("Not available in the preview.");
      const res = await fetch("/api/admin/roles", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "That didn’t work. Please try again.");
      setMessage(done);
      setEditing(null);
      setDeleting(null);
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t load the roles.</p>
        <p className="type-body text-black/60">Check your connection and reload the page.</p>
      </div>
    );
  }

  if (!owner || !data) {
    return (
      <div aria-busy="true" aria-label="Loading roles" className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="gap-3">
            <Bar type="type-h3" className="w-40" />
            <Bar type="type-body" className="w-[60%]" />
            <Bar type="type-small" className="w-[45%]" />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-label text-black/60">
          Every admin sees Activity and Users. Roles add actions on top; give them in Users → Manage → Access. Revenue, payments and invoices need “View finances”.
        </p>
        {data.stored && !editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(EMPTY);
              setError("");
              setMessage("");
            }}
            className={`${ACTION_PRIMARY} w-fit`}
          >
            <Plus aria-hidden="true" />
            New Role
          </button>
        )}
      </div>

      {!data.stored && (
        <p role="status" className="type-small bg-primary/10 px-4 py-3 text-ink ring-1 ring-inset ring-primary/30">
          These are the built-in roles. Run sql/admin_roles.sql to create, edit or delete roles.
        </p>
      )}
      {message && (
        <p role="status" className="type-small bg-primary/10 px-4 py-3 text-ink ring-1 ring-inset ring-primary/30">
          {message}
        </p>
      )}

      {editing?.id === null && (
        <section aria-label="New role" className={`${CARD} ${CARD_PAD} gap-(--cvw) max-lg:gap-4`}>
          <h2 className="type-h3">New Role</h2>
          <RoleForm initial={EMPTY} busy={busy} error={error} onCancel={() => setEditing(null)} onSave={(role) => send("POST", role, `${role.name} created.`)} />
        </section>
      )}

      {data.roles.map((role) => (
        <section key={role.id} aria-labelledby={`role-${role.id}`} className={`${CARD} ${CARD_PAD} gap-(--cvw) max-lg:gap-4`}>
          {editing?.id === role.id ? (
            <>
              <h2 id={`role-${role.id}`} className="type-h3">
                Edit {role.name}
              </h2>
              <RoleForm initial={role} busy={busy} error={error} onCancel={() => setEditing(null)} onSave={(next) => send("PATCH", next, `${next.name} saved. It applies to everyone with it within 30 seconds.`)} />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 id={`role-${role.id}`} className="type-h3">
                    {role.name}
                    {role.preset && <span className="type-small ml-2 bg-black/5 px-1.5 align-middle text-black/60">Built in</span>}
                  </h2>
                  {role.description && <p className="type-small text-black/60">{role.description}</p>}
                </div>
                {data.stored && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(role);
                        setError("");
                        setMessage("");
                      }}
                      className={ACTION_LINE}
                    >
                      Edit
                    </button>
                    <button type="button" disabled={role.holders.length > 0} title={role.holders.length ? "Take it away from everyone who has it first" : undefined} onClick={() => setDeleting(role.id)} className={ACTION_LINE}>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* what it allows, a line per area */}
              {role.permissions.length === 0 ? (
                <p className="type-small text-black/60">No permissions: the basic views only.</p>
              ) : (
                <dl className="flex flex-col gap-1.5">
                  {PERMISSION_GROUPS.map((group) => {
                    const keys = role.permissions.filter((key) => PERMISSIONS[key]?.group === group.id);
                    if (!keys.length) return null;
                    return (
                      <div key={group.id} className="flex gap-[calc(var(--cvw)*1.2)] max-md:flex-col max-md:gap-0.5">
                        <dt className="type-small w-24 shrink-0 text-black/60">{group.label}</dt>
                        <dd className={`type-small ${group.id === "finance" ? "text-primary" : "text-ink"}`}>{keys.map((key) => PERMISSIONS[key].label).join(" · ")}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}

              <p className="type-small text-black/60">
                {role.holders.length === 0 ? "Nobody has this role." : `${role.holders.length} admin${role.holders.length === 1 ? "" : "s"}: ${role.holders.map((holder) => holder.name || holder.email).join(", ")}`}
              </p>

              {deleting === role.id && (
                <div className="flex flex-col gap-3 bg-black/3 p-4 ring-1 ring-inset ring-black/10">
                  <p className="type-small text-ink">Delete {role.name}? Nobody has it, so nobody loses access.</p>
                  {error && <p className="type-small text-danger-strong">{error}</p>}
                  <div className="flex flex-wrap items-center gap-4">
                    <button type="button" disabled={busy} onClick={() => send("DELETE", { id: role.id }, `${role.name} deleted.`)} className={ACTION_PRIMARY}>
                      {busy ? "Deleting…" : "Delete"}
                    </button>
                    <TextButton tone="light" onClick={() => setDeleting(null)} disabled={busy}>
                      Cancel
                    </TextButton>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      ))}
    </div>
  );
}
