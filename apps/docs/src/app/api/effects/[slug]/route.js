import { NextResponse } from "next/server";
import { getEffectMetadata, buildEffectDeliveryPayload } from "@/lib/registry";
import { getCliTokenFromRequest } from "@/lib/cli-auth";
import { getEffectAccessDecision } from "@/lib/effect-access";

// Legacy web-facing twin of /api/cli/effects/[effectSlug] - same
// CLI-token-based auth, same content source. Previously fetched Pro source
// live from the private GitHub repo's Contents API and hand-rolled its own
// token verification (missing the revocation check the CLI route had),
// which is exactly the drift the F-040 consolidation was meant to close.
// See docs/effect-access.md for the full entry-point map.

const REASON_STATUS = {
  "invalid-credential": 401,
  anonymous: 401,
  revoked: 403,
  "no-subscription": 403,
  expired: 403,
  error: 500,
};

const REASON_MESSAGE = {
  "invalid-credential": "Invalid token.",
  anonymous: "Authorization token required.",
  revoked: "This token has been revoked.",
  "no-subscription": "Pro subscription required.",
  expired: "Subscription has expired.",
  error: "Unable to verify token.",
};

export async function GET(req, { params }) {
  const { slug } = await params;

  const effectMeta = getEffectMetadata(slug);

  if (!effectMeta) {
    return NextResponse.json({ error: `Effect "${slug}" not found.` }, { status: 404 });
  }

  const effectTier = effectMeta.tier || "free";
  const cliToken = getCliTokenFromRequest(req);

  const access = await getEffectAccessDecision({ effectTier, cliToken });

  if (!access.allowed) {
    return NextResponse.json(
      {
        error: REASON_MESSAGE[access.reason] || "Access denied.",
        reason: access.reason,
      },
      { status: REASON_STATUS[access.reason] || 403 }
    );
  }

  const payload = buildEffectDeliveryPayload(slug);

  return NextResponse.json({ ...payload, tier: effectTier });
}
