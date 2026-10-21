import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUser, isSuperAdminUser, requirePermission } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";

// Suspend or restore an account (the Users tab's Manage drawer). Suspending bans it in
// Clerk: it's signed out everywhere and can't sign in again until restored. Nothing is
// deleted - its plan, payments and history stay. Needs users.suspend; never your own
// account or the owner's, and another admin's only by the owner (an admin can't lock a
// colleague out - the owner takes their access away instead).
export async function POST(request) {
  const access = await requirePermission("users.suspend");
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { clerkUserId, suspended } = await request.json();
    if (!clerkUserId || typeof suspended !== "boolean") {
      return NextResponse.json({ error: "clerkUserId and suspended (true|false) are required." }, { status: 400 });
    }

    const { userId } = await auth();
    if (clerkUserId === userId) {
      return NextResponse.json({ error: "You can't suspend your own account." }, { status: 400 });
    }

    const clerk = await clerkClient();
    const target = await clerk.users.getUser(clerkUserId);
    if (suspended && isSuperAdminUser(target)) {
      return NextResponse.json({ error: "A super admin's account can't be suspended." }, { status: 400 });
    }
    if (isAdminUser(target) && !access.owner) {
      return NextResponse.json({ error: "Only a super admin can suspend or restore an admin." }, { status: 403 });
    }

    const user = suspended ? await clerk.users.banUser(clerkUserId) : await clerk.users.unbanUser(clerkUserId);
    await recordAdminAction({ action: suspended ? "account.suspend" : "account.restore", targetClerkUserId: clerkUserId });
    return NextResponse.json({ suspended: Boolean(user.banned) });
  } catch (error) {
    console.error("ADMIN_SUSPEND_USER_ERROR:", error);
    return NextResponse.json({ error: "Couldn't update this account." }, { status: 500 });
  }
}
