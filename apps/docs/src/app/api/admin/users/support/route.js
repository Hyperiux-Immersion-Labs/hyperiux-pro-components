import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";
import { getCreditBalance } from "@/lib/template-credits";
import { installBonusToday, resolveSignedInIdentity, todayUTC } from "@/lib/install-limit";

// The Manage drawer's Support section (super admins): template credits, templates owned,
// today's installs against the daily limit (with any extra allowed for today).
export async function GET(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const clerkUserId = new URL(request.url).searchParams.get("clerkUserId");
  if (!clerkUserId) return NextResponse.json({ error: "clerkUserId is required." }, { status: 400 });

  try {
    const [credits, owned, today, identity, user] = await Promise.all([
      getCreditBalance(clerkUserId),
      supabase.from("template_purchases").select("template_slug, source").eq("clerk_user_id", clerkUserId).eq("status", "paid"),
      supabase.from("install_unlocks").select("effect_slug", { count: "exact", head: true }).eq("identity_key", `user:${clerkUserId}`).eq("usage_date", todayUTC()),
      resolveSignedInIdentity(clerkUserId),
      clerkClient().then((clerk) => clerk.users.getUser(clerkUserId)),
    ]);
    if (owned.error) throw owned.error;

    return NextResponse.json({
      credits,
      templates: [...new Set((owned.data || []).map((row) => row.template_slug))],
      installsToday: today.count || 0,
      // null: not metered (admins)
      limit: identity.limit,
      extraToday: installBonusToday(user),
    });
  } catch (error) {
    console.error("ADMIN_SUPPORT_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: "Couldn't load support details." }, { status: 500 });
  }
}
