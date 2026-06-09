import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/subscription";
import crypto from "crypto";
import { NextResponse } from "next/server";

function createCliToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return `hpx_${rawToken}`;
}

function hashCliToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// POST /api/cli/token
// Generates a new CLI token for the authenticated Pro user.
// The plaintext token is returned once and never stored.
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const plan = await getUserPlan(userId);

  if (plan !== "pro") {
    return NextResponse.json(
      {
        error:
          "A Hyperiux Pro subscription is required to generate a CLI token.",
      },
      { status: 403 }
    );
  }

  const token = createCliToken();
  const tokenHash = hashCliToken(token);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      cli_token_hash: tokenHash,
      cli_token_created_at: new Date().toISOString(),
      cli_token_last_used_at: null,
      cli_token_revoked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("CLI_TOKEN_GENERATION_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate CLI token." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    token,
    message: "Copy this token now. It will not be shown again.",
  });
}