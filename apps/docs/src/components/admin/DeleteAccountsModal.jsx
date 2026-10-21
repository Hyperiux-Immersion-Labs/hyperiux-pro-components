"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";
import { BUTTON_SIZE } from "@/homepage/components/Button";
import { useLenisLock } from "@/hooks/useLenisLock";
import { getDashboardPreview } from "@/lib/dev/dashboardPreview";

// Deleting accounts for good (super admins, the Users tab's row checkboxes): a dialog in the
// middle of the screen, in the dashboard modals' look (CreateUserModal: the cross, no
// Cancel), that names who goes, says plainly it can't be undone, and asks for "DELETE"
// before the button works. POST /api/admin/users/delete does the work, one account
// at a time (lib/account-deletion). `onDone({ deleted, failed })` says how it went.

const SHOWN = 5;
// Solid red (danger-strong), full width: the one action in the dialog
const DANGER_BUTTON = `type-label inline-flex w-full cursor-pointer items-center justify-center gap-2 px-5 ${BUTTON_SIZE} bg-danger-strong text-white transition-[filter,opacity] duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4`;

export function DeleteAccountsModal({ users, onClose, onDone }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const count = users.length;
  const ready = typed.trim() === "DELETE" && !busy;
  useLenisLock(true);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function remove() {
    setBusy(true);
    setError("");
    try {
      if (getDashboardPreview()) throw new Error("Not available in the preview.");
      const res = await fetch("/api/admin/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clerkUserIds: users.map((user) => user.id) }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && !json.failed) throw new Error(json.error || "That didn’t work. Please try again.");
      onDone({ deleted: json.deleted || [], failed: json.failed || [] });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="delete-accounts-h" className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4 backdrop-blur-lg" onClick={() => !busy && onClose()}>
      <div
        data-lenis-prevent
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[80svh] w-full max-w-lg flex-col gap-7 overflow-y-auto overscroll-contain border border-white/10 bg-background p-8 text-foreground max-md:gap-6 max-md:p-6"
      >
        {/* the cross every dashboard modal closes with (CreateUserModal) */}
        <button
          type="button"
          aria-label="Close"
          disabled={busy}
          onClick={onClose}
          className="group absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-all duration-500 ease-in-out hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
            <span className="h-px w-4 rotate-45 bg-white" />
            <span className="absolute h-px w-4 -rotate-45 bg-white" />
          </span>
        </button>

        {/* what goes, and that it can't come back */}
        <div className="flex flex-col gap-3 pr-12">
          <h2 id="delete-accounts-h" className="type-h3">
            Delete {count === 1 ? "this account" : `${count} accounts`} permanently?
          </h2>
          <p className="type-small flex items-start gap-2 text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Deleted accounts can’t be restored.
          </p>
          <p className="type-small text-foreground/70">
            They’re signed out everywhere and any subscription is cancelled. Their saves, template credits, usage and CLI token are removed; invoices and template purchases stay, as tax records.
          </p>
        </div>

        <ul className="flex flex-col border border-white/10">
          {users.slice(0, SHOWN).map((user) => (
            <li key={user.id} className="flex min-w-0 flex-col gap-0.5 border-t border-white/10 px-4 py-3 first:border-t-0">
              <span className="type-body truncate">{user.name || user.email}</span>
              {user.name && <span className="type-small truncate text-foreground/60">{user.email}</span>}
            </li>
          ))}
          {count > SHOWN && <li className="type-small border-t border-white/10 px-4 py-3 text-foreground/60">and {count - SHOWN} more</li>}
        </ul>

        <label className="flex flex-col gap-2.5">
          <span className="type-small text-foreground/80">
            Type <strong className="font-medium text-foreground">DELETE</strong> to confirm
          </span>
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoFocus
            autoComplete="off"
            className="border border-white/10 bg-white/5 px-3 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/25 focus:border-white/40"
          />
        </label>

        {error && (
          <p role="alert" className="type-small bg-danger/15 px-4 py-3 text-danger">
            {error}
          </p>
        )}

        <button type="button" disabled={!ready} onClick={remove} className={DANGER_BUTTON}>
          {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
          {busy ? "Deleting…" : count === 1 ? "Delete Permanently" : `Delete ${count} Permanently`}
        </button>
      </div>
    </div>,
    document.body,
  );
}
