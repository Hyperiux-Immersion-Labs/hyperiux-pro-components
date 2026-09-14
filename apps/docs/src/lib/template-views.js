import "server-only";
import { supabase } from "@/lib/supabase";
import { hashIp } from "@/lib/install-limit";

// Real-time view counter for Template detail pages - TemplateDetail's mount
// effect calls the /api/templates/[slug]/view route this backs. Sibling to
// install-limit.js's identity resolution and day-bucketed dedup, scaled
// down: no limit/quota concept, just "have we already counted this viewer
// today" so a refresh or repeat visit in one day doesn't inflate the number
// shown on TemplateCard.

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function resolveIdentityKey({ clerkUserId, ip }) {
  if (clerkUserId) return `user:${clerkUserId}`;

  const ipHash = hashIp(ip);
  return ipHash ? `ip:${ipHash}` : null;
}

export async function recordTemplateView({ templateSlug, clerkUserId, ip }) {
  const identityKey = resolveIdentityKey({ clerkUserId, ip });

  // No identity at all (no session, no IP header, e.g. local dev without a
  // proxy in front) - nothing to dedupe against, so there's nothing safe to
  // record.
  if (!identityKey) return;

  const { error } = await supabase.from("template_views").upsert(
    { template_slug: templateSlug, identity_key: identityKey, view_date: todayUTC() },
    { onConflict: "template_slug,identity_key,view_date", ignoreDuplicates: true }
  );

  if (error) {
    console.error("TEMPLATE_VIEW_RECORD_ERROR:", error);
  }
}

// Batch, for the /templates grid - one query for every card instead of one
// round trip per card. Counts every day a slug has been viewed, not just
// today - the number on the card is a running total, same as the static
// installCount it replaced.
export async function getTemplateViewCounts(templateSlugs) {
  const counts = Object.fromEntries(templateSlugs.map((slug) => [slug, 0]));
  if (templateSlugs.length === 0) return counts;

  const { data, error } = await supabase
    .from("template_views")
    .select("template_slug")
    .in("template_slug", templateSlugs);

  if (error) {
    console.error("TEMPLATE_VIEW_COUNTS_ERROR:", error);
    return counts;
  }

  for (const row of data || []) {
    counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
  }

  return counts;
}

export async function getTemplateViewCount(templateSlug) {
  const counts = await getTemplateViewCounts([templateSlug]);
  return counts[templateSlug] || 0;
}
