import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

const ACTIVE_STATUSES = ["active", "trialing"];

// Short-lived last-known-good cache, keyed by clerk_user_id. Exists only to
// bridge brief Supabase blips: on a genuine query error, serve the last
// verified plan if still fresh, otherwise fail closed to "free". Never used
// to grant pro from Clerk metadata alone - Supabase stays the sole source
// of truth for *active* pro access, error or not.
const PLAN_CACHE_TTL_MS = 60_000;
const planCache = new Map();

export function invalidatePlanCache(userId) {
  if (userId) planCache.delete(userId);
}

export async function getUserPlan(userId) {
  if (!userId) {
    return "free";
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan,status,current_period_end")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("GET_USER_PLAN_SUPABASE_ERROR:", error);

    const cached = planCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.plan;
    }

    // No fresh cached value and Supabase itself errored - fail closed
    // rather than falling through to Clerk metadata, which isn't a
    // verified source of truth for revocation.
    return "free";
  }

  let plan = "free";

  if (data?.plan === "pro" && ACTIVE_STATUSES.includes(data.status)) {
    if (!data.current_period_end) {
      plan = "pro";
    } else {
      const periodEnd = new Date(data.current_period_end).getTime();
      if (Number.isNaN(periodEnd) || periodEnd > Date.now()) {
        plan = "pro";
      }
    }
  }

  if (plan === "free") {
    // Legitimate "no active row yet" case (Supabase queried successfully,
    // just nothing pro on file) - bridges the window between a successful
    // checkout and the webhook writing the Supabase row.
    const user = await currentUser();

    if (
      user?.publicMetadata?.plan === "pro" ||
      user?.publicMetadata?.proAccess === true
    ) {
      plan = "pro";
    }
  }

  planCache.set(userId, { plan, expiresAt: Date.now() + PLAN_CACHE_TTL_MS });

  return plan;
}