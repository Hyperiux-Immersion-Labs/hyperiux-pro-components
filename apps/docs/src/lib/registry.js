import fs from "fs";
import path from "path";

const PUBLIC_REGISTRY_PATH = path.join(process.cwd(), "public/r");

const PRIVATE_REGISTRY_CANDIDATES = [
  path.join(process.cwd(), "registry/effects"),           // Vercel: cwd = repo root
  path.join(process.cwd(), "../../registry/effects"),     // Vercel: cwd = apps/docs
  path.join(process.cwd(), "apps/docs/registry/effects"), // legacy fallback
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function isCodeFile(filePath = "") {
  return (
    filePath.endsWith(".js") ||
    filePath.endsWith(".jsx") ||
    filePath.endsWith(".ts") ||
    filePath.endsWith(".tsx") ||
    filePath.endsWith(".css") ||
    filePath.endsWith(".json")
  );
}

function getExistingPrivateRegistryRoot() {
  return PRIVATE_REGISTRY_CANDIDATES.find((candidate) =>
    fs.existsSync(candidate)
  );
}

function findPrivateRegistryPath(slug) {
  const privateRoot = getExistingPrivateRegistryRoot();

  if (!privateRoot) {
    console.warn("No private registry root found.", {
      cwd: process.cwd(),
      checked: PRIVATE_REGISTRY_CANDIDATES,
    });

    return null;
  }

  const categories = fs.readdirSync(privateRoot);

  for (const category of categories) {
    const categoryPath = path.join(privateRoot, category);

    if (!fs.statSync(categoryPath).isDirectory()) {
      continue;
    }

    const effectDir = path.join(categoryPath, slug);
    const registryPath = path.join(effectDir, "registry.json");

    if (fs.existsSync(registryPath)) {
      return {
        effectDir,
        registryPath,
      };
    }
  }

  console.warn(`Private registry not found for "${slug}".`, {
    privateRoot,
  });

  return null;
}

function attachPrivateFileContent(effect, effectDir) {
  // If files list is empty (source registry.json has no files key),
  // discover them by scanning the effect directory — same logic as the build script.
  const files =
    effect.files && effect.files.length > 0
      ? effect.files
      : fs
          .readdirSync(effectDir)
          .filter(
            (f) =>
              (f.endsWith(".jsx") ||
                f.endsWith(".js") ||
                f.endsWith(".css")) &&
              f !== "registry.json"
          )
          .map((fileName) => {
            const isCss = fileName.endsWith(".css");
            const isModuleCss = fileName.endsWith(".module.css");
            return {
              path: fileName,
              type: isCss ? "registry:style" : "registry:component",
              target: isCss
                ? isModuleCss
                  ? `components/hyperiux/${fileName}`
                  : `styles/${fileName}`
                : `components/hyperiux/${fileName}`,
              targetPath: isCss
                ? isModuleCss
                  ? `components/hyperiux/${fileName}`
                  : `styles/${fileName}`
                : `components/hyperiux/${fileName}`,
            };
          });

  return {
    ...effect,
    files: files.map((file) => {
      if (file.type === "registry:asset") {
        return file;
      }

      const sourcePath = path.join(effectDir, file.path);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`Private registry source file missing: ${sourcePath}`);
        return file;
      }

      if (!isCodeFile(sourcePath)) {
        return file;
      }

      return {
        ...file,
        content: fs.readFileSync(sourcePath, "utf-8"),
      };
    }),
  };
}

export function getRegistryIndex() {
  const indexPath = path.join(PUBLIC_REGISTRY_PATH, "index.json");
  const content = fs.readFileSync(indexPath, "utf-8");

  return JSON.parse(content);
}

export function getEffectBySlug(slug) {
  const privateMatch = findPrivateRegistryPath(slug);

  if (privateMatch) {
    const effect = readJson(privateMatch.registryPath);

    return attachPrivateFileContent(effect, privateMatch.effectDir);
  }

  const publicEffectPath = path.join(PUBLIC_REGISTRY_PATH, `${slug}.json`);

  if (!fs.existsSync(publicEffectPath)) {
    return null;
  }

  return readJson(publicEffectPath);
}

export function getPublicEffectBySlug(slug) {
  const publicEffectPath = path.join(PUBLIC_REGISTRY_PATH, `${slug}.json`);

  if (!fs.existsSync(publicEffectPath)) {
    return null;
  }

  return readJson(publicEffectPath);
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
      if (!categories[cat]) {
        categories[cat] = [];
      }

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