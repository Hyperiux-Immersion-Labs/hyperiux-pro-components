// Checks src/app/site.css scans every src/components folder that site pages import
// (directly or through other files). Site pages are all of src except the effect demos,
// the template demos and src/components itself.
//
//   node scripts/check-site-css-sources.mjs
//
// Exits 1 if a reached folder is missing, since a class it uses would be absent there.
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const COMPONENTS = path.join(SRC, "components");
const EXCLUDED = ["app/(marketing)/demo", "app/(marketing)/template-demo"].map((d) => path.join(SRC, d));
const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs"];

const isExcluded = (file) => EXCLUDED.some((dir) => file.startsWith(dir + path.sep));
const componentFolder = (file) =>
  file.startsWith(COMPONENTS + path.sep) ? file.slice(COMPONENTS.length + 1).split(path.sep)[0] : null;

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  const candidates = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => path.join(base, "index" + e))];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return EXTENSIONS.includes(path.extname(full)) ? [full] : [];
  });
}

function reachedFolders(start) {
  const seen = new Set();
  const reached = new Set();
  const stack = [...start];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = fs.readFileSync(file, "utf8");
    for (const [, spec] of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s+|require\s*\(\s*)["']([^"']+)["']/g)) {
      const target = resolveImport(file, spec);
      if (!target || isExcluded(target)) continue;
      const folder = componentFolder(target);
      if (folder) reached.add(folder);
      stack.push(target);
    }
  }
  return reached;
}

function check(sheet, start) {
  const reached = reachedFolders(start);
  const css = fs.readFileSync(path.join(SRC, "app", sheet), "utf8");
  const scanned = new Set([...css.matchAll(/@source "\.\.\/components\/([^"]+)"/g)].map((m) => m[1]));
  const missing = [...reached].filter((f) => !scanned.has(f)).sort();
  const unused = [...scanned].filter((f) => !reached.has(f)).sort();
  console.log(`${sheet}: its pages reach ${reached.size} component folders.`);
  if (unused.length) console.log(`  Scanned but no longer reached (safe to remove): ${unused.join(", ")}`);
  if (missing.length) {
    console.error(`  Missing from src/app/${sheet}:\n${missing.map((f) => `    @source "../components/${f}";`).join("\n")}`);
    return false;
  }
  console.log("  All scanned.");
  return true;
}

const siteStart = listFiles(SRC).filter((f) => !isExcluded(f) && !componentFolder(f) && !/\.test\./.test(f));
if (!check("site.css", siteStart)) process.exit(1);
