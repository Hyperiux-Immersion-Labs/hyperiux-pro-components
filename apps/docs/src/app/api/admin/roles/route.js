import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { accessOf, isOwnerUser, requireOwner } from "@/lib/admin";
import { cleanRoleInput, createAdminRole, deleteAdminRole, getAdminRoles, updateAdminRole } from "@/lib/admin-roles";
import { recordAdminAction } from "@/lib/admin-audit";
import { getAllClerkUsers } from "@/lib/admin-data";

// The admin Roles tab (the owner only): named sets of permissions (lib/admin-permissions)
// given to admins in the Manage drawer's Access section. ADMIN_ROLES_PLAN.md.
//   GET                                       every role, with who has it
//   POST   { name, description, permissions } create one
//   PATCH  { id, name, description, permissions } edit one
//   DELETE { id }                             delete one nobody has
// Until sql/admin_roles.sql has run, the presets are listed but nothing can change.

const NOT_STORED = "Roles can't be changed until the admin_roles table exists - run sql/admin_roles.sql.";

// role id -> [{ id, name, email }] of the admins who have it (the owner has every permission
// and no roles)
async function holdersByRole() {
  const holders = new Map();
  for (const user of await getAllClerkUsers()) {
    if (isOwnerUser(user)) continue;
    for (const id of accessOf(user).roles) {
      if (!holders.has(id)) holders.set(id, []);
      holders.get(id).push({ id: user.id, name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null, email: user.emailAddresses?.[0]?.emailAddress || null });
    }
  }
  return holders;
}

export async function GET() {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const [{ roles, stored }, holders] = await Promise.all([getAdminRoles(), holdersByRole()]);
    return NextResponse.json({ stored, roles: roles.map((role) => ({ ...role, holders: holders.get(role.id) || [] })) });
  } catch (error) {
    console.error("ADMIN_ROLES_ERROR:", error);
    return NextResponse.json({ error: "Couldn't load the roles." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await getAdminRoles()).stored) return NextResponse.json({ error: NOT_STORED }, { status: 503 });

  const input = cleanRoleInput(await request.json().catch(() => ({})));
  if (input.error) return NextResponse.json({ error: input.error }, { status: 400 });
  try {
    const { userId } = await auth();
    const role = await createAdminRole(input, userId);
    await recordAdminAction({ action: "role.create", details: { id: role.id, name: role.name, permissions: role.permissions } });
    return NextResponse.json({ role });
  } catch (error) {
    console.error("ADMIN_ROLE_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Couldn't create the role." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { roles, stored } = await getAdminRoles();
  if (!stored) return NextResponse.json({ error: NOT_STORED }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const before = roles.find((role) => role.id === body.id);
  if (!before) return NextResponse.json({ error: "No such role." }, { status: 404 });
  const input = cleanRoleInput(body);
  if (input.error) return NextResponse.json({ error: input.error }, { status: 400 });
  try {
    const role = await updateAdminRole(before.id, input);
    await recordAdminAction({
      action: "role.edit",
      details: {
        id: before.id,
        name: role.name,
        added: role.permissions.filter((key) => !before.permissions.includes(key)),
        removed: before.permissions.filter((key) => !role.permissions.includes(key)),
      },
    });
    return NextResponse.json({ role });
  } catch (error) {
    console.error("ADMIN_ROLE_EDIT_ERROR:", error);
    return NextResponse.json({ error: "Couldn't save the role." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { roles, stored } = await getAdminRoles();
  if (!stored) return NextResponse.json({ error: NOT_STORED }, { status: 503 });

  const { id } = await request.json().catch(() => ({}));
  const role = roles.find((item) => item.id === id);
  if (!role) return NextResponse.json({ error: "No such role." }, { status: 404 });
  const holders = (await holdersByRole()).get(id) || [];
  if (holders.length) {
    return NextResponse.json({ error: `${holders.length} admin${holders.length === 1 ? " has" : "s have"} this role. Take it away from them first.` }, { status: 409 });
  }
  try {
    await deleteAdminRole(id);
    await recordAdminAction({ action: "role.delete", details: { id, name: role.name, permissions: role.permissions } });
    return NextResponse.json({ deleted: id });
  } catch (error) {
    console.error("ADMIN_ROLE_DELETE_ERROR:", error);
    return NextResponse.json({ error: "Couldn't delete the role." }, { status: 500 });
  }
}
