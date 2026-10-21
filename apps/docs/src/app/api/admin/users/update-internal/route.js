import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin";
import { clearClerkUsersCache, internalReason } from "@/lib/admin-data";
import { recordAdminAction } from "@/lib/admin-audit";
import { getInternalLists } from "@/lib/app-settings";

// "Mark as internal" in the Users tab's Manage drawer: a team or test account,
// kept out of the customer numbers (revenue, installs, signups) and shown under
// the Internal switch instead. Sets publicMetadata.internal - a sibling key to
// plan / role, merged, so nothing else on the account changes. Accounts that are
// internal for another reason (an admin role, a team email or domain) stay
// internal whatever this flag says.
export async function POST(request) {
  if (!(await requirePermission("users.internal"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { clerkUserId, internal } = await request.json();

    if (!clerkUserId || typeof internal !== "boolean") {
      return NextResponse.json({ error: "clerkUserId and internal (true|false) are required." }, { status: 400 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { internal: internal || null },
    });
    clearClerkUsersCache();
    await recordAdminAction({ action: internal ? "internal.mark" : "internal.unmark", targetClerkUserId: clerkUserId });

    return NextResponse.json({ success: true, internal: internalReason(user, await getInternalLists()) });
  } catch (error) {
    console.error("ADMIN_UPDATE_INTERNAL_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
