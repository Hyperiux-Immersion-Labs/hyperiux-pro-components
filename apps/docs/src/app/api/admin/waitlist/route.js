import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    const clerk = await clerkClient();
    const result = await clerk.waitlistEntries.list({
      limit,
      orderBy: "-created_at",
    });

    const entries = result.data.map((entry) => ({
      id: entry.id,
      email: entry.emailAddress,
      status: entry.status,
      createdAt: entry.createdAt,
      invited: Boolean(entry.invitation),
    }));

    return NextResponse.json({ entries, total: result.totalCount });
  } catch (error) {
    console.error("ADMIN_WAITLIST_LIST_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
