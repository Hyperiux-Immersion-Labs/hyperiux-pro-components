import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { compareStat, comparisonWindows, resolveDateBounds } from "@/lib/admin-activity";
import { getAdminUserList, parseAudience } from "@/lib/admin-data";

// The Users tab's stat cards, for one audience (customers by default) and the page's
// date window - not the table's search / plan / role filters, so they don't change
// meaning while someone filters the list. Users and paid users are accounts that joined
// in the window (paid = on a paid plan today). Installs and saves are the Activity tab's,
// not repeated here. Each card
// (lib/admin-activity compareStat): the window's total, its change against the window
// before (all time: last 30 days against the 30 before) and its line.
export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all";
    const { startISO, endISO } = resolveDateBounds({
      range,
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });
    const audienceName = parseAudience(searchParams);

    const windows = comparisonWindows({ startISO, endISO, range });
    const startMs = startISO ? new Date(startISO).getTime() : -Infinity;
    const endMs = endISO ? new Date(endISO).getTime() : Infinity;
    const inWindow = (at) => at >= startMs && at < endMs;

    // Every account in the audience, with its plan now
    const everyone = await getAdminUserList({ audience: audienceName });

    const earliest = (items) => (items.length ? Math.min(...items.map((item) => item.at)) : windows.current[0]);
    const card = (items) => compareStat(items, windows, { inWindow, seriesStartMs: startISO ? startMs : earliest(items) });

    const joined = everyone.map((entry) => ({ at: entry.clerkUser.createdAt, paid: entry.currentPlan !== "free" }));
    const users = card(joined);
    const paidUsers = card(joined.filter((entry) => entry.paid));

    return NextResponse.json({
      range,
      // Accounts that joined in the window, and how many of them are on a paid plan now
      newUsers: users.value,
      newProUsers: paidUsers.value,
      kpis: { comparison: windows.label, users, paidUsers },
    });
  } catch (error) {
    console.error("ADMIN_USERS_STATS_ERROR:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
