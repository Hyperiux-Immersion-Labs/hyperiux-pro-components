import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getAdminAccessSummary, getRole } from "@/lib/admin";

// The signed-in account's admin access, for the dashboard to decide what to show: its
// role ("super_admin" for the owner, "admin", or null), whether it's the owner, and its
// permissions (lib/admin-permissions). The client can't work these out itself - the
// ADMIN_EMAIL fallback and the roles table are server-side. The server checks every
// request again; this only shapes the screens.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ role: null, owner: false, permissions: [] }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const access = await getAdminAccessSummary(user);

  return NextResponse.json({
    role: getRole(user),
    owner: access.owner,
    // Their roles' names, for "Your access"
    roleNames: access.roleNames,
    permissions: access.permissions,
  });
}
