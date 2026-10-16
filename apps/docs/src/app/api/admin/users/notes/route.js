import { NextResponse } from "next/server";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";

// A private note on an account (the Manage drawer's Support section), for the team only:
// kept in the admin audit log (action "note.add"), so notes carry who wrote them and when
// and sit in the account's History. Read back through /api/admin/audit?action=note.add.
export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, body } = await request.json().catch(() => ({}));
  const text = typeof body === "string" ? body.trim() : "";
  if (!clerkUserId || !text) return NextResponse.json({ error: "clerkUserId and a note are required." }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Keep a note under 2,000 characters." }, { status: 400 });

  const saved = await recordAdminAction({ action: "note.add", targetClerkUserId: clerkUserId, details: { body: text } });
  if (!saved) return NextResponse.json({ error: "Couldn't save the note." }, { status: 500 });
  return NextResponse.json({ saved: true });
}
