import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { ACCOUNT_DELETED_COOKIE } from "@/lib/account-deleted";
import { deleteAccount } from "@/lib/account-deletion";

// "Delete account" in the dashboard's settings: the account and its data go for good
// (lib/account-deletion: billing stopped first, data removed, invoices kept, then Clerk).
// Admin accounts can't delete themselves here (another super admin removes their access first).

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { confirm } = await request.json().catch(() => ({}));
  if (confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm." }, { status: 400 });
  }

  const user = await currentUser();
  if (isAdminUser(user)) {
    return NextResponse.json({ error: "Admin accounts can't be deleted here. Ask a super admin to remove your access first." }, { status: 403 });
  }

  const result = await deleteAccount(userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // A short-lived marker for this browser: its dashboard pages (Back after deleting) go to
  // the effects instead of the sign-in page (proxy.js, DashboardShell)
  const res = NextResponse.json({ deleted: true });
  res.cookies.set(ACCOUNT_DELETED_COOKIE, "1", { maxAge: 15 * 60, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}
