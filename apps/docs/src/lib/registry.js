import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(process.cwd(), "public/r");

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read registry file: ${filePath}`, error);
    return null;
  }
}

export function getRegistryIndex() {
  const indexPath = path.join(REGISTRY_PATH, "index.json");
  const index = readJsonFile(indexPath);

  if (!index?.items?.length) {
    return {
      items: [],
    };
  }

  const items = index.items.map((item) => {
    const fullEffectPath = path.join(REGISTRY_PATH, `${item.name}.json`);
    const fullEffect = readJsonFile(fullEffectPath);

    return {
      ...item,

      /*
        These fields may not exist in index.json, so we hydrate them
        from the individual effect JSON file.
      */
      tier: item.tier || fullEffect?.tier || "free",
      type: item.type || fullEffect?.type || "registry:component",
      registryDependencies:
        item.registryDependencies || fullEffect?.registryDependencies || [],
      exportName: item.exportName || fullEffect?.exportName || null,
      exportKind: item.exportKind || fullEffect?.exportKind || "default",
      dependencies: item.dependencies || fullEffect?.dependencies || [],
      categories:
        item.categories ||
        fullEffect?.categories ||
        [item.category || fullEffect?.category || "other"],
      category: item.category || fullEffect?.category || "other",
      previewUrl: item.previewUrl || fullEffect?.previewUrl || null,
      coverImage: item.coverImage || fullEffect?.coverImage || null,
      videoUrl: item.videoUrl || fullEffect?.videoUrl || null,
      addedAt: item.addedAt || fullEffect?.addedAt || 0,
    };
  });

  return {
    ...index,
    items,
  };
}

export function getEffectBySlug(slug) {
  const effectPath = path.join(REGISTRY_PATH, `${slug}.json`);
  return readJsonFile(effectPath);
}

export function getAllEffectSlugs() {
  const index = getRegistryIndex();
  return index.items.map((item) => item.name);
}

export function getEffectsByCategory() {
  const index = getRegistryIndex();
  const categories = {};

  for (const item of index.items) {
    const cats = item.categories?.length
      ? item.categories
      : [item.category || "other"];

    for (const cat of cats) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    }
  }

  return categories;
}

export function getEffectCode(slug) {
  const effect = getEffectBySlug(slug);

  if (!effect || !effect.files || effect.files.length === 0) {
    return null;
  }

  const primary =
    effect.files.find((file) => file.path === `${slug}.jsx`) ||
    effect.files.find((file) => file.path === `${slug}.js`) ||
    effect.files.find((file) => file.path.endsWith(".jsx")) ||
    effect.files.find((file) => file.path.endsWith(".js")) ||
    effect.files[0];

  return primary?.content ?? null;
}