import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { buildDailyBuckets, fillDailyBuckets, utcDateString } from "@/lib/admin-activity";

// Stage 2 (Installation-SyncUp.md): calibrate the 2/3/10 daily limits against
// real install_events data before Stage 3 flips INSTALL_LIMIT_ENFORCE on.
// The single question this exists to answer: are the limits right, or are
// CI pipelines / monorepos / shared office IPs about to get falsely capped?

const TREND_DAYS = 30;
const TOP_EFFECTS_LIMIT = 10;
const TOP_USERS_LIMIT = 15;

// Same success-vs-attempt distinction as /api/admin/copy-activity - "allowed"
// and "already-unlocked" are real deliveries, "denied" rows never happened.
const SUCCESS_DECISIONS = ["allowed", "already-unlocked"];

// Only signed-in identities have a clerk_user_id to rank and a Clerk profile
// to resolve a name/email from - anonymous device:/ip: activity has no "user"
// to put on a leaderboard, so it's excluded here.
function topUserCounts(rows, limit) {
  const counts = new Map();

  for (const row of rows) {
    if (!row.clerk_user_id || !SUCCESS_DECISIONS.includes(row.decision)) continue;
    counts.set(row.clerk_user_id, (counts.get(row.clerk_user_id) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([clerkUserId, count]) => ({ clerkUserId, count }));
}

function topSlugCounts(rows, limit) {
  const counts = new Map();

  for (const row of rows) {
    if (!row.effect_slug) continue;
    counts.set(row.effect_slug, (counts.get(row.effect_slug) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug, count]) => ({ slug, count }));
}

function countBy(rows, key) {
  const counts = new Map();

  for (const row of rows) {
    const value = row[key] || "unknown";
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const thirtyDaysAgoDate = utcDateString(TREND_DAYS - 1);
    const thirtyDaysAgoISO = `${thirtyDaysAgoDate}T00:00:00.000Z`;
    const today = utcDateString(0);

    const [{ data: eventRows, error: eventsError }, sanityEntries] = await Promise.all([
      supabase
        .from("install_events")
        .select(
          "occurred_at,identity_key,clerk_user_id,device_id,ip_hash,effect_slug,effect_tier,source,plan,decision,reason,enforced,would_have_denied,cli_version,mcp_version"
        )
        .gte("occurred_at", thirtyDaysAgoISO)
        .order("occurred_at", { ascending: false }),
      getAllSanityEffectEntries(),
    ]);

    if (eventsError) {
      console.error("ADMIN_INSTALLS_ERROR:", eventsError);
      return NextResponse.json({ error: "Failed to load install events" }, { status: 500 });
    }

    const events = eventRows || [];
    const sanityEffectsBySlug = new Map(
      buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect])
    );

    function resolveTitle(slug) {
      return sanityEffectsBySlug.get(slug)?.title || getEffectMetadata(slug)?.title || slug;
    }

    const todayEvents = events.filter((row) => row.occurred_at.slice(0, 10) === today);
    const deniedRows = events.filter((row) => row.would_have_denied);
    const allowedRows = events.filter((row) => row.decision === "allowed");
    const alreadyUnlockedRows = events.filter((row) => row.decision === "already-unlocked");

    const installTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      events,
      (row) => row.occurred_at.slice(0, 10)
    );

    const wouldHaveDeniedTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      deniedRows,
      (row) => row.occurred_at.slice(0, 10)
    );

    const topEffects = topSlugCounts(events, TOP_EFFECTS_LIMIT).map(({ slug, count }) => ({
      name: resolveTitle(slug),
      slug,
      value: count,
    }));

    const wouldHaveDeniedRate = events.length ? deniedRows.length / events.length : 0;

    const userCounts = topUserCounts(events, TOP_USERS_LIMIT);
    let clerkMap = {};
    if (userCounts.length > 0) {
      const clerkUserIds = userCounts.map((entry) => entry.clerkUserId);
      const clerk = await clerkClient();
      const results = await clerk.users.getUserList({
        userId: clerkUserIds,
        limit: clerkUserIds.length,
      });
      clerkMap = Object.fromEntries((results.data || []).map((u) => [u.id, u]));
    }

    const topUsers = userCounts.map(({ clerkUserId, count }) => {
      const clerkUser = clerkMap[clerkUserId];
      return {
        clerkUserId,
        name: clerkUser?.fullName || clerkUser?.firstName || null,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        imageUrl: clerkUser?.imageUrl || null,
        count,
      };
    });

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        eventsToday: todayEvents.length,
        allowedCount: allowedRows.length,
        alreadyUnlockedCount: alreadyUnlockedRows.length,
        deniedCount: events.length - allowedRows.length - alreadyUnlockedRows.length,
        wouldHaveDeniedCount: deniedRows.length,
        wouldHaveDeniedRate,
        enforced: events.some((row) => row.enforced),
      },
      sourceBreakdown: countBy(events, "source"),
      planBreakdown: countBy(events, "plan"),
      installTrend,
      wouldHaveDeniedTrend,
      topEffects,
      topUsers,
    });
  } catch (error) {
    console.error("ADMIN_INSTALLS_ERROR:", error);
    return NextResponse.json({ error: "Failed to load install events" }, { status: 500 });
  }
}
