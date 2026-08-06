import "server-only";
import { supabase } from "@/lib/supabase";

async function countEffectInstalls(effect) {
  const { count, error } = await supabase
    .from("cli_effect_installs")
    .select("*", { count: "exact", head: true })
    .eq("effect", effect);

  if (error) {
    console.error("CLI_INSTALL_STATS_COUNT_ERROR:", error);
    return 0;
  }

  return count ?? 0;
}

export async function getEffectInstallCounts(effects) {
  const effectSlugs = [
    ...new Set(
      effects
        .map((effect) => effect?.name || effect?.effectSlug || effect?.slug)
        .filter(Boolean)
    ),
  ];

  const counts = await Promise.all(effectSlugs.map(countEffectInstalls));

  return Object.fromEntries(
    effectSlugs.map((effectSlug, index) => [effectSlug, counts[index]])
  );
}

export function attachInstallCounts(effects, installCounts) {
  return effects.map((effect) => {
    const effectSlug = effect?.name || effect?.effectSlug || effect?.slug;

    return {
      ...effect,
      installCount: installCounts?.[effectSlug] ?? 0,
    };
  });
}
