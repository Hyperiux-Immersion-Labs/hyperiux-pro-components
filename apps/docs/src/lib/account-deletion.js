import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { razorpay } from "@/lib/razorpay";

// Deleting an account for good - the account's own "Delete account" (api/user/delete-account)
// and a super admin's Delete in the Users tab (api/admin/users/delete) do exactly this:
//
// 1. A live Razorpay subscription is cancelled first - if that fails, nothing else is
//    touched (better a retry than a deleted account that keeps being billed).
// 2. The account's own data is removed: saves, template credits, usage history and the
//    subscription row (which holds the CLI token, so the token stops working).
//    Invoices and template purchases stay - tax records the law requires keeping.
//    CLI telemetry is anonymised rather than deleted.
// 3. The Clerk user is deleted last, which signs them out everywhere.
//
// Returns { ok: true } or { ok: false, status, error } (the error says what happened, in
// words for the person who asked; `subject` is "your" or "their").

const LIVE_STATUSES = new Set(["created", "authenticated", "active", "pending", "halted"]);

export async function deleteAccount(userId, { subject = "your" } = {}) {
  // 1. Stop billing
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("razorpay_subscription_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (subscriptionError) {
    console.error("DELETE_ACCOUNT_SUBSCRIPTION_ERROR:", userId, subscriptionError);
    return { ok: false, status: 500, error: `Couldn't delete ${subject === "your" ? "your" : "the"} account. Please try again.` };
  }
  if (subscription?.razorpay_subscription_id) {
    try {
      const live = await razorpay.subscriptions.fetch(subscription.razorpay_subscription_id);
      if (LIVE_STATUSES.has(live?.status)) await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, false);
    } catch (error) {
      console.error("DELETE_ACCOUNT_CANCEL_ERROR:", subscription.razorpay_subscription_id, error);
      return { ok: false, status: 502, error: `We couldn't cancel ${subject} subscription, so nothing was deleted. Please try again${subject === "your" ? " or contact support" : ""}.` };
    }
  }

  // 2. Remove the account's data (billing records stay)
  const results = await Promise.all([
    supabase.from("wishlisted_effects").delete().eq("clerk_user_id", userId),
    supabase.from("wishlisted_templates").delete().eq("clerk_user_id", userId),
    supabase.from("template_credits").delete().eq("clerk_user_id", userId),
    supabase.from("install_unlocks").delete().eq("clerk_user_id", userId),
    supabase.from("install_events").delete().eq("clerk_user_id", userId),
    supabase.from("cli_telemetry_events").update({ clerk_user_id: null }).eq("clerk_user_id", userId),
    supabase.from("subscriptions").delete().eq("clerk_user_id", userId),
  ]);
  const failed = results.find((result) => result.error);
  if (failed) {
    console.error("DELETE_ACCOUNT_DATA_ERROR:", userId, failed.error);
    return { ok: false, status: 500, error: `Couldn't remove all of ${subject} data. Please try again.` };
  }

  // 3. The account itself
  try {
    await (await clerkClient()).users.deleteUser(userId);
  } catch (error) {
    console.error("DELETE_ACCOUNT_CLERK_ERROR:", userId, error);
    return { ok: false, status: 500, error: `${subject === "your" ? "Your" : "Their"} data was removed but the account couldn't be closed. Please try again.` };
  }
  return { ok: true };
}
