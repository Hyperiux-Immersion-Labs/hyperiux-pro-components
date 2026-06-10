export function resolveMediaUrl(
  rawMediaUrl,
  { defaultDirectory, defaultExtension } = {}
) {
  if (!rawMediaUrl) return null;

  const src = String(rawMediaUrl).trim();
  if (!src) return null;
  if (/^(https?:)?\/\//.test(src)) return src;

  const baseUrl = process.env.NEXT_PUBLIC_DEV_URL || "";
  const normalized = src.replace(/^\/+/, "").replace(/\/+$/, "");
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(normalized);
  const pathWithExtension =
    defaultExtension && !hasExtension
      ? `${normalized}.${defaultExtension.replace(/^\./, "")}`
      : normalized;
  const mediaPath =
    defaultDirectory && !pathWithExtension.includes("/")
      ? `${defaultDirectory.replace(/^\/+|\/+$/g, "")}/${pathWithExtension}`
      : pathWithExtension;

  return `${baseUrl}/${mediaPath}`;
}

export function resolveEffectVideoUrl(effect) {
  return resolveMediaUrl(
    effect?.videoUrl || effect?.videoURL || effect?.video_url,
    { defaultExtension: "mp4" }
  );
}
