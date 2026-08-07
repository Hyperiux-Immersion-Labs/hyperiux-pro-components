import { NextResponse } from "next/server";
import { getCliTokenFromRequest, verifyCliToken } from "@/lib/cli-auth";
import { getEffectMetadata } from "@/lib/registry";
import { supabase } from "@/lib/supabase";

const EVENT_ALIASES = {
  add: "added",
  added: "added",
  effect_add: "added",
  effect_added: "added",
  install: "installed",
  installed: "installed",
  effect_install: "installed",
  effect_installed: "installed",
};

function normalizeEvent(value) {
  if (typeof value !== "string") return null;

  return EVENT_ALIASES[value.trim().toLowerCase()] || null;
}

function normalizeSlug(value) {
  if (typeof value !== "string") return null;

  const slug = value.trim();

  return slug || null;
}

function limitHeader(value, maxLength = 180) {
  if (!value) return null;

  return value.slice(0, maxLength);
}

async function resolveCliIdentity(request) {
  const cliToken = getCliTokenFromRequest(request);

  if (!cliToken) {
    return { clerkUserId: null };
  }

  const verification = await verifyCliToken(cliToken);

  if (!verification.valid) {
    return {
      response: NextResponse.json(
        {
          tracked: false,
          error: verification.reason,
        },
        { status: verification.status || 401 }
      ),
    };
  }

  return { clerkUserId: verification.clerkUserId };
}

// POST /api/cli/telemetry
// Called by the CLI after a local effect add/install succeeds.
// Body: { event: "added" | "installed", effectSlug: "blur-text" }
export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { tracked: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const eventType = normalizeEvent(body.event || body.type || body.action);
  const effectSlug = normalizeSlug(
    body.effectSlug || body.effectName || body.slug || body.effect
  );

  if (!eventType) {
    return NextResponse.json(
      {
        tracked: false,
        error: "Invalid telemetry event.",
        allowedEvents: ["added", "installed"],
      },
      { status: 400 }
    );
  }

  if (!effectSlug) {
    return NextResponse.json(
      { tracked: false, error: "Missing effect slug." },
      { status: 400 }
    );
  }

  const effectMeta = getEffectMetadata(effectSlug);

  if (!effectMeta) {
    return NextResponse.json(
      { tracked: false, error: "Effect not found." },
      { status: 404 }
    );
  }

  const identity = await resolveCliIdentity(request);

  if (identity.response) {
    return identity.response;
  }

  const now = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("cli_effect_usage")
    .select("added_count, installed_count")
    .eq("effect_slug", effectSlug)
    .maybeSingle();

  if (readError) {
    console.error("CLI_TELEMETRY_READ_ERROR:", readError);

    return NextResponse.json(
      { tracked: false, error: "Unable to read CLI telemetry." },
      { status: 500 }
    );
  }

  const nextAddedCount =
    (existing?.added_count || 0) + (eventType === "added" ? 1 : 0);
  const nextInstalledCount =
    (existing?.installed_count || 0) + (eventType === "installed" ? 1 : 0);

  const { error: writeError } = await supabase.from("cli_effect_usage").upsert(
    {
      effect_slug: effectSlug,
      effect_title: effectMeta.title || effectMeta.name || effectSlug,
      effect_category:
        effectMeta.category || effectMeta.categories?.[0] || "components",
      effect_tier: effectMeta.tier || "free",
      added_count: nextAddedCount,
      installed_count: nextInstalledCount,
      last_event_type: eventType,
      last_clerk_user_id: identity.clerkUserId,
      last_cli_version: limitHeader(
        body.cliVersion || request.headers.get("x-hyperiux-cli-version"),
        80
      ),
      last_user_agent: limitHeader(request.headers.get("user-agent")),
      updated_at: now,
    },
    { onConflict: "effect_slug" }
  );

  if (writeError) {
    console.error("CLI_TELEMETRY_WRITE_ERROR:", writeError);

    return NextResponse.json(
      { tracked: false, error: "Unable to write CLI telemetry." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    tracked: true,
    event: eventType,
    effectSlug,
    count: eventType === "added" ? nextAddedCount : nextInstalledCount,
    counts: {
      added: nextAddedCount,
      installed: nextInstalledCount,
    },
  });
}
