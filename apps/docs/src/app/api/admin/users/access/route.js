import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { REVOKED_ROLE, accessOf, isOwnerUser, requireOwner } from "@/lib/admin";
import { isPermission } from "@/lib/admin-permissions";
import { getAdminRoles } from "@/lib/admin-roles";
import { recordAdminAction } from "@/lib/admin-audit";
import { clearClerkUsersCache } from "@/lib/admin-data";

// An account's admin access (the Manage drawer's Access section): its roles, plus single
// permissions granted or taken away on top of them (ADMIN_ROLES_PLAN.md). The owner only;
// never the owner's own account (there's one owner, with everything). No roles and no
// grants: no admin access at all.
//   POST { clerkUserId, roles: [role id], grant: [permission], revoke: [permission] }
export async function POST(request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, roles = [], grant = [], revoke = [] } = await request.json().catch(() => ({}));
  const isList = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
  if (!clerkUserId || !isList(roles) || !isList(grant) || !isList(revoke)) {
    return NextResponse.json({ error: "clerkUserId, and roles, grant and revoke as lists, are required." }, { status: 400 });
  }

  const { userId } = await auth();
  if (clerkUserId === userId) {
    return NextResponse.json({ error: "You can't change your own access." }, { status: 400 });
  }

  const known = new Set((await getAdminRoles()).roles.map((role) => role.id));
  const unknownRoles = roles.filter((id) => !known.has(id));
  const unknownKeys = [...grant, ...revoke].filter((key) => !isPermission(key));
  if (unknownRoles.length || unknownKeys.length) {
    return NextResponse.json({ error: `Unknown ${unknownRoles.length ? `roles: ${unknownRoles.join(", ")}` : `permissions: ${unknownKeys.join(", ")}`}` }, { status: 400 });
  }
  const both = grant.filter((key) => revoke.includes(key));
  if (both.length) {
    return NextResponse.json({ error: `Granted and taken away at once: ${both.join(", ")}` }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const target = await clerk.users.getUser(clerkUserId);
    if (isOwnerUser(target)) {
      return NextResponse.json({ error: "A super admin has every permission; super admins are set in Clerk, not here." }, { status: 400 });
    }

    const before = accessOf(target);
    const after = { roles: [...new Set(roles)], grant: [...new Set(grant)], revoke: [...new Set(revoke)] };
    // The roles list says it all; publicMetadata.role becomes "none", not null: a null key is deleted, which would let
    // the ADMIN_EMAIL fallback treat the account as the owner.
    await clerk.users.updateUserMetadata(clerkUserId, { publicMetadata: { admin: after, role: REVOKED_ROLE } });
    // Admins are internal accounts (lib/admin-data internalReason)
    clearClerkUsersCache();

    await recordAdminAction({ action: "access.update", targetClerkUserId: clerkUserId, details: { before, after } });
    return NextResponse.json({ access: after, admin: after.roles.length > 0 || after.grant.length > 0 });
  } catch (error) {
    console.error("ADMIN_ACCESS_UPDATE_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: "Couldn't change their access." }, { status: 500 });
  }
}
