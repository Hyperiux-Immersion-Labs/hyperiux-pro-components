"use client";

import { Check, Minus, Plus } from "lucide-react";
import { PERMISSIONS, PERMISSION_GROUPS, PERMISSION_KEYS } from "@/lib/admin-permissions";

// The admin permissions as toggle chips, one row per group (Finance, Users, Effects,
// System) - the Roles tab's role form and the Manage drawer's Access section. A chip's
// description is its tooltip, so the rows stay short. `stateOf(key)` says how a chip shows:
//   "on"      - has it (orange)
//   "role"    - has it through a role (orange, a check)
//   "added"   - has it, added for this one person (orange, a plus)
//   "removed" - a role gives it, taken away for this person (struck through, a minus)
//   "off"     - doesn't have it
// `tone`: "light" (white cards) or "dark" (the drawer).

const TONES = {
  light: {
    group: "text-black/60",
    off: "text-ink ring-black/10 hover:ring-primary",
    on: "bg-primary text-background ring-primary",
    removed: "text-black/40 line-through ring-black/10 hover:ring-primary",
  },
  dark: {
    group: "text-foreground/80",
    off: "text-foreground/80 ring-foreground/20 hover:text-foreground hover:ring-primary",
    on: "bg-primary text-background ring-primary",
    removed: "text-white/20 line-through ring-foreground/10 hover:ring-primary",
  },
};
const ICONS = { role: Check, added: Plus, removed: Minus };

function PermissionChips({ keys, stateOf, onToggle, tone = "light" }) {
  const colours = TONES[tone];
  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => {
        const state = stateOf(key);
        const has = state === "on" || state === "role" || state === "added";
        const Icon = ICONS[state];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={has}
            title={PERMISSIONS[key]?.description}
            onClick={() => onToggle(key)}
            className={`type-small inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 ring-1 ring-inset transition-[background-color,color,box-shadow] duration-300 ${has ? colours.on : state === "removed" ? colours.removed : colours.off}`}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            {PERMISSIONS[key]?.label || key}
          </button>
        );
      })}
    </div>
  );
}

export function PermissionPicker({ stateOf, onToggle, tone = "light" }) {
  const colours = TONES[tone];
  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.9)] max-lg:gap-4">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.id} className="flex items-start gap-[calc(var(--cvw)*1.2)] max-md:flex-col max-md:gap-2">
          <p className={`type-label w-24 shrink-0 py-1.5 max-md:w-auto max-md:py-0 ${colours.group}`}>{group.label}</p>
          <PermissionChips keys={PERMISSION_KEYS.filter((key) => PERMISSIONS[key].group === group.id)} stateOf={stateOf} onToggle={onToggle} tone={tone} />
        </div>
      ))}
    </div>
  );
}
