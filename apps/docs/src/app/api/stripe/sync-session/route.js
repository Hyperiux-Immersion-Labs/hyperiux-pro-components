import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncProAccessFromCheckoutSession } from "@/lib/pro-access";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const result = await syncProAccessFromCheckoutSession(sessionId, userId);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("SYNC_SESSION_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync session" },
      { status: 500 }
    );
  }
}
