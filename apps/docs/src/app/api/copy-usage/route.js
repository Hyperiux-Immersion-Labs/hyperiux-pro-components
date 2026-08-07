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

async function getEffectSlugsToday(userId) {
  const { data, error } = await supabase
    .from("copy_usage_effects")
    .select("effect_slug")
    .eq("clerk_user_id", userId)
    .eq("usage_date", todayUTC());

  if (error) throw error;

  return (data || []).map((row) => row.effect_slug);
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
      effectSlugs: [],
    });
  }

  let effectSlugs = [];

  try {
    effectSlugs = await getEffectSlugsToday(userId);
  } catch (error) {
    console.error("COPY_USAGE_GET_ERROR:", error);

    return NextResponse.json({
      signedIn: true,
      isAdmin: false,
      plan,
      limit,
      count: 0,
      remaining: limit,
      effectSlugs: [],
    });
  }

  const count = effectSlugs.length;

  return NextResponse.json({
    signedIn: true,
    isAdmin: false,
    plan,
    limit,
    count,
    remaining: Math.max(0, limit - count),
    effectSlugs,
  });
}

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ allowed: false, signedIn: false }, { status: 401 });
  }

  const { effectSlug } = await request.json().catch(() => ({}));

  if (!effectSlug || typeof effectSlug !== "string") {
    return NextResponse.json({ allowed: false, error: "Missing effectSlug." }, { status: 400 });
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
      effectSlugs: [],
    });
  }

  const today = todayUTC();

  let effectSlugs;

  try {
    effectSlugs = await getEffectSlugsToday(userId);
  } catch (error) {
    console.error("COPY_USAGE_READ_ERROR:", error);

    return NextResponse.json(
      { allowed: false, signedIn: true, isAdmin: false, plan, limit, count: 0, remaining: limit, effectSlugs: [] },
      { status: 500 }
    );
  }

  // Already unlocked earlier today - free to keep copying from this effect,
  // it doesn't consume another slot.
  if (effectSlugs.includes(effectSlug)) {
    const count = effectSlugs.length;

    return NextResponse.json({
      allowed: true,
      signedIn: true,
      isAdmin: false,
      plan,
      limit,
      count,
      remaining: Math.max(0, limit - count),
      effectSlugs,
    });
  }

  if (effectSlugs.length >= limit) {
    return NextResponse.json({
      allowed: false,
      signedIn: true,
      isAdmin: false,
      plan,
      limit,
      count: effectSlugs.length,
      remaining: 0,
      effectSlugs,
    });
  }

  const { error: writeError } = await supabase.from("copy_usage_effects").upsert(
    {
      clerk_user_id: userId,
      usage_date: today,
      effect_slug: effectSlug,
    },
    { onConflict: "clerk_user_id,usage_date,effect_slug", ignoreDuplicates: true }
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
        count: effectSlugs.length,
        remaining: Math.max(0, limit - effectSlugs.length),
        effectSlugs,
      },
      { status: 500 }
    );
  }

  const nextEffectSlugs = [...effectSlugs, effectSlug];
  const nextCount = nextEffectSlugs.length;

  return NextResponse.json({
    allowed: true,
    signedIn: true,
    isAdmin: false,
    plan,
    limit,
    count: nextCount,
    remaining: Math.max(0, limit - nextCount),
    effectSlugs: nextEffectSlugs,
  });
}
