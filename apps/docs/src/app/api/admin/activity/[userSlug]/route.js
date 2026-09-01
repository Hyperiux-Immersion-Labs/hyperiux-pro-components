import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { buildDailyBuckets, fillDailyBuckets, utcDateString } from "@/lib/admin-activity";
import { buildUserActivitySlug } from "@/lib/user-slug";
import { getTemplateBySlug } from "@/lib/mock-templates";

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
      { data: templatePurchaseRows, error: templatePurchasesError },
      { data: savedRows, error: savedError },
      { data: copyRows, error: copyError },
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
        .from("template_purchases")
        .select("id,template_slug,razorpay_payment_id,amount,currency,status,created_at")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("wishlisted_effects")
        .select("id,effect_slug,title,category,cover_image,tier,created_at")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false }),

      // install_unlocks supersedes copy_usage_effects (Installation-SyncUp.md
      // Stage 1.5) - covers CLI/MCP installs too now, not just web copies.
      supabase
        .from("install_unlocks")
        .select("effect_slug, usage_date")
        .eq("clerk_user_id", userId)
        .order("usage_date", { ascending: false }),

      getAllSanityEffectEntries(),
    ]);

    const firstError =
      subscriptionError || invoicesError || templatePurchasesError || savedError || copyError;

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
        name: slug,
        title: metadata?.title || slug,
        coverImage: metadata?.coverImage || slug,
        tier: metadata?.tier || "free",
      };
    }

    // Dedupe to most-recent-per-effect for the "copied effects" list, same
    // as /api/dashboard/usage/route.js - rows are already newest-first.
    const seenSlugs = new Set();
    const copiedEffects = [];

    for (const row of copyRows || []) {
      if (seenSlugs.has(row.effect_slug)) continue;
      seenSlugs.add(row.effect_slug);

      copiedEffects.push({
        ...resolveEffect(row.effect_slug),
        lastCopiedAt: row.usage_date,
      });
    }

    const copyTrend = fillDailyBuckets(
      buildDailyBuckets(TREND_DAYS),
      (copyRows || []).filter((row) => row.usage_date >= utcDateString(TREND_DAYS - 1)),
      (row) => row.usage_date
    );

    const savedEffects = (savedRows || []).map((row) => ({
      id: row.id,
      name: row.effect_slug,
      title: row.title || resolveEffect(row.effect_slug).title,
      category: row.category,
      coverImage: row.cover_image || resolveEffect(row.effect_slug).coverImage,
      tier: row.tier || "free",
      savedAt: row.created_at,
    }));

    const lifetimeSpend =
      (invoiceRows || [])
        .filter((row) => row.status === "paid" && !row.is_test)
        .reduce((sum, row) => sum + row.amount, 0) / 100;

    // amount is already whole currency units here (verify-payment/route.js
    // divides Razorpay's paise/cents amount by 100 before recording), unlike
    // invoices.amount above - do not divide this by 100 again.
    const templatePurchases = (templatePurchaseRows || []).map((row) => ({
      id: row.id,
      templateSlug: row.template_slug,
      templateTitle: getTemplateBySlug(row.template_slug)?.title || row.template_slug,
      paymentId: row.razorpay_payment_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      profile: {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || null,
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
        lifetimeSpend,
      },
      copyTrend,
      savedEffects,
      copiedEffects,
      invoices: invoiceRows || [],
      templatePurchases,
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
