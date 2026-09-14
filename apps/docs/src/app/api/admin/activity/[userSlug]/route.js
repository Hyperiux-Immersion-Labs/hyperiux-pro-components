import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { buildDailyBuckets, fillDailyBuckets, utcDateString } from "@/lib/admin-activity";
import { buildUserActivitySlug } from "@/lib/user-slug";

const TREND_DAYS = 30;

// Matches the bounded-fetch approach already used for the signups trend in
// /api/admin/activity/overview - fine at this product's current scale;
// would need real pagination past this many registered users.
const MAX_USERS_FOR_SLUG_LOOKUP = 500;

// The slug carries no id (by design - readable name/email only), so it has
// to be resolved by computing every candidate's slug and matching, rather
// than looked up directly. clerk_user_id list comes from Supabase since
// that's the same source /api/admin/users already treats as the user list.
async function findUserBySlug(clerk, slug) {
  const { data: subscriptionRows } = await supabase
    .from("subscriptions")
    .select("clerk_user_id")
    .limit(MAX_USERS_FOR_SLUG_LOOKUP);

  const clerkUserIds = (subscriptionRows || [])
    .map((row) => row.clerk_user_id)
    .filter(Boolean);

  if (!clerkUserIds.length) return null;

  const { data: clerkUsers } = await clerk.users.getUserList({
    userId: clerkUserIds,
    limit: clerkUserIds.length,
  });

  return (
    (clerkUsers || []).find(
      (user) =>
        buildUserActivitySlug({
          name: user.fullName || user.firstName || null,
          email: user.emailAddresses?.[0]?.emailAddress || null,
        }) === slug
    ) || null
  );
}

