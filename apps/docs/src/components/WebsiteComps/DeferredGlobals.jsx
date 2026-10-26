"use client";

import dynamic from "next/dynamic";
import { useIdle } from "@/lib/when-idle";

// Site-wide layers nobody needs for the first paint: the shared tooltip (hover only) and
// the exit-intent invite (fires when the pointer heads for the tab bar). Their code, and
// the animation library they share, loads once the page is idle instead of with it.
const TooltipHost = dynamic(() => import("@/components/ui/TooltipHost"), { ssr: false });
const ExitIntentInviteModal = dynamic(() => import("./modals/ExitIntentInviteModal"), { ssr: false });

export default function DeferredGlobals() {
  const idle = useIdle();
  if (!idle) return null;
  return (
    <>
      <ExitIntentInviteModal />
      <TooltipHost />
    </>
  );
}
