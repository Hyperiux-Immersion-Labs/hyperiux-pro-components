import "server-only";

// UTC-based to match copy_usage_effects.usage_date's own convention (see
// todayUTC() in api/dashboard/usage/route.js) - trend charts stay in step
// with the same day boundary the daily copy limit resets on.
export function utcDateString(daysAgo = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Builds an ordered [oldest..newest] list of { date, label, value: 0 }
// buckets covering the last `days` days (inclusive of today), so trend
// charts show a flat zero for quiet days instead of a gap.
export function buildDailyBuckets(days = 30) {
  const buckets = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = utcDateString(i);
    buckets.push({ date, label: formatDayLabel(date), value: 0 });
  }

  return buckets;
}

// Fills each bucket's `value` from the matching rows. `getValue` defaults to
// a plain count (+1 per row); pass e.g. (row) => row.amount / 100 to sum
// instead of count (revenue). Rows whose date has no matching bucket are
// ignored - the caller's query should already be scoped to the bucket range.
export function fillDailyBuckets(buckets, rows, getDate, getValue = () => 1) {
  const byDate = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  for (const row of rows) {
    const bucket = byDate.get(getDate(row));
    if (bucket) bucket.value += getValue(row);
  }

  return buckets;
}

// Shared "Today / 7d / 30d / 90d / All time" preset used by every admin
// endpoint that exposes the same date-range picker - one definition so the
// boundary can't drift between the users list, its export, and its stats.
export const DATE_RANGE_DAYS = { today: 0, "7d": 6, "30d": 29, "90d": 89 };

// UTC start-of-day boundary for a range preset, or null for "all"/unknown
// (no lower bound - the caller simply omits the filter in that case).
export function resolveRangeStart(range) {
  if (!range || !(range in DATE_RANGE_DAYS)) return null;

  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - DATE_RANGE_DAYS[range]);
  return date;
}