export async function GET(request, { params }) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userSlug } = await params;

  try {
    const clerk = await clerkClient();
    const clerkUser = await findUserBySlug(clerk, userSlug);

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = clerkUser.id;

    // Best-effort device/location enrichment - Clerk only retains recent
    // sessions, and a user with no active session (expired/signed out
    // everywhere) is a normal, non-error state, not something to fail on.
    let sessions = [];
    try {
      const sessionList = await clerk.sessions.getSessionList({ userId });
      sessions = sessionList?.data || [];
    } catch (sessionError) {
      console.error("ADMIN_ACTIVITY_SESSIONS_ERROR:", userId, sessionError);
    }

    const latestSession = sessions
      .slice()
      .sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0))[0] || null;

    const [
      { data: subscriptionRow, error: subscriptionError },
      { data: invoiceRows, error: invoicesError },
      { data: savedRows, error: savedError },
      { data: copyRows, error: copyError },
      { data: installRows, error: installError },
      sanityEntries,
    ] = await Promise.all([
      supabase
        .from("subscriptions")
        .select(
          "plan,status,billing_interval,current_period_end,razorpay_subscription_id,cli_token_hash,cli_token_revoked_at,cli_token_last_used_at,created_at"
        )
        .eq("clerk_user_id", userId)
        .maybeSingle(),

      supabase
        .from("invoices")
        .select("id,amount,currency,status,plan_label,is_test,created_at")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("wishlisted_effects")
        .select("id,effect_slug,title,category,cover_image,tier,created_at")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false }),

      // install_unlocks supersedes copy_usage_effects (Installation-SyncUp.md
      // Stage 1.5) and is the shared ledger across web/CLI/MCP - but
      // "copies" here specifically means the website's copy button (same as
      // the Overview page's Total Copies/Copy activity), so it's scoped to
      // source='web' rather than folding CLI/MCP installs into a "copies"
      // label.
      supabase
        .from("install_unlocks")
        .select("effect_slug, usage_date")
        .eq("clerk_user_id", userId)
        .eq("source", "web")
        .order("usage_date", { ascending: false }),

      // Unscoped by source, unlike copyRows above - "installed" means every
      // surface (web/CLI/MCP), same as "Top installed effects" on the
      // Overview page. Copies are always a subset of this (every web copy
      // is also an install_unlocks row), which is exactly what lets the
      // page below hide this slider when it'd just be a duplicate of
      // "Copied Effects".
      supabase
        .from("install_unlocks")
        .select("effect_slug, usage_date")
        .eq("clerk_user_id", userId)
        .order("usage_date", { ascending: false }),

      getAllSanityEffectEntries(),
    ]);

    const firstError = subscriptionError || invoicesError || savedError || copyError || installError;

    if (firstError) {
      console.error("ADMIN_ACTIVITY_USER_ERROR:", userId, firstError);
      return NextResponse.json({ error: "Failed to load user activity" }, { status: 500 });
    }

    const sanityEffectsBySlug = new Map(
      buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect])
    );

    function resolveEffect(slug) {
      const metadata = sanityEffectsBySlug.get(slug) || getEffectMetadata(slug);
      return {
        slug,
        name: slug,
        title: metadata?.title || slug,
        coverImage: metadata?.coverImage || slug,
        videoUrl: metadata?.videoUrl || null,
        tier: metadata?.tier || "free",
        // metadata is either a Sanity entry (categorySlug) or a registry
        // entry (categories[]) - checking both covers whichever shape it
        // actually is, same as resolveEffectSummary() in the overview
        // route. Needed so EffectRankSlider's card links (getEffectHref)
        // land on the right category instead of silently defaulting to
        // "components".
        categorySlug: metadata?.categorySlug || metadata?.categories?.[0] || null,
      };
    }

    // Dedupe to most-recent-per-effect - same as /api/dashboard/usage/route.js
    // - rows are already newest-first. Shared by both copiedEffects and
    // installedEffects below, since it's the same "one row per effect,
    // most recent date wins" reduction either way.
    function dedupeMostRecent(rows, dateField) {
      const seenSlugs = new Set();
      const effects = [];

      for (const row of rows || []) {
        if (seenSlugs.has(row.effect_slug)) continue;
        seenSlugs.add(row.effect_slug);

        effects.push({ ...resolveEffect(row.effect_slug), [dateField]: row.usage_date });
      }

      return effects;
    }

    const copiedEffects = dedupeMostRecent(copyRows, "lastCopiedAt");
    const installedEffects = dedupeMostRecent(installRows, "lastInstalledAt");

    const copyTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      (copyRows || []).filter((row) => row.usage_date >= utcDateString(TREND_DAYS - 1)),
      (row) => row.usage_date
    );

    const savedEffects = (savedRows || []).map((row) => ({
      id: row.id,
      slug: row.effect_slug,
      name: row.effect_slug,
      title: row.title || resolveEffect(row.effect_slug).title,
      category: row.category,
      coverImage: row.cover_image || resolveEffect(row.effect_slug).coverImage,
      videoUrl: resolveEffect(row.effect_slug).videoUrl,
      tier: row.tier || "free",
      savedAt: row.created_at,
    }));

    // Same currency as whatever's actually in Billing History below - a
    // user's invoices are effectively always one currency in practice
    // (Razorpay picks it once, by geo, and it doesn't change), so the first
    // paid invoice's currency is the right one to sum and label this in,
    // rather than a hardcoded "INR" that reads wrong for a USD customer.
    const paidInvoices = (invoiceRows || []).filter((row) => row.status === "paid" && !row.is_test);
    const lifetimeSpend = paidInvoices.reduce((sum, row) => sum + row.amount, 0) / 100;
    const lifetimeSpendCurrency = paidInvoices[0]?.currency || "INR";

    return NextResponse.json({
      profile: {
        id: clerkUser.id,
        // Name is never blank in the UI: falls back to the email's
        // local-part, capitalized - same convention as displayName() in
        // dashboard/admin/page.js and resolveDisplayName() in
        // InstallActivityTab.js - rather than a generic "Unnamed user"
        // placeholder when Clerk has no first/last name on file (invited
        // accounts that completed sign-up through Clerk's own hosted widget
        // without ever being asked for one, mainly).
        name:
          clerkUser.fullName ||
          clerkUser.firstName ||
          (() => {
            const local = clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0];
            return local ? local.charAt(0).toUpperCase() + local.slice(1) : null;
          })(),
        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
        imageUrl: clerkUser.imageUrl || null,
        joinedAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        isAdmin: clerkUser.publicMetadata?.role === "admin",
      },
      session: latestSession
        ? {
            status: latestSession.status,
            lastActiveAt: latestSession.lastActiveAt,
            browserName: latestSession.latestActivity?.browserName || null,
            deviceType: latestSession.latestActivity?.deviceType || null,
            city: latestSession.latestActivity?.city || null,
            country: latestSession.latestActivity?.country || null,
          }
        : null,
      subscription: subscriptionRow || null,
      stats: {
        savedCount: (savedRows || []).length,
        copiedCount: copiedEffects.length,
        installedCount: installedEffects.length,
        lifetimeSpend,
      },
      copyTrend,
      savedEffects,
      copiedEffects,
      installedEffects,
      invoices: invoiceRows || [],
    });
  } catch (error) {
    // userId may not be assigned yet if the error happened before the slug
    // resolved to a user - log the slug instead, which is always in scope.
    console.error("ADMIN_ACTIVITY_USER_ERROR:", userSlug, error);

    if (error?.status === 404 || error?.clerkError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to load user activity" }, { status: 500 });
  }
}
