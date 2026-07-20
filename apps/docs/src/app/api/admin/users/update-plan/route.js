import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export async function POST(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { clerkUserId, plan } = await request.json();

    if (!clerkUserId || !["free", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "clerkUserId and plan (free|pro) are required." },
        { status: 400 }
      );
    }

    const newStatus = plan === "pro" ? "active" : "inactive";

    // Downgrading to free must kill any existing CLI token outright, not
    // just rely on verifyCliToken's plan check - otherwise a later
    // re-upgrade without a fresh `npx hyperiux login` would silently
    // reactivate the old token.
    const revokeFields =
      plan === "free"
        ? {
            cli_token_hash: null,
            cli_token_revoked_at: new Date().toISOString(),
          }
        : {};

    // Update Supabase
    const { error: supabaseError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          plan,
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...revokeFields,
        },
        { onConflict: "clerk_user_id" }
      );

    if (supabaseError) {
      console.error("ADMIN_UPDATE_PLAN_SUPABASE_ERROR:", supabaseError);
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    // Update Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        plan,
        proAccess: plan === "pro",
      },
    });

    return NextResponse.json({ success: true, plan, status: newStatus });
  } catch (error) {
    console.error("ADMIN_UPDATE_PLAN_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
