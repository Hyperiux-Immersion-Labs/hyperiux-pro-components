import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { can, requireAdminAccess } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";
import { compareStat, comparisonWindows, resolveDateBounds } from "@/lib/admin-activity";
import { TEMPLATES } from "@/lib/mock-templates";
import { INSTALL_SOURCES, currentPlanOf, fetchAllRows, fetchInstalls, getAudience, parseAudience } from "@/lib/admin-data";

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
  const access = await requireAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Revenue needs finance.view - left out of the response, not just hidden on the page
  const showRevenue = can(access, "finance.view");

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const { startISO, endISO } = resolveDateBounds({
      range,
      from,
      to,
    });

    const audience = await getAudience(parseAudience(searchParams));
    const mine = (rows) => rows.filter((row) => audience.includes(row.clerk_user_id));

    // The stat cards compare the window with the one before it, so rows are read from
    // the start of that earlier window (everything for all time) and split here
    const windows = comparisonWindows({ startISO, endISO, range });
    const fetchFromISO = startISO ? new Date(windows.previous[0]).toISOString() : null;
    const startMs = startISO ? new Date(startISO).getTime() : -Infinity;
    const endMs = endISO ? new Date(endISO).getTime() : Infinity;
    const inWindow = (time) => time >= startMs && time < endMs;
    const timeOf = (value) => new Date(value).getTime();

    // Every row from fetchFromISO on (not the first 1000), for this audience
    function scoped(table, columns, column = "created_at", extra = (q) => q) {
      return fetchAllRows(() => {
        let q = extra(supabase.from(table).select(columns));
        if (fetchFromISO) q = q.gte(column, fetchFromISO);
        if (endISO) q = q.lt(column, endISO);
        return q;
      }).then(mine);
    }

    // Payments that count as money: real (not test mode), not refunded, and not left out
    // by an admin ("Exclude from revenue") - the same rows as the Invoicing tab. Invoices are
    // only read for admins who can see money (finance.view).
    const none = async () => [];
    const [subscriptionRows, installRows, savedRowsAll, savedTemplateRowsAll, invoiceRowsAll, templatePurchaseRowsAll, viewRowsAll, sanityEntries] = await Promise.all([
      fetchAllRows(() => supabase.from("subscriptions").select("clerk_user_id, plan, tier, status, current_period_end"), { orderBy: "clerk_user_id" }),
      // Installs: one effect, one account, one day - web, CLI or MCP (lib/admin-data)
      fetchInstalls({ startISO: fetchFromISO, endISO, audience }),
      scoped("wishlisted_effects", "clerk_user_id, effect_slug, created_at"),
      scoped("wishlisted_templates", "clerk_user_id, template_slug, created_at"),
      showRevenue
        ? scoped("invoices", "clerk_user_id, amount, currency, created_at", "created_at", (q) => q.eq("status", "paid").eq("is_test", false).eq("excluded", false))
        : none(),
      // Template sales: paid, not credit redemptions (no money moves), not excluded
      scoped("template_purchases", "clerk_user_id, created_at, template_slug, amount, currency", "created_at", (q) =>
        q.eq("is_test", false).eq("status", "paid").eq("excluded", false).or("source.is.null,source.neq.credit")
      ),
      // Template views: one per viewer (user:<id> or ip:<hash>) per template per day
      fetchAllRows(() => {
        let q = supabase.from("template_views").select("template_slug, identity_key, created_at").in("template_slug", TEMPLATES.map((template) => template.slug));
        if (fetchFromISO) q = q.gte("created_at", fetchFromISO);
        if (endISO) q = q.lt("created_at", endISO);
        return q;
      }).then((rows) => rows.filter((row) => audience.includesIdentity(row.identity_key))),
      getAllSanityEffectEntries(),
    ]);

    // The selected window's rows (the cards' comparisons also use the window before)
    const within = (rows) => rows.filter((row) => inWindow(timeOf(row.created_at)));
    const windowInstalls = installRows.filter((row) => inWindow(timeOf(row.at)));
    const savedRows = within(savedRowsAll);
    const templateSaleRows = within(templatePurchaseRowsAll);
    const viewRows = within(viewRowsAll);

    // Plans right now (not just this window's signups): Pro / Pro+ only while the paid or
    // granted period is live. People are real accounts (Clerk), not subscriptions rows.
    const planById = new Map(subscriptionRows.map((row) => [row.clerk_user_id, currentPlanOf(row)]));
    const planCounts = { pro: 0, pro_plus: 0, free: 0 };
    for (const user of audience.users) planCounts[planById.get(user.id) || "free"] += 1;

    // An effect's card details for the top-effects sliders: Sanity first (what the site
    // renders), the registry for effects with no Sanity content yet
    const sanityEffectsBySlug = new Map(buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect]));
    function resolveEffectSummary(slug) {
      const sanityEntry = sanityEffectsBySlug.get(slug);
      const registryEntry = getEffectMetadata(slug);
      return {
        slug,
        name: slug,
        title: sanityEntry?.title || registryEntry?.title || slug,
        coverImage: sanityEntry?.coverImage || registryEntry?.coverImage || null,
        videoUrl: sanityEntry?.videoUrl || registryEntry?.videoUrl || null,
        tier: sanityEntry?.tier || registryEntry?.tier || "free",
        categorySlug: sanityEntry?.categorySlug || registryEntry?.categories?.[0] || null,
      };
    }

    // Every template: viewers and sales in the window
    const views = Object.fromEntries(TEMPLATES.map((template) => [template.slug, 0]));
    for (const row of viewRows) views[row.template_slug] = (views[row.template_slug] || 0) + 1;
    const sales = {};
    for (const row of templateSaleRows) sales[row.template_slug] = (sales[row.template_slug] || 0) + 1;
    const templateStats = TEMPLATES.map((template) => ({
      slug: template.slug,
      title: template.title,
      category: template.category,
      views: views[template.slug] || 0,
      sales: sales[template.slug] || 0,
    })).sort((a, b) => b.views - a.views || b.sales - a.sales);

    const topSavedEffects = topSlugCounts(savedRows, TOP_EFFECTS_LIMIT).map(({ slug, count }) => ({ ...resolveEffectSummary(slug), count }));
    const topInstalledEffects = topSlugCounts(
      windowInstalls.map((row) => ({ effect_slug: row.effectSlug })),
      TOP_EFFECTS_LIMIT
    ).map(({ slug, count }) => ({ ...resolveEffectSummary(slug), count }));

    // ---- the stat cards: total in the window, change against the window before, a line
    // All time: the line runs from the first record of each stat
    const earliest = (times) => (times.length ? Math.min(...times) : windows.current[0]);
    const card = (items) => compareStat(items, windows, { inWindow, seriesStartMs: startISO ? startMs : earliest(items.map((item) => item.at)) });

    const signupItems = audience.users.map((user) => ({ at: user.createdAt }));
    const viewItems = viewRowsAll.map((row) => ({ at: timeOf(row.created_at) }));
    const installItems = installRows.map((row) => ({ at: timeOf(row.at), source: row.source }));
    const saveItems = savedRowsAll.map((row) => ({ at: timeOf(row.created_at) }));

    const kpis = {
      comparison: windows.label,
      signups: card(signupItems),
      templateViews: card(viewItems),
      installs: {
        ...card(installItems),
        bySource: Object.fromEntries(INSTALL_SOURCES.map((source) => [source, installItems.filter((item) => item.source === source && inWindow(item.at)).length])),
      },
      saves: card(saveItems),
    };

    // Revenue (finance.view): subscription payments (smallest unit) and template sales
    // (whole units), per currency - never added across currencies. The card's line and
    // change follow the currency with the most money in the window (USD normally); the rest
    // is listed. INR amounts are what was charged, GST included (`includesGst`).
    if (showRevenue) {
      const moneyItems = [
        ...invoiceRowsAll.map((row) => ({ at: timeOf(row.created_at), currency: row.currency || "INR", value: row.amount / 100 })),
        ...templatePurchaseRowsAll
          .filter((row) => typeof row.amount === "number")
          .map((row) => ({ at: timeOf(row.created_at), currency: row.currency || "USD", value: row.amount })),
      ];
      const totals = {};
      for (const item of moneyItems) if (inWindow(item.at)) totals[item.currency] = (totals[item.currency] || 0) + item.value;
      const currencies = Object.keys(totals).sort((a, b) => (a === "USD" ? -1 : b === "USD" ? 1 : totals[b] - totals[a]));
      const primaryCurrency = currencies[0] || "USD";
      kpis.revenue = {
        ...card(moneyItems.filter((item) => item.currency === primaryCurrency)),
        currency: primaryCurrency,
        includesGst: primaryCurrency === "INR",
        byCurrency: currencies.map((currency) => ({ currency, amount: totals[currency], includesGst: currency === "INR" })),
      };
    }

    return NextResponse.json({
      range,
      audience: audience.audience,
      stats: { totalSavedTemplates: within(savedTemplateRowsAll).length },
      kpis,
      planDistribution: [
        { name: "Pro+", value: planCounts.pro_plus },
        { name: "Pro", value: planCounts.pro },
        { name: "Free", value: planCounts.free },
      ],
      topSavedEffects,
      topInstalledEffects,
      templateStats,
    });
  } catch (error) {
    console.error("ADMIN_ACTIVITY_OVERVIEW_ERROR:", error);
    return NextResponse.json({ error: "Failed to load activity overview" }, { status: 500 });
  }
}
