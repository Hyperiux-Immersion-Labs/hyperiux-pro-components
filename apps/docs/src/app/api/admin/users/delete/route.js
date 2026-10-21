import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isOwnerUser, requireOwner } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { clearClerkUsersCache } from "@/lib/admin-data";
import { deleteAccount } from "@/lib/account-deletion";

// Delete accounts for good, from the Users tab (super admins only): one, or several picked
// with the row checkboxes. Each goes the way an account's own "Delete account" does
// (lib/account-deletion). Never your own account, and never another super admin's.
//   POST { clerkUserIds: [id] } (1-50)
//   -> { deleted: [id], failed: [{ id, error }] }
const MAX = 50;

export async function POST(request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Only a super admin can delete accounts." }, { status: 403 });
  }
  const { userId: me } = await auth();
  const { clerkUserIds } = await request.json().catch(() => ({}));
  const ids = Array.isArray(clerkUserIds) ? [...new Set(clerkUserIds.filter((id) => typeof id === "string" && /^user_[A-Za-z0-9]+$/.test(id)))] : [];
  if (!ids.length || ids.length > MAX || ids.length !== clerkUserIds.length) {
    return NextResponse.json({ error: `Pick between 1 and ${MAX} accounts.` }, { status: 400 });
  }
  if (ids.includes(me)) {
    return NextResponse.json({ error: "You can't delete your own account here." }, { status: 400 });
  }

  const clerk = await clerkClient();
  const deleted = [];
  const failed = [];
  // One at a time: each cancels billing and talks to Razorpay and Clerk
  for (const id of ids) {
    let target;
    try {
      target = await clerk.users.getUser(id);
    } catch {
      failed.push({ id, error: "No such account." });
      continue;
    }
    if (isOwnerUser(target)) {
      failed.push({ id, error: "Super admins can't be deleted here." });
      continue;
    }
    const email = target.emailAddresses?.[0]?.emailAddress || null;
    const result = await deleteAccount(id, { subject: "their" });
    if (!result.ok) {
      failed.push({ id, error: result.error });
      continue;
    }
    deleted.push(id);
    await recordAdminAction({ action: "account.delete", targetClerkUserId: id, details: { email, name: [target.firstName, target.lastName].filter(Boolean).join(" ") || null } });
  }
  if (deleted.length) clearClerkUsersCache();
  return NextResponse.json({ deleted, failed }, { status: deleted.length ? 200 : 400 });
}
