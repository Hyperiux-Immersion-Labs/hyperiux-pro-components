"use client";

import { Check, LoaderCircle } from "lucide-react";
import { ACTION_PRIMARY, CARD_PAD, TextButton } from "@/components/Dashboard/DashboardUI";
import { BUTTON_SIZE } from "@/homepage/components/Button";

// Building blocks of the admin Manage drawer (ManageUserDrawer, ManageUserBilling).

export const formatDate = (value) => (value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—");

export function timeAgo(value) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

// The drawer's surfaces and buttons, on the dark page (as the effects' preview drawer)
export const PANEL_CARD = `flex flex-col bg-dark-card text-foreground ring-1 ring-inset ring-foreground/10 ${CARD_PAD}`;
export const LINE_BUTTON = `inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 px-4 ${BUTTON_SIZE} text-foreground ring-1 ring-inset ring-foreground/20 transition-[color,box-shadow] duration-300 hover:text-primary hover:ring-primary disabled:cursor-default disabled:opacity-60 [&_svg]:size-4`;

// The change about to be made, and Confirm / Cancel - every change here asks first
export function Confirm({ lines, busy, onConfirm, onCancel }) {
  return (
    <div className="flex flex-col gap-3 bg-foreground/5 p-4 ring-1 ring-inset ring-foreground/10">
      <ul className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <li key={line.text} className={`type-small flex items-start gap-2 ${line.danger ? "text-danger" : "text-foreground"}`}>
            <span aria-hidden="true" className={`mt-[0.55em] size-1.5 shrink-0 rounded-full ${line.danger ? "bg-danger" : "bg-primary"}`} />
            {line.text}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={onConfirm} disabled={busy} className={ACTION_PRIMARY}>
          {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          {busy ? "Saving…" : "Confirm"}
        </button>
        <TextButton onClick={onCancel} disabled={busy}>
          Cancel
        </TextButton>
      </div>
    </div>
  );
}
