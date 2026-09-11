import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { buildDailyBucketsForRange, fillDailyBuckets, resolveDateBounds } from "@/lib/admin-activity";

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

export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const { startISO, endISO, startDateString, endDateString } = resolveDateBounds({
      range,
      from,
      to,
    });

    function scoped(query, column = "created_at") {
      let q = query;
      if (startISO) q = q.gte(column, startISO);
      if (endISO) q = q.lt(column, endISO);
      return q;
    }

    const [
      { count: totalUsers, error: totalUsersError },
      { count: proUsers, error: proUsersError },
      // Plan distribution is "what does the whole site look like right now,"
      // not "what does the site look like among people who joined in this
      // window" - deliberately unscoped, so picking "Last 7 days" doesn't
      // quietly turn this into a donut of one week's signups.
      { count: siteTotalUsers, error: siteTotalUsersError },
      { count: siteProUsers, error: siteProUsersError },
      { data: signupRows, error: signupError },
      { data: copyRows, error: copyError },
      { data: allCopyRows, error: allCopyError },
      { data: allSavedRows, error: allSavedError },
      { data: revenueRows, error: revenueError },
      sanityEntries,
    ] = await Promise.all([
      scoped(supabase.from("subscriptions").select("clerk_user_id", { count: "exact", head: true })),
      scoped(
        supabase
          .from("subscriptions")
          .select("clerk_user_id", { count: "exact", head: true })
          .eq("plan", "pro")
      ),
      supabase.from("subscriptions").select("clerk_user_id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("clerk_user_id", { count: "exact", head: true })
        .eq("plan", "pro"),
      scoped(supabase.from("subscriptions").select("created_at")),
      // install_unlocks supersedes copy_usage_effects (Installation-SyncUp.md
      // Stage 1.5) - it's the shared ledger across web/CLI/MCP now, not just
      // web copies, so "copies" here is really "installs" going forward.
      scoped(supabase.from("install_unlocks").select("usage_date"), "usage_date"),
      scoped(supabase.from("install_unlocks").select("effect_slug"), "usage_date"),
      scoped(supabase.from("wishlisted_effects").select("effect_slug")),
      // is_test excluded - those are admin-generated sample bills, not real revenue.
      scoped(
        supabase.from("invoices").select("amount, created_at").eq("status", "paid").eq("is_test", false)
      ),
      getAllSanityEffectEntries(),
    ]);

    const firstError =
      totalUsersError ||
      proUsersError ||
      siteTotalUsersError ||
      siteProUsersError ||
      signupError ||
      copyError ||
      allCopyError ||
      allSavedError ||
      revenueError;

    if (firstError) {
      console.error("ADMIN_ACTIVITY_OVERVIEW_ERROR:", firstError);
      return NextResponse.json({ error: "Failed to load activity overview" }, { status: 500 });
    }

    // One Sanity call, reused for both top-saved and top-copied title lookups
    // (mirrors the pattern in /api/dashboard/usage/route.js).
    const sanityEffectsBySlug = new Map(
      buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect])
    );

    // Full effect summary (not just a title) - the "Top saved/copied
    // effects" sliders render an actual effect card, so they need a cover
    // image, tier badge, and a real route, not just a display name. Sanity
    // is preferred (its coverImage/tier are what the live site itself
    // renders), falling back to the registry entry for effects with no
    // Sanity content yet.
    function resolveEffectSummary(slug) {
      const sanityEntry = sanityEffectsBySlug.get(slug);
      const registryEntry = getEffectMetadata(slug);

      return {
        slug,
        name: slug,
        title: sanityEntry?.title || registryEntry?.title || slug,
        coverImage: sanityEntry?.coverImage || registryEntry?.coverImage || slug,
        videoUrl: sanityEntry?.videoUrl || registryEntry?.videoUrl || null,
        tier: sanityEntry?.tier || registryEntry?.tier || "free",
        categorySlug: sanityEntry?.categorySlug || registryEntry?.categories?.[0] || null,
      };
    }

    const signupTrend = fillDailyBuckets(
      buildDailyBucketsForRange({ startDateString, endDateString }),
      signupRows || [],
      (row) => new Date(row.created_at).toISOString().slice(0, 10)
    );

    const copyTrend = fillDailyBuckets(
      buildDailyBucketsForRange({ startDateString, endDateString }),
      copyRows || [],
      (row) => row.usage_date
    );

    const revenueTrend = fillDailyBuckets(
      buildDailyBucketsForRange({ startDateString, endDateString }),
      revenueRows || [],
      (row) => new Date(row.created_at).toISOString().slice(0, 10),
      (row) => row.amount / 100
    );

    const revenue = (revenueRows || []).reduce((sum, row) => sum + row.amount, 0) / 100;

    const topSavedEffects = topSlugCounts(allSavedRows || [], TOP_EFFECTS_LIMIT).map(
      ({ slug, count }) => ({ ...resolveEffectSummary(slug), count })
    );

    const topCopiedEffects = topSlugCounts(allCopyRows || [], TOP_EFFECTS_LIMIT).map(
      ({ slug, count }) => ({ ...resolveEffectSummary(slug), count })
    );

    const planDistribution = [
      { name: "Pro", value: siteProUsers || 0 },
      { name: "Free", value: Math.max(0, (siteTotalUsers || 0) - (siteProUsers || 0)) },
    ];

    return NextResponse.json({
      range,
      stats: {
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        // Same "copies" count either way - (install_unlocks in the selected
        // window) - only the label on the frontend changes when the window
        // itself is "Today", so this doubles as both "Total Copies" and
        // "Copies Today" without two separate queries.
        totalCopies: (copyRows || []).length,
        totalSaved: (allSavedRows || []).length,
        revenue,
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
