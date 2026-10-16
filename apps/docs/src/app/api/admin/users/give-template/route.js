import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { redeemTemplateCredit } from "@/lib/template-credits";
import { TEMPLATES } from "@/lib/mock-templates";

// Give a template without payment (the Manage drawer's Support section): one credit is
// added and redeemed for them through the same atomic redemption a customer uses, so it
// shows up everywhere a credit redemption does. Already owned: the credit is taken back.
export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, templateSlug, reason } = await request.json().catch(() => ({}));
  if (!clerkUserId || !TEMPLATES.some((template) => template.slug === templateSlug)) {
    return NextResponse.json({ error: "clerkUserId and a templateSlug from the catalogue are required." }, { status: 400 });
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "Say why - it goes in the log." }, { status: 400 });
  }

  const credit = await supabase.from("template_credits").insert({ clerk_user_id: clerkUserId, delta: 1, reason: "adjust" });
  if (credit.error) {
    console.error("ADMIN_GIVE_TEMPLATE_CREDIT_ERROR:", clerkUserId, credit.error);
    return NextResponse.json({ error: "Couldn't give the template." }, { status: 500 });
  }

  const result = await redeemTemplateCredit({ clerkUserId, templateSlug });
  if (result.status !== "redeemed") {
    // Take the added credit back
    await supabase.from("template_credits").insert({ clerk_user_id: clerkUserId, delta: -1, reason: "adjust" });
    const message = result.status === "already-owned" ? "They already own this template." : "Couldn't give the template.";
    return NextResponse.json({ error: message }, { status: result.status === "already-owned" ? 400 : 500 });
  }

  await recordAdminAction({ action: "template.give", targetClerkUserId: clerkUserId, details: { templateSlug, reason: reason.trim().slice(0, 300) } });
  return NextResponse.json({ given: templateSlug });
}
