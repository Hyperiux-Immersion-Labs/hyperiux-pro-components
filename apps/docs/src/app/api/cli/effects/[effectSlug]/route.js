import { NextResponse } from "next/server";
import { getEffectBySlug } from "@/lib/registry";
import { getCliTokenFromRequest, verifyCliToken } from "@/lib/cli-auth";

function normalizeFiles(effect) {
  return (effect.files || []).map((file) => ({
    path: file.path,
    target: file.target,
    targetPath: file.target || file.targetPath || file.path,
    type: file.type,
    source: file.source,
    encoding: file.encoding,
    content: file.content,
  }));
}

export async function GET(request, { params }) {
  const { effectSlug } = await params;

  const effect = getEffectBySlug(effectSlug);

  if (!effect) {
    return NextResponse.json(
      { error: "Effect not found." },
      { status: 404 }
    );
  }

  const effectTier = effect.tier || "free";
  const isProEffect = effectTier === "pro" || effectTier === "paid";

  if (isProEffect) {
    const token = getCliTokenFromRequest(request);
    const verification = await verifyCliToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        {
          error: verification.reason,
          requiresPro: true,
        },
        { status: verification.status || 403 }
      );
    }
  }

  return NextResponse.json({
    name: effect.name,
    type: effect.type,
    title: effect.title,
    description: effect.description,
    category: effect.category,
    categories: effect.categories || [effect.category || "components"],
    tier: effectTier,
    dependencies: effect.dependencies || [],
    registryDependencies: effect.registryDependencies || [],
    exportName: effect.exportName,
    exportKind: effect.exportKind || "named",
    previewUrl: effect.previewUrl,
    coverImage: effect.coverImage,
    videoUrl: effect.videoUrl,
    files: normalizeFiles(effect),
  });
}
