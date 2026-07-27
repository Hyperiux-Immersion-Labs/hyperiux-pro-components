import { NextResponse } from "next/server";
import { getEffectMetadata, buildEffectDeliveryPayload } from "@/lib/registry";
import { getCliTokenFromRequest } from "@/lib/cli-auth";
import { getEffectAccessDecision } from "@/lib/effect-access";

// See docs/effect-access.md for how this route relates to
// /api/effects/[slug] (the legacy web route) and the effect detail page.

const REASON_STATUS = {
  "invalid-credential": 401,
  anonymous: 401,
  revoked: 403,
  "no-subscription": 403,
  expired: 403,
  error: 500,
};

const REASON_MESSAGE = {
  "invalid-credential": "Invalid CLI token.",
  anonymous: "Missing CLI token.",
  revoked: "This CLI token has been revoked.",
  "no-subscription": "This token does not belong to an active Pro account.",
  expired: "Your Pro subscription has expired.",
  error: "Unable to verify CLI token.",
};

export async function GET(request, { params }) {
  const { effectSlug } = await params;

  const effectMeta = getEffectMetadata(effectSlug);

  if (!effectMeta) {
    return NextResponse.json({ error: "Effect not found." }, { status: 404 });
  }

  const effectTier = effectMeta.tier || "free";
  const cliToken = getCliTokenFromRequest(request);

  const access = await getEffectAccessDecision({ effectTier, cliToken });

  if (!access.allowed) {
    return NextResponse.json(
      {
        error: REASON_MESSAGE[access.reason] || "Access denied.",
        reason: access.reason,
        requiresPro: true,
      },
      { status: REASON_STATUS[access.reason] || 403 }
    );
  }

  // Content is only read from disk after the access decision above.
  const payload = buildEffectDeliveryPayload(effectSlug);

  return NextResponse.json({ ...payload, tier: effectTier });
}
