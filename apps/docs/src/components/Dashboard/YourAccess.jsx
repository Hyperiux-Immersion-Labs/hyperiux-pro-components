"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { BUTTON_SIZE } from "@/homepage/components/Button";
import { describeAccess } from "@/lib/admin-permissions";
import { useButtonId } from "@/components/ui/ButtonIds";

/**
 * "Your access", beside the dashboard's View as switch for admins: which admin they are and,
 * in a small panel, their roles and a list of what they can do (lib/admin-permissions
 * describeAccess). Hidden on phones (the dashboard header hides it).
 */
export function YourAccess({ owner, roleNames, permissions, className = "" }) {
  const bid = useButtonId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const access = describeAccess({ owner, roleNames, permissions });

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative flex ${className}`}>
      <button
        id={bid("your-access-open")}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Your access: ${access.title}`}
        onClick={() => setOpen((value) => !value)}
        className={`type-label inline-flex cursor-pointer items-center justify-center gap-2 px-3.5 ${BUTTON_SIZE} text-foreground/80 ring-1 ring-inset ring-foreground/20 backdrop-blur-lg transition-[color,box-shadow] duration-300 hover:text-foreground hover:ring-primary aria-expanded:text-foreground aria-expanded:ring-primary`}
      >
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{access.title}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Your access"
          data-lenis-prevent
          className="absolute top-full right-0 z-50 mt-2 flex max-h-[70vh] w-[calc(var(--cvw)*24)] flex-col gap-4 overflow-y-auto overscroll-contain bg-dark-card p-5 text-foreground shadow-float ring-1 ring-inset ring-foreground/10 max-lg:w-80"
        >
          <div className="flex flex-col gap-1">
            <p className="type-label text-foreground/80">Your access</p>
            <p className="type-h3">{access.title}</p>
            {access.roles.length > 1 && <p className="type-small text-foreground/80">Roles: {access.roles.join(", ")}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <p className="type-label text-foreground/80">You can</p>
            <ul className="flex flex-col gap-1.5">
              {access.abilities.map((ability) => (
                <li key={ability} className="type-small flex items-start gap-2">
                  <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 bg-primary" />
                  {ability}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
