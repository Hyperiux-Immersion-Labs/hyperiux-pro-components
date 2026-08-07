import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/subscription";
import { isAdminUser } from "@/lib/admin";

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 10;

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function resolveLimitContext(userId) {
  const [user, plan] = await Promise.all([currentUser(), getUserPlan(userId)]);
  const isAdmin = isAdminUser(user);
  const limit = isAdmin ? null : plan === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  return { plan, isAdmin, limit };
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ signedIn: false });
  }

  const { plan, isAdmin, limit } = await resolveLimitContext(userId);

  if (isAdmin) {
    return NextResponse.json({
      signedIn: true,
      isAdmin: true,
      plan,
      limit: null,
      count: 0,
      remaining: null,
    });
  }

  const { data, error } = await supabase
    .from("copy_usage")
    .select("copy_count")
    .eq("clerk_user_id", userId)
    .eq("usage_date", todayUTC())
    .maybeSingle();

  if (error) {
    console.error("COPY_USAGE_GET_ERROR:", error);

    return NextResponse.json({
      signedIn: true,
      isAdmin: false,
      plan,
      limit,
      count: 0,
      remaining: limit,
    });
  }

  const count = data?.copy_count || 0;

  return NextResponse.json({
    signedIn: true,
    isAdmin: false,
    plan,
    limit,
    count,
    remaining: Math.max(0, limit - count),
  });
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ allowed: false, signedIn: false }, { status: 401 });
  }

  const { plan, isAdmin, limit } = await resolveLimitContext(userId);

  if (isAdmin) {
    return NextResponse.json({
      allowed: true,
      signedIn: true,
      isAdmin: true,
      plan,
      limit: null,
      count: 0,
      remaining: null,
    });
  }

  const today = todayUTC();

  const { data: existing, error: readError } = await supabase
    .from("copy_usage")
    .select("copy_count")
    .eq("clerk_user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  if (readError) {
    console.error("COPY_USAGE_READ_ERROR:", readError);

    return NextResponse.json(
      { allowed: false, signedIn: true, isAdmin: false, plan, limit, count: 0, remaining: limit },
      { status: 500 }
    );
  }

  const currentCount = existing?.copy_count || 0;

  if (currentCount >= limit) {
    return NextResponse.json({
      allowed: false,
      signedIn: true,
      isAdmin: false,
      plan,
      limit,
      count: currentCount,
      remaining: 0,
    });
  }

  const nextCount = currentCount + 1;

  const { error: writeError } = await supabase.from("copy_usage").upsert(
    {
      clerk_user_id: userId,
      usage_date: today,
      copy_count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,usage_date" }
  );

  if (writeError) {
    console.error("COPY_USAGE_WRITE_ERROR:", writeError);

    return NextResponse.json(
      {
        allowed: false,
        signedIn: true,
        isAdmin: false,
        plan,
        limit,
        count: currentCount,
        remaining: Math.max(0, limit - currentCount),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    allowed: true,
    signedIn: true,
    isAdmin: false,
    plan,
    limit,
    count: nextCount,
    remaining: Math.max(0, limit - nextCount),
  });
}
