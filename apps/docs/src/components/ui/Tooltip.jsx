"use client";

import { useEffect, useId, useRef } from "react";

// Gap between the trigger and the tooltip.
const GAP = 10;
// Grace period before the tooltip closes, so moving to a neighbouring trigger glides instead of closing and reopening.
const CLOSE_DELAY = 90;

// One shared tooltip for the whole page: triggers only report which one is hovered, and
// <TooltipHost /> (./TooltipHost, mounted once in the root layout) draws it, sliding
// between triggers. This file is the light half every page with a tooltip loads.
let state = null; // { id, label, position, rect } | null
let closeTimer = 0;
const listeners = new Set();

function setTooltipState(next) {
  state = next;
  listeners.forEach((fn) => fn());
}
export function subscribeTooltip(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const getTooltipSnapshot = () => state;
export const getTooltipServerSnapshot = () => null;

let lastCenter = 0;
function open(next) {
  clearTimeout(closeTimer);
  // Side tooltips (sidebar) stack vertically, so they slide up/down; the rest slide left/right.
  const vertical = next.position === "right";
  const center = vertical ? next.rect.top + next.rect.height / 2 : next.rect.left + next.rect.width / 2;
  // Which way the tooltip travels, so its text slides in from that side.
  const dir = center >= lastCenter ? 1 : -1;
  lastCenter = center;
  setTooltipState({ ...next, dir, vertical });
}
// Only the trigger whose tooltip is showing may close it. (The timer is shared: a close
// from any other trigger - e.g. a whole grid of cards unmounting on navigation - used to
// cancel the pending close and leave the tooltip ghosted on the next page.)
function close(id) {
  if (id !== undefined && state?.id !== id) return;
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (state && (id === undefined || state.id === id)) setTooltipState(null);
  }, CLOSE_DELAY);
}

// Hides the tooltip now, cancelling any pending close (the host: page change, resize)
export function clearTooltip() {
  clearTimeout(closeTimer);
  setTooltipState(null);
}

// A trigger leaving the page takes its tooltip with it, straight away.
function closeNow(id) {
  if (state?.id !== id) return;
  clearTimeout(closeTimer);
  setTooltipState(null);
}

export function anchorFor(rect, position) {
  if (position === "right") return { x: rect.right + GAP, y: rect.top + rect.height / 2, shift: "translate(0, -50%)", origin: "left center" };
  if (position === "bottom") return { x: rect.left + rect.width / 2, y: rect.bottom + GAP, shift: "translate(-50%, 0)", origin: "top center" };
  return { x: rect.left + rect.width / 2, y: rect.top - GAP, shift: "translate(-50%, -100%)", origin: "bottom center" };
}

export function Tooltip({ label, children, className = "", position = "top", hideOnClick = false }) {
  const id = useId();
  const triggerRef = useRef(null);
  const labelRef = useRef(label);

  // Keep a live label (e.g. "Copy" -> "Copied") flowing into the open tooltip.
  useEffect(() => {
    labelRef.current = label;
    if (state?.id === id && state.label !== label) setTooltipState({ ...state, label });
  }, [label, id]);

  useEffect(() => () => closeNow(id), [id]);

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    open({ id, label: labelRef.current, position, rect });
  }

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={() => close(id)}
      onFocus={show}
      onBlur={() => close(id)}
      onClickCapture={() => {
        if (hideOnClick) {
          clearTimeout(closeTimer);
          if (state?.id === id) setTooltipState(null);
        }
      }}
    >
      {children}
    </span>
  );
}
