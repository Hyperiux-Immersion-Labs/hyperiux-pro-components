import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";

// "Refresh page" in the admin Effects tab: an effect's cached page is rebuilt on its next
// visit - for a Sanity edit the publish webhook missed. Effect pages only.
const EFFECT_PATH = /^\/effects\/[a-z0-9-]+\/[a-z0-9-]+$/;

export async function POST(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { path } = await request.json().catch(() => ({}));
  if (typeof path !== "string" || !EFFECT_PATH.test(path)) {
    return NextResponse.json({ error: "An effect page path (/effects/<category>/<effect>) is required." }, { status: 400 });
  }

  revalidatePath(path);
  await recordAdminAction({ action: "effect.refresh", details: { path } });
  return NextResponse.json({ refreshed: path });
}
