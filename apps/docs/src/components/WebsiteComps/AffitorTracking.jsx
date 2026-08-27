"use client";

import { useLoadAffitor } from "@affitor/sdk/react";
import { AFFITOR_PROGRAM_ID } from "@/lib/affitor-program";

// Affiliate click tracking (docs.affitor.com/brand/tracking/click-tracking).
// Homepage-only by design - rendered directly in (marketing)/page.js rather
// than the root layout, since that's the only page we want attributed here.
// useLoadAffitor is the SDK's own "standalone alternative to
// AffitorProvider" for exactly this single-page use case.
export default function AffitorTracking() {
  useLoadAffitor(AFFITOR_PROGRAM_ID);
  return null;
}
