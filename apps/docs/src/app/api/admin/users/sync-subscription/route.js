import { NextResponse } from "next/server";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { syncSubscription } from "@/lib/subscription-sync";

// "Sync with Razorpay" in the Manage drawer's Billing section (super admins): one account
// brought in line with Razorpay (lib/subscription-sync). Logged when it changed anything.
export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId } = await request.json().catch(() => ({}));
  if (!clerkUserId) return NextResponse.json({ error: "clerkUserId is required." }, { status: 400 });

  try {
    const result = await syncSubscription(clerkUserId);
    if (result.changes.length) {
      await recordAdminAction({ action: "subscription.sync", targetClerkUserId: clerkUserId, details: { changes: result.changes } });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("ADMIN_SYNC_SUBSCRIPTION_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: error?.error?.description || "Couldn't sync with Razorpay." }, { status: 502 });
  }
}
