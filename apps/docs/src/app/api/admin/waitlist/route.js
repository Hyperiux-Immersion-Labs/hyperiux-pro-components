import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";

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
