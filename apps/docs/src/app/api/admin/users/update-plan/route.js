import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hitesh@weareenigma.com";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  return (
    user?.publicMetadata?.role === "admin" ||
    user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL
  );
}

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

    // Update Supabase
    const { error: supabaseError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          plan,
          status: newStatus,
          updated_at: new Date().toISOString(),
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
