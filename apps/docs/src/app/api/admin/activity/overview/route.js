import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { buildDailyBuckets, fillDailyBuckets, utcDateString } from "@/lib/admin-activity";

const TREND_DAYS = 30;
const TOP_EFFECTS_LIMIT = 10;

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

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const thirtyDaysAgoDate = utcDateString(TREND_DAYS - 1);
    const thirtyDaysAgoISO = `${thirtyDaysAgoDate}T00:00:00.000Z`;
    const monthStartISO = `${utcDateString(0).slice(0, 7)}-01T00:00:00.000Z`;

    const [
      { count: totalUsers, error: totalUsersError },
      { count: proUsers, error: proUsersError },
      { data: signupRows, error: signupError },
      { data: copyRows, error: copyError },
      { data: allCopyRows, error: allCopyError },
      { data: allSavedRows, error: allSavedError },
      { data: revenueRows, error: revenueError },
      { count: copiesToday, error: copiesTodayError },
      sanityEntries,
    ] = await Promise.all([
      supabase.from("subscriptions").select("clerk_user_id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("clerk_user_id", { count: "exact", head: true })
        .eq("plan", "pro"),
      supabase.from("subscriptions").select("created_at").gte("created_at", thirtyDaysAgoISO),
      // install_unlocks supersedes copy_usage_effects (Installation-SyncUp.md
      // Stage 1.5) - it's the shared ledger across web/CLI/MCP now, not just
      // web copies, so "copies" here is really "installs" going forward.
      supabase
        .from("install_unlocks")
        .select("usage_date")
        .gte("usage_date", thirtyDaysAgoDate),
      supabase.from("install_unlocks").select("effect_slug"),
      supabase.from("wishlisted_effects").select("effect_slug"),
      // is_test excluded - those are admin-generated sample bills, not real revenue.
      supabase
        .from("invoices")
        .select("amount, created_at")
        .eq("status", "paid")
        .eq("is_test", false)
        .gte("created_at", thirtyDaysAgoISO),
      supabase
        .from("install_unlocks")
        .select("clerk_user_id", { count: "exact", head: true })
        .eq("usage_date", utcDateString(0)),
      getAllSanityEffectEntries(),
    ]);

    const firstError =
      totalUsersError ||
      proUsersError ||
      signupError ||
      copyError ||
      allCopyError ||
      allSavedError ||
      revenueError ||
      copiesTodayError;

    if (firstError) {
      console.error("ADMIN_ACTIVITY_OVERVIEW_ERROR:", firstError);
      return NextResponse.json({ error: "Failed to load activity overview" }, { status: 500 });
    }

    // One Sanity call, reused for both top-saved and top-copied title lookups
    // (mirrors the pattern in /api/dashboard/usage/route.js).
    const sanityEffectsBySlug = new Map(
      buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect])
    );

    function resolveTitle(slug) {
      return (
        sanityEffectsBySlug.get(slug)?.title ||
        getEffectMetadata(slug)?.title ||
        slug
      );
    }

    const signupTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      signupRows || [],
      (row) => new Date(row.created_at).toISOString().slice(0, 10)
    );

    const copyTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      copyRows || [],
      (row) => row.usage_date
    );

    const revenueTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      revenueRows || [],
      (row) => new Date(row.created_at).toISOString().slice(0, 10),
      (row) => row.amount / 100
    );

    const monthToDateRevenue =
      (revenueRows || [])
        .filter((row) => row.created_at >= monthStartISO)
        .reduce((sum, row) => sum + row.amount, 0) / 100;

    const topSavedEffects = topSlugCounts(allSavedRows || [], TOP_EFFECTS_LIMIT).map(
      ({ slug, count }) => ({ name: resolveTitle(slug), value: count })
    );

    const topCopiedEffects = topSlugCounts(allCopyRows || [], TOP_EFFECTS_LIMIT).map(
      ({ slug, count }) => ({ name: resolveTitle(slug), value: count })
    );

    const planDistribution = [
      { name: "Pro", value: proUsers || 0 },
      { name: "Free", value: Math.max(0, (totalUsers || 0) - (proUsers || 0)) },
    ];

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        copiesToday: copiesToday || 0,
        totalSaved: (allSavedRows || []).length,
        monthToDateRevenue,
      },
      signupTrend,
      copyTrend,
      revenueTrend,
      planDistribution,
      topSavedEffects,
      topCopiedEffects,
    });
  } catch (error) {
    console.error("ADMIN_ACTIVITY_OVERVIEW_ERROR:", error);
    return NextResponse.json({ error: "Failed to load activity overview" }, { status: 500 });
  }
}
