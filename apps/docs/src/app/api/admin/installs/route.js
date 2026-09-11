import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { buildDailyBucketsForRange, fillDailyBuckets, resolveDateBounds, utcDateString } from "@/lib/admin-activity";

// Stage 2 (Installation-SyncUp.md): calibrate the 2/3/10 daily limits against
// real install_events data before Stage 3 flips INSTALL_LIMIT_ENFORCE on.
// The single question this exists to answer: are the limits right, or are
// CI pipelines / monorepos / shared office IPs about to get falsely capped?

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
    const today = utcDateString(0);

    let eventsQuery = supabase
      .from("install_events")
      .select(
        "occurred_at,identity_key,clerk_user_id,device_id,ip_hash,effect_slug,effect_tier,source,plan,decision,reason,enforced,would_have_denied,cli_version,mcp_version"
      )
      .order("occurred_at", { ascending: false });
    if (startISO) eventsQuery = eventsQuery.gte("occurred_at", startISO);
    if (endISO) eventsQuery = eventsQuery.lt("occurred_at", endISO);

    const [
      { data: eventRows, error: eventsError },
      // "Installs Today" is a fixed daily pulse, deliberately independent of
      // whatever window is selected elsewhere on the page - always today.
      { count: eventsToday, error: eventsTodayError },
    ] = await Promise.all([
      eventsQuery,
      supabase
        .from("install_events")
        .select("id", { count: "exact", head: true })
        .in("decision", SUCCESS_DECISIONS)
        .gte("occurred_at", `${today}T00:00:00.000Z`),
    ]);

    if (eventsError || eventsTodayError) {
      console.error("ADMIN_INSTALLS_ERROR:", eventsError || eventsTodayError);
      return NextResponse.json({ error: "Failed to load install events" }, { status: 500 });
    }

    const allEvents = eventRows || [];
    // install_events is the raw attempt log, denied rows included - "Total
    // Installs" and everything derived from it should mean real, successful
    // deliveries (matching "Top users by copies" and the event log below),
    // not attempts that never happened. The denial count itself still
    // matters (it's what Stage 2 calibration reads), so it stays visible as
    // its own explicit stat instead of being silently folded into the
    // "installs" numbers.
    const events = allEvents.filter((row) => SUCCESS_DECISIONS.includes(row.decision));
    const deniedEvents = allEvents.filter((row) => !SUCCESS_DECISIONS.includes(row.decision));

    const allowedRows = events.filter((row) => row.decision === "allowed");
    const alreadyUnlockedRows = events.filter((row) => row.decision === "already-unlocked");

    const installTrend = fillDailyBuckets(
      buildDailyBucketsForRange({ startDateString, endDateString }),
      events,
      (row) => row.occurred_at.slice(0, 10)
    );

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

    // Historical install_events rows outlive the account that made them - a
    // deleted Clerk user still has old events on file. Rather than surface
    // a blank/unclickable row (there's no profile left to open), those
    // identities are dropped from the leaderboard entirely.
    const topUsers = userCounts
      .filter(({ clerkUserId }) => clerkMap[clerkUserId])
      .map(({ clerkUserId, count }) => {
        const clerkUser = clerkMap[clerkUserId];
        return {
          clerkUserId,
          name: clerkUser.fullName || clerkUser.firstName || null,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
          imageUrl: clerkUser.imageUrl || null,
          count,
        };
      });

    return NextResponse.json({
      range,
      stats: {
        totalEvents: events.length,
        eventsToday: eventsToday || 0,
        allowedCount: allowedRows.length,
        alreadyUnlockedCount: alreadyUnlockedRows.length,
        deniedCount: deniedEvents.length,
        // Checked across every attempt, not just successful ones - a denial
        // can only happen while enforcement is on, so it's the more
        // complete signal for "was the limit actually active in this
        // window," even if every *successful* row happened to log false.
        enforced: allEvents.some((row) => row.enforced),
      },
      sourceBreakdown: countBy(events, "source"),
      planBreakdown: countBy(events, "plan"),
      installTrend,
      topUsers,
    });
  } catch (error) {
    console.error("ADMIN_INSTALLS_ERROR:", error);
    return NextResponse.json({ error: "Failed to load install events" }, { status: 500 });
  }
}
