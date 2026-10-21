import { clerkClient } from "@clerk/nextjs/server";
import { displayName } from "@/lib/display-name";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { can, getRole, requireAdminAccess } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import {
  buildDailyBucketsForRange,
  fillDailyBucketsBySeries,
  resolveDateBounds,
} from "@/lib/admin-activity";
import { buildUserActivitySlug } from "@/lib/user-slug";
import { getTemplateBySlug } from "@/lib/mock-templates";
import { INSTALL_SOURCES, fetchInstalls, getAllClerkUsers } from "@/lib/admin-data";

// The account behind the page: the Clerk id from ?u= (what every link carries - the
// slug alone can be two people, lib/user-slug), else the first account whose slug
// matches, searched across every Clerk account (lib/admin-data getAllClerkUsers).
async function findUser(clerk, slug, clerkUserId) {
  if (clerkUserId) {
    try {
      return await clerk.users.getUser(clerkUserId);
    } catch {
      return null;
    }
  }

  return (
    (await getAllClerkUsers()).find(
      (user) =>
        buildUserActivitySlug({
          name: displayName(user),
          email: user.emailAddresses?.[0]?.emailAddress || null,
        }) === slug
    ) || null
  );
}

export async function GET(request, { params }) {
  const access = await requireAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Payments, spend and the subscription's billing need finance.view, like revenue - left
  // out of the response otherwise, not just hidden on the page
  const showBilling = can(access, "finance.view");

  const { userSlug } = await params;

  try {
    const clerk = await clerkClient();
    const clerkUser = await findUser(clerk, userSlug, new URL(request.url).searchParams.get("u"));

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

    const { searchParams } = new URL(request.url);
    const { startISO, endISO, startDateString, endDateString } = resolveDateBounds({
      range: searchParams.get("range"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    function scoped(query, column = "created_at") {
      let q = query;
      if (startISO) q = q.gte(column, startISO);
      if (endISO) q = q.lt(column, endISO);
      return q;
    }

    // No billing rows without finance.view: nothing to leak
    const nothing = Promise.resolve({ data: [], error: null });
    const inWindow = (row) => (!startISO || row.created_at >= startISO) && (!endISO || row.created_at < endISO);

    const [
      { data: subscriptionRow, error: subscriptionError },
      { data: allInvoiceRows, error: invoicesError },
      { data: allTemplatePurchaseRows, error: templatePurchasesError },
      { data: savedRows, error: savedError },
      installs,
      sanityEntries,
    ] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan,status,billing_interval,current_period_end,razorpay_subscription_id,cli_token_hash,cli_token_revoked_at,cli_token_last_used_at,created_at")
        .eq("clerk_user_id", userId)
        .maybeSingle(),

      // Every payment, not just the window's: "Lifetime spend" is all of it, and the
      // payments list is narrowed to the window below. Real payments only (no test mode).
      showBilling
        ? supabase
            .from("invoices")
            .select("id,amount,currency,status,plan_label,invoice_url,razorpay_payment_id,is_test,created_at")
            .eq("clerk_user_id", userId)
            .eq("is_test", false)
            .order("created_at", { ascending: false })
        : nothing,

      // Every admin sees which templates they own; amounts and receipts are stripped below
      supabase
        .from("template_purchases")
        .select("id,template_slug,razorpay_payment_id,amount,currency,status,source,invoice_url,created_at")
        .eq("clerk_user_id", userId)
        .eq("is_test", false)
        .order("created_at", { ascending: false }),

      scoped(
        supabase
          .from("wishlisted_effects")
          .select("id,effect_slug,title,category,cover_image,tier,created_at")
          .eq("clerk_user_id", userId)
          .order("created_at", { ascending: false })
      ),

      // Their installs in the window - one effect, one day, from the website, the CLI or
      // MCP (lib/admin-data fetchInstalls, the count every admin page uses)
      fetchInstalls({ startISO, endISO, clerkUserId: userId }),

      getAllSanityEffectEntries(),
    ]);

    const firstError =
      subscriptionError || invoicesError || templatePurchasesError || savedError;

    if (firstError) {
      console.error("ADMIN_ACTIVITY_USER_ERROR:", userId, firstError);
      return NextResponse.json({ error: "Failed to load user activity" }, { status: 500 });
    }

    const invoiceRows = (allInvoiceRows || []).filter(inWindow);
    const templatePurchaseRows = (allTemplatePurchaseRows || []).filter(inWindow);

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
        // route. Needed so the per-user page's effect links (getEffectHref)
        // land on the right category instead of silently defaulting to
        // "components".
        categorySlug: metadata?.categorySlug || metadata?.categories?.[0] || null,
      };
    }

    // Every effect they've installed, once, most recent first, with where they took it
    const installRows = installs.map((row) => ({ effect_slug: row.effectSlug, usage_date: row.day, source: row.source }));
    const installedBySlug = new Map();
    for (const row of installRows) {
      const entry = installedBySlug.get(row.effect_slug);
      if (entry) entry.sources.add(row.source);
      else installedBySlug.set(row.effect_slug, { lastInstalledAt: row.usage_date, sources: new Set([row.source]) });
    }
    const installedEffects = [...installedBySlug].map(([slug, { lastInstalledAt, sources }]) => ({
      ...resolveEffect(slug),
      lastInstalledAt,
      sources: INSTALL_SOURCES.filter((source) => sources.has(source)),
    }));

    const installTrend = fillDailyBucketsBySeries(
      buildDailyBucketsForRange({ startDateString, endDateString }),
      installRows || [],
      (row) => row.usage_date,
      (row) => row.source,
      INSTALL_SOURCES
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

    // Grouped by currency, never summed across them or reduced to "whichever
    // currency the first row happened to be" - a user can genuinely have
    // both a USD subscription and an INR one (or vice versa) on file, and
    // picking just paidInvoices[0]'s currency for the whole total is exactly
    // what previously mislabeled a real $179 spend as "₹179". Combines both
    // subscription invoices AND one-time template purchases, since both are
    // real money this user actually spent - "Lifetime Spend" excluding
    // template purchases entirely was the other half of that same report.
    // Lifetime: every payment they've made, whatever the page's window. Credit redemptions
    // moved no money, so they aren't spend.
    const paidInvoices = (allInvoiceRows || []).filter((row) => row.status === "paid" && !row.is_test);
    const paidTemplatePurchases = (allTemplatePurchaseRows || []).filter((row) => row.status === "paid" && row.source !== "credit" && typeof row.amount === "number");

    const lifetimeSpendByCurrencyMap = {};
    for (const row of paidInvoices) {
      const currency = row.currency || "INR";
      lifetimeSpendByCurrencyMap[currency] = (lifetimeSpendByCurrencyMap[currency] || 0) + row.amount / 100;
    }
    // template_purchases.amount is already whole currency units (see
    // comment below), unlike invoices.amount above - do not divide by 100.
    for (const row of paidTemplatePurchases) {
      const currency = row.currency || "USD";
      lifetimeSpendByCurrencyMap[currency] = (lifetimeSpendByCurrencyMap[currency] || 0) + row.amount;
    }
    const lifetimeSpendByCurrency = Object.entries(lifetimeSpendByCurrencyMap).map(([currency, amount]) => ({
      currency,
      amount,
    }));

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
      invoiceUrl: row.invoice_url,
      createdAt: row.created_at,
    }));

    // Full template objects (title, screenshots, tier, href, etc.), not
    // just the slug/title pair templatePurchases carries - the "Purchased
    // Templates" slider below renders these as real TemplateCards, same as
    // the Saved/Copied/Installed Effects sliders above it do for effects.
    // Owned now: refunded purchases no longer count
    const purchasedTemplates = (templatePurchaseRows || [])
      .filter((row) => row.status === "paid")
      .map((row) => getTemplateBySlug(row.template_slug))
      .filter(Boolean);

    return NextResponse.json({
      profile: {
        id: clerkUser.id,
        // Never blank: the account's name, else one read from its email (lib/display-name)
        name: displayName(clerkUser),
        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
        imageUrl: clerkUser.hasImage ? clerkUser.imageUrl : null, // a real photo, not Clerk's placeholder
        joinedAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        // Admin or super admin (lib/admin getRole)
        isAdmin: getRole(clerkUser) !== null,
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
      // The plan for everyone; billing ids and dates, and the token's hash, never leave here -
      // only whether a CLI token is live
      subscription: subscriptionRow
        ? {
            plan: subscriptionRow.plan,
            status: subscriptionRow.status,
            billing_interval: subscriptionRow.billing_interval,
            current_period_end: subscriptionRow.current_period_end,
            created_at: subscriptionRow.created_at,
            hasCliToken: Boolean(subscriptionRow.cli_token_hash && !subscriptionRow.cli_token_revoked_at),
            cli_token_last_used_at: subscriptionRow.cli_token_last_used_at,
            ...(showBilling && { razorpay_subscription_id: subscriptionRow.razorpay_subscription_id }),
          }
        : null,
      // Whether payments and spend were sent (finance.view) - the page hides them otherwise
      showBilling,
      stats: {
        savedCount: (savedRows || []).length,
        // Installs (one effect, one day) and how many by each source
        installCount: installRows.length,
        installsBySource: Object.fromEntries(INSTALL_SOURCES.map((source) => [source, installRows.filter((row) => row.source === source).length])),
        ...(showBilling && { lifetimeSpendByCurrency }),
      },
      installTrend,
      savedEffects,
      installedEffects,
      invoices: showBilling ? invoiceRows : [],
      templatePurchases: showBilling ? templatePurchases : [],
      purchasedTemplates,
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
