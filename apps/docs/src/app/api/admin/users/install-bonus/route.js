import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { todayUTC } from "@/lib/install-limit";

// Allow extra installs today (the Manage drawer's Support section): adds to the account's
// daily limit until midnight UTC (lib/install-limit installBonusToday). 0 takes it away.
// Nothing in the install history changes.
export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clerkUserId, extra } = await request.json().catch(() => ({}));
  if (!clerkUserId || !Number.isInteger(extra) || extra < 0 || extra > 20) {
    return NextResponse.json({ error: "clerkUserId and extra (0 to 20) are required." }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      privateMetadata: { installBonus: extra ? { date: todayUTC(), extra } : null },
    });
  } catch (error) {
    console.error("ADMIN_INSTALL_BONUS_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: "Couldn't change today's limit." }, { status: 500 });
  }

  await recordAdminAction({ action: "installs.bonus", targetClerkUserId: clerkUserId, details: { extra, date: todayUTC() } });
  return NextResponse.json({ extraToday: extra });
}
