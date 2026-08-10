import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/subscription";
import { isAdminUser } from "@/lib/admin";
import { getEffectMetadata } from "@/lib/registry";
import { getAllSanityEffectEntries, buildEffectsFromSanity } from "@/lib/sanity";

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 10;

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, plan, sanityEntries] = await Promise.all([
    currentUser(),
    getUserPlan(userId),
    getAllSanityEffectEntries(),
  ]);
  const isAdmin = isAdminUser(user);
  const limit = isAdmin ? null : plan === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  // Same source the vault listing (and, at save-time, the Saved Effects
  // page) uses for cover/video assets - registry.json has neither field, so
  // reading it directly here left cards with no poster/video.
  const sanityEffectsBySlug = new Map(
    buildEffectsFromSanity(sanityEntries).map((effect) => [effect.name, effect])
  );

  const [{ data: todayRows, error: todayError }, { data: allRows, error: allError }] =
    await Promise.all([
      supabase
        .from("copy_usage_effects")
        .select("effect_slug")
        .eq("clerk_user_id", userId)
        .eq("usage_date", todayUTC()),

      supabase
        .from("copy_usage_effects")
        .select("effect_slug, usage_date")
        .eq("clerk_user_id", userId)
        .order("usage_date", { ascending: false }),
    ]);

  if (todayError || allError) {
    console.error("DASHBOARD_COPY_USAGE_ERROR:", todayError || allError);

    return NextResponse.json(
      { error: "Failed to load copy usage" },
      { status: 500 }
    );
  }

  const count = (todayRows || []).length;
  const remaining = isAdmin ? null : Math.max(0, limit - count);

  // copy_usage_effects has one row per (day, effect) - dedupe to the most
  // recent copy per effect since rows are already ordered newest-first.
  const seenSlugs = new Set();
  const copiedEffects = [];

  for (const row of allRows || []) {
    if (seenSlugs.has(row.effect_slug)) continue;
    seenSlugs.add(row.effect_slug);

    const metadata = sanityEffectsBySlug.get(row.effect_slug) || getEffectMetadata(row.effect_slug);
    if (!metadata) continue;

    copiedEffects.push({
      name: row.effect_slug,
      title: metadata.title || row.effect_slug,
      category: metadata.category,
      categories: metadata.categories,
      // Fall back to the same <slug>.png / <slug>.mp4 convention
      // mergeRegistryWithSanity uses when Sanity has no explicit asset.
      coverImage: metadata.coverImage || row.effect_slug,
      videoUrl: metadata.videoUrl || `${row.effect_slug}.mp4`,
      tier: metadata.tier || "free",
      lastCopiedAt: row.usage_date,
    });
  }

  return NextResponse.json({
    plan,
    isAdmin,
    limit,
    count,
    remaining,
    copiedEffects,
  });
}
