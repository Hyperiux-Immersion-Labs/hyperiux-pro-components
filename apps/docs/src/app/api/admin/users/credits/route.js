import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { getCreditBalance } from "@/lib/template-credits";

// Add or remove template credits (the Manage drawer's Support section). An "adjust" row in
// the credits ledger, like the ones expireCredits writes; the reason goes in the audit log.
// Credits still lapse when a plan ends.
export async function POST(request) {
  if (!(await requirePermission("users.support"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, delta, reason } = await request.json().catch(() => ({}));
  if (!clerkUserId || !Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 20) {
    return NextResponse.json({ error: "clerkUserId and delta (a whole number, -20 to 20, not 0) are required." }, { status: 400 });
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "Say why - it goes in the log." }, { status: 400 });
  }

  const balance = await getCreditBalance(clerkUserId);
  if (balance + delta < 0) {
    return NextResponse.json({ error: `They only have ${balance} credit${balance === 1 ? "" : "s"}.` }, { status: 400 });
  }

  const { error } = await supabase.from("template_credits").insert({ clerk_user_id: clerkUserId, delta, reason: "adjust" });
  if (error) {
    console.error("ADMIN_CREDITS_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: "Couldn't change the credits." }, { status: 500 });
  }

  await recordAdminAction({ action: "credits.adjust", targetClerkUserId: clerkUserId, details: { delta, reason: reason.trim().slice(0, 300) } });
  return NextResponse.json({ credits: balance + delta });
}
