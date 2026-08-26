"use client";

import { useLoadAffitor } from "@affitor/sdk/react";

// Affiliate click tracking (docs.affitor.com/brand/tracking/click-tracking).
// Homepage-only by design - rendered directly in (marketing)/page.js rather
// than the root layout, since that's the only page we want attributed here.
// useLoadAffitor is the SDK's own "standalone alternative to
// AffitorProvider" for exactly this single-page use case.
export default function AffitorTracking() {
  useLoadAffitor("1062");
  return null;
}
