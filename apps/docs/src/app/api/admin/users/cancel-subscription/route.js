import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";
import { markUserFree } from "@/lib/pro-access";
import { CANCEL_SCHEDULED_KEY } from "@/lib/subscription-events";

// "Cancel subscription" in the Manage drawer's Billing section (super admins).
//   when "period_end": like the customer's own cancel (api/user/cancel-subscription) - the
//     plan stays until the paid period ends, nothing more is charged
//   when "now": Razorpay cancels straight away and the account moves to Free now. Nothing
//     is refunded (that's Refund, on a payment).
// Razorpay's subscription.cancelled webhook follows either way; it changes nothing more.
const ENDED = new Set(["cancelled", "completed", "expired"]);

export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, when } = await request.json().catch(() => ({}));
  if (!clerkUserId || !["now", "period_end"].includes(when)) {
    return NextResponse.json({ error: "clerkUserId and when (now|period_end) are required." }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("subscriptions")
    .select("plan, razorpay_subscription_id, current_period_end")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Couldn't read the subscription." }, { status: 500 });
  if (!row?.razorpay_subscription_id) {
    return NextResponse.json({ error: "There's no Razorpay subscription on this account." }, { status: 400 });
  }

  const id = row.razorpay_subscription_id;
  try {
    const live = await withRazorpayRetry(() => razorpay.subscriptions.fetch(id));
    if (live?.notes?.clerk_user_id && live.notes.clerk_user_id !== clerkUserId) {
      return NextResponse.json({ error: "That subscription belongs to another account at Razorpay." }, { status: 409 });
    }
    if (ENDED.has(live?.status)) {
      return NextResponse.json({ error: `The subscription is already ${live.status} at Razorpay.` }, { status: 400 });
    }
    await razorpay.subscriptions.cancel(id, when === "period_end");
  } catch (cancelError) {
    console.error("ADMIN_CANCEL_SUBSCRIPTION_ERROR:", id, cancelError);
    return NextResponse.json({ error: cancelError?.error?.description || "Razorpay couldn't cancel the subscription." }, { status: 502 });
  }

  if (when === "now") {
    await markUserFree({ clerkUserId, status: "cancelled" });
  } else {
    // Shown on the customer's dashboard until the webhook ends the plan; Razorpay has
    // already cancelled, so a failure here only affects that label
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(clerkUserId);
      await clerk.users.updateUser(clerkUserId, { publicMetadata: { ...user.publicMetadata, [CANCEL_SCHEDULED_KEY]: id } });
    } catch (metadataError) {
      console.error("ADMIN_CANCEL_SUBSCRIPTION_METADATA_ERROR:", id, metadataError);
    }
  }

  await recordAdminAction({
    action: when === "now" ? "subscription.cancel_now" : "subscription.cancel_at_period_end",
    targetClerkUserId: clerkUserId,
    details: { subscriptionId: id, accessUntil: when === "now" ? null : row.current_period_end },
  });

  return NextResponse.json({ cancelled: true, when, accessUntil: when === "now" ? null : row.current_period_end || null });
}
