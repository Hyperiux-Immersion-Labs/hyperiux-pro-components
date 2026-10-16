import { FREE_EFFECTS, TOTAL_EFFECTS } from "../library-counts";

// Development-only dashboard preview. Clerk can't sign in on localhost (production keys),
// so the dashboard can't be seen while working on it. In `next dev` only, a
// `vault-dev-preview` cookie lets /dashboard pages through the proxy without a session
// (src/proxy.js) and swaps their API data for the samples below. Production builds never
// take this path: every check is behind NODE_ENV === "development".
//
//   document.cookie = "vault-dev-preview=pro"   // or "free", or "admin" (a Pro super admin,
//                                               // for the admin view's shell); clear it to turn it off

export const DASHBOARD_PREVIEW_COOKIE = "vault-dev-preview";

// The preview has no session, so its dashboard lives at /dashboard/preview.
export const DEV_PREVIEW_USERNAME = "preview";

// "pro" | "free" | "admin" when the preview is on, else null
export function getDashboardPreview() {
  if (process.env.NODE_ENV !== "development" || typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${DASHBOARD_PREVIEW_COOKIE}=`))
    ?.split("=")[1];
  return value === "free" || value === "admin" ? value : value ? "pro" : null;
}

// Server side (admin layout): whether the preview is the admin one
export function isDevAdminPreview(cookieStore) {
  return process.env.NODE_ENV === "development" && cookieStore.get(DASHBOARD_PREVIEW_COOKIE)?.value === "admin";
}

// Same shape as GET /api/dashboard
export function sampleDashboard(plan = "pro") {
  const pro = plan !== "free";
  return {
    plan: pro ? "pro" : "free",
    tier: pro ? "pro" : null,
    joinedAt: "2026-03-14T10:00:00.000Z",
    planValidUntil: pro ? "2027-03-14T10:00:00.000Z" : null,
    billingInterval: pro ? "yearly" : null,
    hasCliToken: pro,
    subscriptionStatus: pro ? "active" : null,
    manageSubscriptionUrl: pro ? "https://example.com/manage" : null,
    dailyInstallLimit: pro ? 5 : 3,
    templateCredits: pro ? 2 : 0,
    totalEffects: TOTAL_EFFECTS,
    totalFreeEffects: FREE_EFFECTS,
    totalEffectsAccess: pro ? TOTAL_EFFECTS : FREE_EFFECTS,
    savedCount: 12,
    webCount: 34,
    cliCount: 15,
    mcpCount: 6,
    todayCount: 2,
    creditsPerYear: pro ? 3 : 0,
    recentActivity: [
      ["helix-slider", "web", 47],
      ["rotation-slider", "cli", 130],
      ["stack-spread", "mcp", 60 * 26],
      ["circular-slider", "web", 60 * 50],
      ["liquid-glass-cursor", "cli", 60 * 75],
      ["text-convergence", "web", 60 * 98],
    ].map(([name, source, minutesAgo]) => ({ name, title: name, source, at: new Date(Date.now() - minutesAgo * 60000).toISOString() })),
    recentlySaved: ["stack-spread", "helix-slider", "rotation-slider", "circular-slider"].map((name, i) => ({
      name,
      title: name,
      tier: "free",
      savedAt: new Date(Date.now() - (i * 26 + 5) * 3600000).toISOString(),
    })),
  };
}

// Same shape as GET /api/dashboard/usage: 40 unlocks over the last 30 days
export function sampleUsage(plan = "pro", catalog = []) {
  const sources = ["web", "web", "cli", "mcp", "web", "cli"];
  const events = Array.from({ length: 40 }, (_, i) => {
    const effect = catalog[(i * 7) % Math.max(1, catalog.length)] || { name: "helix-slider", title: "Helix Slider" };
    return {
      name: effect.name,
      title: effect.title || effect.name,
      source: sources[i % sources.length],
      at: new Date(Date.now() - (i * 17 + 1) * 3600000).toISOString(),
    };
  });
  const limit = plan === "free" ? 3 : plan === "admin" ? null : 5;
  return { plan: plan === "free" ? "free" : "pro", tier: plan === "free" ? null : "pro", isAdmin: plan === "admin", limit, count: 2, remaining: limit ? limit - 2 : null, events };
}

// Same shape as GET /api/dashboard/invoices
export function sampleInvoices(plan = "pro") {
  if (plan === "free") return { plan: "free", tier: null, subscription: null, invoices: [], templatePurchases: [] };
  return {
    plan: "pro",
    tier: "pro",
    subscription: { plan: "pro", status: "active", billing_interval: "yearly", current_period_end: "2027-03-14T10:00:00.000Z", razorpay_subscription_id: "sub_sample", razorpay_short_url: "https://example.com/manage" },
    invoices: [{ id: "i1", amount: 7900, currency: "USD", status: "paid", billing_interval: "yearly", plan_label: "Vault Pro Annual", invoice_url: "https://example.com/receipt", created_at: "2026-03-14T10:00:00.000Z" }],
    templatePurchases: [
      { id: "t1", templateTitle: "Elena Voss", amount: 39, currency: "USD", status: "paid", invoiceUrl: "https://example.com/receipt", createdAt: "2026-09-20T10:00:00.000Z" },
      { id: "t2", templateTitle: "Kyntra", amount: 49, currency: "USD", status: "paid", invoiceUrl: null, createdAt: "2026-10-13T10:00:00.000Z" },
    ],
  };
}

// A stand-in Clerk user for the settings tab (no session in the preview); saving does nothing
export function samplePreviewUser() {
  const noop = async () => {};
  return {
    id: "preview",
    firstName: "Preview",
    lastName: "User",
    fullName: "Preview User",
    hasImage: false,
    imageUrl: "",
    passwordEnabled: true,
    primaryEmailAddress: { emailAddress: "you@example.com" },
    externalAccounts: [{ id: "google", provider: "google", emailAddress: "you@gmail.com" }],
    update: noop,
    reload: noop,
    setProfileImage: noop,
  };
}

// The admin Activity tab's three responses (GET /api/admin/activity/overview, /installs,
// /copy-activity), made up from the catalogue
export function sampleAdminActivity(catalog = []) {
  const effect = (i) => catalog[i % Math.max(1, catalog.length)] || { name: "helix-slider", title: "Helix Slider", tier: "free" };
  const people = [
    ["Harsh Goyal", "harsh@example.com"],
    ["Vidushi Rao", "vidushi@example.com"],
    ["Omkar Patil", "omkar@example.com"],
    ["Joris de Vries", "joris@example.nl"],
    ["Blake Holman", "blake@example.com"],
  ];
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (29 - i));
    const wave = (k) => Math.max(0, Math.round(k * (0.6 + 0.4 * Math.sin(i * 0.7 + k))));
    return { date: date.toISOString().slice(0, 10), web: wave(4), cli: wave(3), mcp: wave(1) };
  });
  const total = (key) => days.reduce((sum, d) => sum + d[key], 0);
  const top = (offset) => Array.from({ length: 8 }, (_, i) => ({ ...effect(i * 5 + offset), slug: effect(i * 5 + offset).name, count: 16 - i * 2 }));
  // A stat card (the overview's `kpis` shape): a 30-day line around `base` a day, rising or
  // falling by `drift`, against a previous window `previous`
  const stat = (base, drift, previous, seed) => {
    const series = days.map((day, i) => ({ date: `${day.date}T00:00:00.000Z`, value: Math.max(0, Math.round(base + drift * i + base * 0.5 * Math.sin(i * 0.9 + seed))) }));
    const value = series.reduce((sum, point) => sum + point.value, 0);
    return { value, current: value, previous, series };
  };
  const installs = { ...stat(8, 0.05, 210, 1), bySource: { web: total("web"), cli: total("cli"), mcp: total("mcp") } };
  installs.value = installs.current = installs.bySource.web + installs.bySource.cli + installs.bySource.mcp;
  return {
    overview: {
      kpis: {
        comparison: "vs prev. 30d",
        signups: stat(4, 0.1, 85, 2),
        templateViews: stat(12, 0.2, 194, 3),
        revenue: { ...stat(40, 1.5, 1210, 4), currency: "USD", byCurrency: [{ currency: "USD", amount: 1097 }, { currency: "INR", amount: 6478 }] },
        installs,
        saves: stat(2, -0.04, 74, 5),
      },
      stats: { totalUsers: 125, proUsers: 6, totalInstalls: installs.value, totalSaved: 62, totalSavedTemplates: 9, totalViews: 366, revenueByCurrency: [{ currency: "USD", amount: 1097 }, { currency: "INR", amount: 6478 }] },
      planDistribution: [{ name: "Pro+", value: 7 }, { name: "Pro", value: 11 }, { name: "Free", value: 237 }],
      topInstalledEffects: top(2),
      topSavedEffects: top(4),
      templateStats: [
        { slug: "elena-voss", title: "Elena Voss", category: "Portfolio", views: 214, sales: 4 },
        { slug: "oris-dental", title: "Oris Dental", category: "Healthcare", views: 163, sales: 0 },
        { slug: "lumera", title: "Lumera", category: "Real Estate", views: 121, sales: 0 },
        { slug: "kyntra", title: "Kyntra", category: "Smart Home", views: 63, sales: 0 },
      ],
    },
    installs: {
      stats: { installsToday: 6 },
      sourceBreakdown: ["web", "cli", "mcp"].map((name) => ({ name, value: total(name) })),
      sourceTrend: days,
      topInstallers: people.map(([name, email], i) => ({ clerkUserId: `u${i}`, name, email, count: 14 - i * 2 })),
    },
    feed: {
      total: 40,
      events: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        occurredAt: new Date(Date.now() - i * 2.3 * 3600000).toISOString(),
        userName: i % 4 === 3 ? null : people[i % people.length][0],
        userEmail: i % 4 === 3 ? null : people[i % people.length][1],
        identityKey: i % 4 === 3 ? "device:abc" : `user:u${i}`,
        effectSlug: effect(i * 3).name,
        effectTitle: effect(i * 3).title,
        source: ["web", "cli", "mcp"][i % 3],
      })),
    },
  };
}

// The admin Invoicing tab's two responses (GET /api/admin/invoices, /template-purchases)
export function sampleAdminInvoicing() {
  const person = (i) => [["Omkar Patil", "omkar@example.com"], ["Nadia Rao", "nadia@example.com"], ["Joris de Vries", "joris@example.nl"], ["Blake Holman", "blake@example.com"]][i % 4];
  const day = (n) => new Date(Date.now() - n * 86400000).toISOString();
  // A stat card: a 30-day line around `base` a day, drifting by `drift`, against `previous`
  const card = (base, drift, previous, seed) => {
    const series = Array.from({ length: 30 }, (_, i) => ({ date: day(29 - i), value: Math.max(0, Math.round(base + drift * i + base * 0.6 * Math.sin(i * 0.8 + seed))) }));
    const value = series.reduce((sum, point) => sum + point.value, 0);
    return { value, current: value, previous, series };
  };
  return {
    // GET /api/admin/invoices/stats
    stats: {
      kpis: {
        comparison: "vs prev. 30d",
        usd: { ...card(36, 0.6, 980, 1), currency: "USD", subscriptions: 958, templates: 139 },
        inr: { ...card(215, -2, 7200, 2), currency: "INR", subscriptions: 6478, templates: 0, refunded: 1590 },
        subscriptions: card(1, 0.02, 24, 3),
        templateSales: card(0.3, 0.01, 3, 4),
      },
    },
    invoices: {
      total: 5,
      stats: { totalInvoices: 3, revenueByCurrency: [{ currency: "INR", amount: 235800 }, { currency: "USD", amount: 2000 }] },
      invoices: [
        { id: "i4", userName: "Witcher", userEmail: "witcher@example.com", planLabel: "Vault Pro Quarterly", billingInterval: "quarterly", amount: 159000, currency: "INR", status: "refunded", paymentId: "pay_TochOD3HY7LLGt", createdAt: day(0), invoiceUrl: null },
        { id: "i5", userName: person(2)[0], userEmail: person(2)[1], planLabel: "Vault Pro Monthly", billingInterval: "monthly", amount: 117900, currency: "INR", excluded: true, paymentId: "pay_SampleExcluded1", createdAt: day(2), invoiceUrl: null },
        { id: "i1", userName: person(0)[0], userEmail: person(0)[1], planLabel: "Vault Pro Monthly", billingInterval: "monthly", amount: 117900, currency: "INR", paymentId: "pay_TlacvHtPm8kfsg", createdAt: day(5), invoiceUrl: "https://example.com" },
        { id: "i2", userName: person(1)[0], userEmail: person(1)[1], planLabel: "Vault Pro Annual", billingInterval: "yearly", amount: 2000, currency: "USD", paymentId: "pay_TntqVYLqa7QgVE", createdAt: day(1), invoiceUrl: null },
        { id: "i3", userName: person(0)[0], userEmail: person(0)[1], planLabel: "Vault Pro Monthly", billingInterval: "monthly", amount: 117900, currency: "INR", paymentId: "pay_TaMT26I2NSipTS", createdAt: day(35), invoiceUrl: "https://example.com" },
      ],
    },
    templates: {
      total: 3,
      stats: { totalPurchases: 3, revenueByCurrency: [{ currency: "USD", amount: 117 }] },
      purchases: [3, 6, 9].map((n, i) => ({ id: `t${i}`, userName: person(i + 1)[0], userEmail: person(i + 1)[1], templateTitle: "Elena Voss", amount: 39, currency: "USD", paymentId: `pay_sample${i}`, createdAt: day(n), invoiceUrl: null })),
    },
  };
}

// GET /api/admin/activity/[userSlug] for one made-up user
export function sampleAdminUser(catalog = []) {
  const effect = (i) => catalog[i % Math.max(1, catalog.length)] || { name: "helix-slider", title: "Helix Slider" };
  const day = (n) => new Date(Date.now() - n * 86400000).toISOString();
  const list = (offset, key) => Array.from({ length: 5 }, (_, i) => ({ ...effect(i * 4 + offset), slug: effect(i * 4 + offset).name, [key]: day(i * 3 + 1) }));
  const installTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (29 - i));
    return { date: date.toISOString().slice(0, 10), web: i % 5 === 0 ? 1 : 0, cli: i % 7 === 0 ? 1 : 0, mcp: i % 11 === 0 ? 1 : 0 };
  });
  return {
    profile: { id: "user_sample", name: "Harsh Goyal", email: "harsh@example.com", imageUrl: null, isAdmin: false, lastSignInAt: day(0) },
    session: { browserName: "Chrome", deviceType: "Desktop", city: "Delhi", country: "IN" },
    subscription: { plan: "pro" },
    stats: { savedCount: 12, installCount: 55, installsBySource: { web: 34, cli: 15, mcp: 6 }, lifetimeSpendByCurrency: [{ currency: "INR", amount: 2358 }, { currency: "USD", amount: 39 }] },
    installTrend,
    savedEffects: list(0, "savedAt"),
    installedEffects: list(2, "lastInstalledAt"),
    templatePurchases: [{ id: "t1", createdAt: day(9), templateTitle: "Elena Voss", amount: 39, currency: "USD", paymentId: "pay_sample1", status: "paid", invoiceUrl: null }],
    purchasedTemplates: [],
    invoices: [{ id: "i1", created_at: day(5), plan_label: "Vault Pro Monthly", amount: 117900, currency: "INR", razorpay_payment_id: "pay_sample2", status: "paid", invoice_url: "https://example.com" }],
  };
}

// GET /api/admin/users and /users/stats, made up
export function sampleAdminUsers() {
  const names = [["Harsh Goyal", "harsh@example.com", "super_admin"], ["Omkar Patil", "omkar@example.com"], ["Nadia Rao", "nadia@example.com"], ["Joris de Vries", "joris@example.nl"], ["Blake Holman", "blake@example.com"], ["Mira Kaur", "mira@example.com"]];
  return {
    stats: (() => {
      // A stat card: a 30-day line around `base` a day, drifting by `drift`, against `previous`
      const card = (base, drift, previous, seed) => {
        const series = Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString(), value: Math.max(0, Math.round(base + drift * i + base * 0.5 * Math.sin(i * 0.8 + seed))) }));
        const value = series.reduce((sum, point) => sum + point.value, 0);
        return { value, current: value, previous, series };
      };
      const kpis = { comparison: "vs prev. 30d", users: card(8, 0.1, 180, 1), paidUsers: card(1, 0.02, 22, 2), installs: card(15, 0.2, 380, 3), saves: card(4, -0.05, 150, 4) };
      return { newUsers: kpis.users.value, newProUsers: kpis.paidUsers.value, installs: kpis.installs.value, saves: kpis.saves.value, kpis };
    })(),
    total: names.length,
    users: names.map(([name, email, role], i) => ({
      id: `user_${i}`,
      name,
      email,
      role: role || "user",
      imageUrl: null,
      joinedAt: new Date(Date.now() - (i * 9 + 2) * 86400000).toISOString(),
      plan: i % 3 === 1 ? "pro" : "free",
      tier: i % 3 === 1 ? "pro" : null,
      planValidUntil: i % 3 === 1 ? "2027-03-14T10:00:00.000Z" : null,
      razorpayCustomerId: i % 3 === 1 ? "cust_samplecustomer" : null,
      installsCount: 22 - i, webCount: 12 - i,
      cliCount: 6 - (i % 4),
      mcpCount: i % 3,
      savesCount: 9 - i,
      suspended: i === 5,
      // Harsh: an admin; Blake: marked internal (a test account)
      internal: role ? "role" : i === 4 ? "marked" : null,
    })),
  };
}

// GET /api/admin/users/billing for a made-up account: a live Razorpay subscription, one
// refunded payment that's still counted as paid (so the drawer shows a mismatch) and one
// refundable payment
export function sampleAdminBilling(userId) {
  const day = (n) => new Date(Date.now() + n * 86400000).toISOString();
  return {
    account: { plan: "pro", status: "active", billingInterval: "quarterly", currentPeriodEnd: day(80), subscriptionId: "sub_SampleSubscription", customerId: "cust_samplecustomer", granted: false },
    razorpay: { id: "sub_SampleSubscription", status: "active", planId: "plan_sample", paidCount: 2, currentEnd: day(80), chargeAt: day(80), endedAt: null, url: "https://dashboard.razorpay.com/app/subscriptions/sub_SampleSubscription" },
    razorpayError: null,
    cancelScheduled: false,
    payments: [
      { id: "p1", kind: "subscription", paymentId: "pay_SampleRefunded", label: "Vault Pro Quarterly", amount: 159000, currency: "INR", status: "paid", excluded: false, createdAt: day(-10), refunded: 159000, refundable: 0, url: "https://dashboard.razorpay.com/app/payments/pay_SampleRefunded" },
      { id: "p2", kind: "subscription", paymentId: "pay_SamplePaid", label: "Vault Pro Quarterly", amount: 159000, currency: "INR", status: "paid", excluded: false, createdAt: day(-100), refunded: 0, refundable: 159000, url: "https://dashboard.razorpay.com/app/payments/pay_SamplePaid" },
    ],
    drift: ["Payment pay_SampleRefunded was refunded at Razorpay but is still counted as paid."],
    userId,
  };
}

// GET /api/admin/audit, made up
export function sampleAdminAudit() {
  const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();
  const entries = [
    { id: 1, at: ago(12), action: "payment.refund", label: "Refunded payment", actorEmail: "hitesh@example.com", targetId: "user_4", targetName: "Blake Holman", targetEmail: "blake@example.com", details: { paymentId: "pay_SamplePaid", amount: 159000, currency: "INR", full: true } },
    { id: 2, at: ago(55), action: "internal.mark", label: "Marked internal", actorEmail: "hitesh@example.com", targetId: "user_4", targetName: "Blake Holman", targetEmail: "blake@example.com", details: {} },
    { id: 3, at: ago(300), action: "plan.update", label: "Changed plan", actorEmail: "harsh@example.com", targetId: "user_1", targetName: "Omkar Patil", targetEmail: "omkar@example.com", details: { plan: "pro", tier: "pro", currentPeriodEnd: ago(-43200) } },
    { id: 4, at: ago(1500), action: "subscription.sync", label: "Synced with Razorpay", actorEmail: "hitesh@example.com", targetId: "user_2", targetName: "Nadia Rao", targetEmail: "nadia@example.com", details: { changes: ["Razorpay says the subscription is cancelled: moved to Free."] } },
    { id: 5, at: ago(3000), action: "role.update", label: "Changed role", actorEmail: "hitesh@example.com", targetId: "user_0", targetName: "Harsh Goyal", targetEmail: "harsh@example.com", details: { role: "super_admin" } },
  ];
  return { total: entries.length, entries };
}

// GET /api/admin/webhook-events, made up: one of each outcome
export function sampleWebhookEvents() {
  const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();
  const user = { userId: "user_4", userName: "Blake Holman", userEmail: "blake@example.com" };
  const events = [
    { id: 1, at: ago(14), event: "refund.processed", outcome: "applied", detail: "Full refund: invoice marked refunded, moved to Free, subscription cancelled", ...user, paymentId: "pay_SamplePaid", subscriptionId: "sub_SampleSubscription", amount: 159000, currency: "INR" },
    { id: 2, at: ago(15), event: "subscription.cancelled", outcome: "skipped", detail: "Not this account's current subscription (replaced by an upgrade), a late event after it ended, or already refunded", ...user, subscriptionId: "sub_SampleSubscription" },
    { id: 3, at: ago(2900), event: "subscription.charged", outcome: "applied", detail: "Pro (pro), active, invoice recorded", ...user, paymentId: "pay_SamplePaid", subscriptionId: "sub_SampleSubscription", amount: 159000, currency: "INR" },
    { id: 4, at: ago(4000), event: "payment.captured", outcome: "ignored", detail: "Not an event we act on", paymentId: "pay_SampleCaptured", amount: 2000, currency: "USD" },
    { id: 5, at: ago(5200), event: "subscription.charged", outcome: "failed", detail: "upstream connect error or disconnect/reset before headers", userId: "user_2", userName: "Nadia Rao", userEmail: "nadia@example.com", paymentId: "pay_SampleRetry", subscriptionId: "sub_SampleOther", amount: 117900, currency: "INR" },
    { id: 6, at: ago(6000), event: null, outcome: "rejected", detail: "Invalid signature" },
  ];
  return { total: events.length, events };
}

// GET /api/admin/subscriptions/health, made up
export function sampleSubscriptionHealth() {
  const day = (n) => new Date(Date.now() + n * 86400000).toISOString();
  return {
    mrr: [{ currency: "INR", amount: 1031300 }, { currency: "USD", amount: 4800 }],
    active: { pro: 14, pro_plus: 5, granted: 2 },
    ended30d: 3,
    renewals: [
      { userId: "user_1", userName: "Omkar Patil", userEmail: "omkar@example.com", tier: "pro", billingInterval: "monthly", periodEnd: day(3), amount: 117900, currency: "INR" },
      { userId: "user_3", userName: "Joris de Vries", userEmail: "joris@example.nl", tier: "pro_plus", billingInterval: "yearly", periodEnd: day(19), amount: 17900, currency: "USD" },
    ],
    attention: [
      { userId: "user_2", userName: "Nadia Rao", userEmail: "nadia@example.com", tier: "pro", billingInterval: "quarterly", periodEnd: day(-2), amount: 159000, currency: "INR", reason: "Payments failed: halted at Razorpay" },
      { userId: "user_4", userName: "Blake Holman", userEmail: "blake@example.com", tier: "pro", billingInterval: "monthly", periodEnd: day(8), amount: 2000, currency: "USD", reason: "Cancelled at period end: lapses on its end date" },
    ],
  };
}

// GET /api/admin/users/support, and the account's notes, made up
export function sampleAdminSupport() {
  const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();
  return {
    support: { credits: 2, templates: ["elenavoss"], installsToday: 4, limit: 5, extraToday: 0 },
    notes: [
      { id: 11, at: ago(90), actorEmail: "hitesh@example.com", details: { body: "Asked about agency licensing - pointed them to hello@hyperiux.com." } },
      { id: 12, at: ago(4000), actorEmail: "harsh@example.com", details: { body: "Refund agreed: double charge on renewal." } },
    ],
  };
}

