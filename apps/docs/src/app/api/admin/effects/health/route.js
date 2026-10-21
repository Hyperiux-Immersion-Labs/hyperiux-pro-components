import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin";
import { getRegistryIndex } from "@/lib/registry";
import { getAllSanityEffectGuides } from "@/lib/sanity";
import { getAiCatalogue } from "@/lib/ai-catalogue";
import { computeEffectHealth } from "@/lib/effect-health";

// The admin Effects tab: where effects' Sanity guides and registry entries disagree or
// are incomplete (lib/effect-health). Needs effects.view (Effect health).

// The deployed Sanity Studio (sanity.io-hosted). "Open in Sanity" links go to
// <studio>/intent/edit/id=<document>;type=effectContent. NEXT_PUBLIC_SANITY_STUDIO_URL
// overrides it if the Studio moves.
const STUDIO_URL = "https://www.sanity.io/@oAa48P5gs/studio/br8l6a6ucf3dbi2mdh8n76vd/default";
export async function GET() {
  if (!(await requirePermission("effects.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [guides, catalogue] = await Promise.all([getAllSanityEffectGuides(), getAiCatalogue()]);
    const health = computeEffectHealth({ registryItems: getRegistryIndex()?.items || [], guides, catalogue });
    return NextResponse.json({
      ...health,
      // For "Open in Sanity" links
      studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || STUDIO_URL,
    });
  } catch (error) {
    console.error("ADMIN_EFFECT_HEALTH_ERROR:", error);
    return NextResponse.json({ error: "Couldn't check the effects." }, { status: 500 });
  }
}
