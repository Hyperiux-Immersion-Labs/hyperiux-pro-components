#!/usr/bin/env node
// Self-contained end-to-end component workflow.
// See md/new-component-workflow.md for the design/process this implements.
// Deliberately does not import scripts/component-workflow.mjs or
// scripts/sanity-code-sync.mjs — everything needed lives in this file.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(process.env.HYPERIUX_WORKFLOW_ROOT || path.join(__dirname, ".."));
const DOCS_COMPONENTS_DIR = path.join(ROOT, "apps", "docs", "src", "components");
const REGISTRY_EFFECTS_DIR = path.join(ROOT, "registry", "effects");
const ROOT_INDEX_FILE = path.join(ROOT, "registry", "index.json");
const DOCS_PUBLIC_REGISTRY_DIR = path.join(ROOT, "apps", "docs", "public", "r");
const requireFromScript = createRequire(import.meta.url);

const COMMANDS = new Set(["preflight", "registry", "metadata", "sanity", "revert", "ship"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".json"]);
const EXCLUDED_FILE_RE = /(^Demo\.jsx$|\.demo\.jsx$|\.test\.[jt]sx?$|\.spec\.[jt]sx?$|^README\.md$|\.md$)/i;
const PACKAGE_IMPORT_IGNORE = new Set([
  "react", "react-dom", "next", "node:fs", "node:path", "node:process", "node:url",
]);
// Confirmed against actual usage across registry/effects/**/registry.json
// (337 range, 140 color, 78 checkbox, 32 select, 17 text) — not guessed.
const REMIXER_CONTROL_TYPES = new Set(["range", "color", "checkbox", "select", "text"]);
const NUMERIC_REMIXER_CONTROLS = new Set(["range"]);
const VALID_ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let cachedTs = null;

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const { command, options } = parseCli(process.argv.slice(2));

  if (!COMMANDS.has(command)) {
    fail(`Unknown command "${command}". Use one of: ${[...COMMANDS].join(", ")}`);
  }

  if (command === "preflight") return void (await runPreflight(options, { standalone: true }));
  if (command === "registry") return void (await runRegistry(options, { standalone: true }));
  if (command === "metadata") return void (await runMetadata(options, { standalone: true }));
  if (command === "sanity") return void (await runSanity(options, { standalone: true }));
  if (command === "revert") return void runRevert(options);
  if (command === "ship") return void (await runShip(options));
}

async function runShip(options) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  console.log(`component:ship — ${slug}\n`);

  const report = [];

  const preflight = await runPreflight(options, { standalone: false });
  report.push(["Phase 0 preflight", preflight]);
  if (!preflight.ok) return finishShip(slug, report, 1);

  const registryPhase = await runRegistry(options, { standalone: false });
  report.push(["Phase 1 registry", registryPhase]);
  if (!registryPhase.ok) return finishShip(slug, report, 1);

  const metadata = await runMetadata(options, { standalone: false });
  report.push(["Phase 2 metadata", metadata]);
  if (!metadata.ok) {
    await maybeOfferRevert(slug, options, registryPhase);
    return finishShip(slug, report, 1);
  }

  const sanity = await runSanity(options, { standalone: false });
  report.push(["Phase 3 sanity", sanity]);
  if (!sanity.ok) {
    await maybeOfferRevert(slug, options, registryPhase);
    return finishShip(slug, report, 1);
  }

  report.push(["Phase 4 rollback", { ok: true, summary: "not needed (no failures)" }]);
  finishShip(slug, report, 0);
}

function finishShip(slug, report, exitCode) {
  console.log(`\ncomponent:ship summary — ${slug}\n`);
  for (const [label, result] of report) {
    const mark = result.ok ? "✔" : "✖";
    console.log(`${label.padEnd(20)} ${mark} ${result.summary}`);
    for (const detail of result.details || []) console.log(`  ${detail}`);
  }
  if (exitCode !== 0) process.exitCode = exitCode;
}

async function maybeOfferRevert(slug, options, registryPhase) {
  if (!registryPhase.wrote) return;
  const answer = await promptYesNo(
    `\nA later phase failed after the registry was already updated for "${slug}". Revert the registry changes from this run? [y/N] `
  );
  if (!answer) {
    console.log("Not reverting. Fix the issue and re-run `component-ship.mjs registry` / `metadata` / `sanity` as needed.");
    return;
  }
  runRevert({ slug, yes: true });
}

// ---------------------------------------------------------------------------
// Phase 0 — Preflight checklist (+ auto-scaffold props/remixer)
// ---------------------------------------------------------------------------

async function runPreflight(options, { standalone }) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  const details = [];
  const errors = [];

  const docsDir = docsComponentDir(slug);
  const docsExists = fs.existsSync(docsDir);
  details.push(docsExists ? `✔ docs source at ${relative(docsDir)}` : `✖ missing docs source: ${relative(docsDir)}`);
  if (!docsExists) errors.push("docs component folder missing");

  let mainFile = null;
  if (docsExists) {
    mainFile = ["index.tsx", "index.jsx", "index.ts", "index.js"]
      .map((name) => path.join(docsDir, name))
      .find((candidate) => fs.existsSync(candidate));
    if (mainFile) {
      details.push(`✔ main file ${relative(mainFile)}`);
      const content = fs.readFileSync(mainFile, "utf8");
      if (!/export\s+default\s+(function|class|[A-Za-z_$])/.test(content)) {
        details.push("✖ no default export found in main file");
        errors.push("main file missing default export");
      }
      if (!/className/.test(content)) {
        details.push("⚠ main file does not reference a `className` prop");
      }
      const badImports = [...content.matchAll(/from\s+["'](@\/[^"']+)["']/g)];
      if (badImports.length) {
        details.push(`✖ uses @/ imports between own files: ${badImports.map((m) => m[1]).join(", ")}`);
        errors.push("@/ imports found between own files");
      }
    } else {
      details.push("✖ no index.tsx/jsx/ts/js main file found");
      errors.push("main file missing");
    }
  }

  const previewPage = path.join(ROOT, "apps", "docs", "src", "app", "(marketing)", "demo", slug, "page.js");
  details.push(fs.existsSync(previewPage) ? `✔ preview page at ${relative(previewPage)}` : `⚠ preview page missing: ${relative(previewPage)} (may be added after registry step)`);

  const existing = findComponent(slug);
  if (existing) {
    const registry = existing.registry;
    const requiredFields = ["name", "version", "type", "title", "description", "category", "tier", "dependencies", "previewUrl", "main", "exportName", "exportKind", "importPath", "target", "files"];
    const missingFields = requiredFields.filter((field) => registry[field] === undefined);
    if (missingFields.length) {
      details.push(`✖ registry.json missing fields: ${missingFields.join(", ")}`);
      errors.push("registry.json missing required fields");
    } else {
      details.push("✔ registry.json has all required fields");
    }

    const scaffolded = maybeScaffoldPropsAndRemixer(existing, mainFile, options, details);

    if (!Array.isArray(registry.props) || registry.props.length === 0) {
      if (!scaffolded && !options.noPropsOk) {
        details.push("✖ props array missing/empty (pass --no-props-ok if this component truly has none)");
        errors.push("props array missing");
      } else if (options.noPropsOk) {
        details.push("✔ props array empty, acknowledged via --no-props-ok");
      }
    }

    if (!Array.isArray(registry.changelog) || registry.changelog.length === 0) {
      details.push("✖ changelog array missing/empty");
      errors.push("changelog missing");
    } else {
      details.push(`✔ changelog has ${registry.changelog.length} entr${registry.changelog.length === 1 ? "y" : "ies"}`);
    }

    if (registry.tier === "free") {
      const mirrorRoot = resolveFreeRepoPath(options);
      if (!fs.existsSync(mirrorRoot)) {
        details.push(`✖ HARD FAIL: free-tier mirror repo not found at ${mirrorRoot}`);
        errors.push("free-tier mirror repo unreachable");
      } else {
        details.push(`✔ free-tier mirror repo found at ${relative(mirrorRoot)}`);
      }
    }
  } else {
    details.push("ℹ no existing registry.json yet — this will be a new component (registry metadata checks skipped until after `registry` phase)");
  }

  const ok = errors.length === 0;
  const result = { ok, summary: ok ? "all checks passed" : `${errors.length} issue(s) found`, details, errors };
  if (standalone) printStandaloneResult("preflight", slug, result);
  return result;
}

function maybeScaffoldPropsAndRemixer(existing, mainFile, options, details) {
  const registry = existing.registry;
  const needsProps = !Array.isArray(registry.props) || registry.props.length === 0;
  if (!needsProps || !mainFile || options.noPropsOk) return false;

  const content = fs.readFileSync(mainFile, "utf8");
  const detected = detectPropsFromSource(content);
  if (!detected.length) return false;

  registry.props = detected;
  registry._draft = true;
  const registryFile = path.join(existing.dir, "registry.json");
  writeJson(registryFile, registry);
  details.push(`⚠ auto-scaffolded ${detected.length} prop(s) into registry.json as "_draft": true — review before shipping`);
  return true;
}

function detectPropsFromSource(content) {
  // Matches: destructured function params, e.g. function X({ foo = 1, bar }: Props)
  // or export default function X({ foo, bar = "x" })
  const paramsMatch = content.match(/function\s+[A-Za-z_$][\w$]*\s*\(\s*\{([^}]*)\}/);
  if (!paramsMatch) return [];

  const raw = paramsMatch[1];
  const entries = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const props = [];

  for (const entry of entries) {
    const [nameWithDefault] = entry.split(":");
    const [rawName, rawDefault] = nameWithDefault.split("=").map((piece) => piece.trim());
    const name = rawName.replace(/\.\.\./, "").trim();
    if (!name || name === "className" || name === "children") continue;

    const defaultValue = rawDefault !== undefined ? coerceDefaultValue(rawDefault) : undefined;
    const type = inferTypeFromDefault(defaultValue);
    props.push({
      name,
      type,
      default: defaultValue,
      description: "",
      remixer: { control: controlForType(type), group: "General" },
    });
  }

  return props;
}

function coerceDefaultValue(raw) {
  const trimmed = raw.trim().replace(/[;,]$/, "");
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  const stringMatch = trimmed.match(/^["'`](.*)["'`]$/);
  if (stringMatch) return stringMatch[1];
  return trimmed;
}

function inferTypeFromDefault(value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "any";
}

function controlForType(type) {
  // Matches actual registry.json usage: checkbox/range/text/color/select
  // (checked directly against registry/effects/**/registry.json).
  if (type === "boolean") return "checkbox";
  if (type === "number") return "range";
  return "text";
}

// ---------------------------------------------------------------------------
// Phase 1 — Registry sync (create / update, mirrors public/r, root index, tarball)
// ---------------------------------------------------------------------------

async function runRegistry(options, { standalone }) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  const details = [];
  let wrote = false;

  try {
    const existing = findComponent(slug);
    if (!existing) {
      const category = requireOption(options, "category");
      const tier = requireOption(options, "tier");
      const title = requireOption(options, "title");
      const description = requireOption(options, "description");
      validateCategory(category);
      validateTier(tier);

      const docsDir = docsComponentDir(slug);
      requirePath(docsDir, `Docs component folder not found: ${relative(docsDir)}`);
      const registryDir = registryComponentDir(category, slug);
      if (fs.existsSync(registryDir) && !options.overwrite) {
        fail(`Registry folder already exists: ${relative(registryDir)}. Pass --overwrite to replace it.`);
      }

      const version = options.version || "1.0.0";
      const files = discoverDistributableFiles(docsDir);
      const dependencies = parseList(options.dependencies) ?? detectDependencies(files, docsDir);
      const mainFile = options.main || detectMainFileName(files);
      const exportInfo = detectExportInfo(path.join(docsDir, mainFile), options.exportName);

      const registryJson = makeRegistryJson({
        slug, version, title, description, category, tier, dependencies,
        date: options.date || today(),
        summary: options.summary || "Initial release",
        main: mainFile,
        exportName: options.exportName || exportInfo.exportName,
        exportKind: options.exportKind || exportInfo.exportKind,
        files: makeFileEntries(files, slug),
      });
      const packageJson = makePackageJson(registryJson, options.packageVersion || version);

      if (options.dryRun) {
        details.push(`dry-run: would create ${relative(registryDir)}`);
        return { ok: true, summary: "dry run — nothing written", details, wrote: false };
      }

      ensureFreeMirrorReady(tier, options);
      fs.rmSync(registryDir, { recursive: true, force: true });
      fs.mkdirSync(registryDir, { recursive: true });
      copyDistributableFiles(files, registryDir);
      writeJson(path.join(registryDir, "registry.json"), registryJson);
      writeJson(path.join(registryDir, "package.json"), packageJson);
      updateRootIndex(registryJson, category);
      syncFreeMirror(tier, registryDir, options);
      wrote = true;
      details.push(`created ${relative(registryDir)} @ v${version}`);
    } else {
      const docsDir = docsComponentDir(slug);
      requirePath(docsDir, `Docs component folder not found: ${relative(docsDir)}.`);

      const nextVersion = resolveSyncVersion(existing.registry.version, options);
      const shouldWriteChangelog = nextVersion !== existing.registry.version;
      if (shouldWriteChangelog && !options.summary) fail("Missing required --summary when changing the component version.");

      const files = discoverDistributableFiles(docsDir);
      const dependencies = parseList(options.dependencies) ?? detectDependencies(files, docsDir);
      const mainFileName = existing.registry.main || detectMainFileName(files);
      const exportInfo = detectExportInfo(path.join(docsDir, mainFileName), existing.registry.exportName);

      const registryJson = {
        ...existing.registry,
        version: nextVersion,
        dependencies,
        previewUrl: `/demo/${slug}`,
        importPath: `@/components/effects/${slug}`,
        target: `src/components/effects/${slug}`,
        main: mainFileName,
        exportName: options.exportName || existing.registry.exportName || exportInfo.exportName,
        exportKind: options.exportKind || existing.registry.exportKind || exportInfo.exportKind,
        files: makeFileEntries(files, slug),
        changelog: shouldWriteChangelog
          ? prependChangelog(existing.registry.changelog, {
              version: nextVersion,
              date: options.date || today(),
              summary: options.summary || "Synced component files",
              breaking: options.breaking ?? options.bump === "major",
            })
          : existing.registry.changelog,
      };
      delete registryJson._draft;
      const packageJson = makePackageJson(registryJson, options.packageVersion || nextVersion, readJsonIfExists(path.join(existing.dir, "package.json")));

      if (options.dryRun) {
        details.push(`dry-run: would sync ${relative(existing.dir)} -> v${nextVersion}`);
        return { ok: true, summary: "dry run — nothing written", details, wrote: false };
      }

      ensureFreeMirrorReady(registryJson.tier, options);
      copyDistributableFiles(files, existing.dir);
      writeJson(path.join(existing.dir, "registry.json"), registryJson);
      writeJson(path.join(existing.dir, "package.json"), packageJson);
      updateRootIndex(registryJson, existing.category);
      syncFreeMirror(registryJson.tier, existing.dir, options);
      wrote = true;
      details.push(`synced ${relative(existing.dir)}: v${existing.registry.version} -> v${nextVersion}`);
    }

    if (!options.skipBuild) {
      details.push("running build:registry (apps/docs + root)...");
      execFileSync("npm", ["--prefix", "apps/docs", "run", "build:registry"], { cwd: ROOT, stdio: "inherit" });
      execFileSync("npm", ["run", "build:registry"], { cwd: ROOT, stdio: "inherit" });
      details.push("build:registry complete — public/r/{slug}.json and public/r/index.json regenerated");
    }

    const result = { ok: true, summary: wrote ? "registry synced" : "no changes needed", details, wrote };
    if (standalone) printStandaloneResult("registry", slug, result);
    return result;
  } catch (error) {
    const result = { ok: false, summary: error.message, details, wrote };
    if (standalone) printStandaloneResult("registry", slug, result);
    return result;
  }
}

function detectMainFileName(files) {
  const preferred = ["index.tsx", "index.ts", "index.jsx", "index.js"];
  const found = preferred.find((name) => files.some((file) => file.relativePath === name));
  return found || files[0]?.relativePath;
}

// ---------------------------------------------------------------------------
// Phase 2 — Metadata verification (props / remixer / changelog / free payload)
// ---------------------------------------------------------------------------

async function runMetadata(options, { standalone }) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  const details = [];
  const errors = [];

  const existing = findComponent(slug);
  if (!existing) {
    const result = { ok: false, summary: `no registry entry found for "${slug}"`, details, errors: ["no registry entry"] };
    if (standalone) printStandaloneResult("metadata", slug, result);
    return result;
  }
  const registry = existing.registry;

  // Props table
  const props = Array.isArray(registry.props) ? registry.props : [];
  if (!props.length && !options.noPropsOk) {
    details.push("✖ props array missing/empty");
    errors.push("props missing");
  } else {
    let propIssues = 0;
    for (const prop of props) {
      const missing = ["name", "type"].filter((field) => prop[field] === undefined);
      if (prop.default === undefined && prop.required !== true) missing.push("default (or required: true)");
      if (prop.description === undefined || prop.description === "") missing.push("description");
      if (missing.length) {
        propIssues += 1;
        details.push(`⚠ prop "${prop.name || "?"}" missing: ${missing.join(", ")}`);
      }
    }
    details.push(propIssues ? `✖ ${propIssues}/${props.length} prop(s) incomplete` : `✔ props (${props.length}) all have name/type/default-or-required/description`);
    if (propIssues) errors.push("incomplete props");
    if (registry._draft) {
      details.push("⚠ registry.json still marked \"_draft\": true — auto-scaffolded props/remixer need human review");
      errors.push("draft props unreviewed");
    }
  }

  // Remixer
  const remixerControls = props.filter((prop) => prop.remixer && prop.remixer.control);
  let remixerIssues = 0;
  for (const prop of remixerControls) {
    if (!REMIXER_CONTROL_TYPES.has(prop.remixer.control)) {
      remixerIssues += 1;
      details.push(`✖ prop "${prop.name}" has unknown remixer.control "${prop.remixer.control}"`);
    }
    if (NUMERIC_REMIXER_CONTROLS.has(prop.remixer.control)) {
      const numericMissing = ["min", "max", "step"].filter((field) => prop.remixer[field] === undefined);
      if (numericMissing.length) {
        remixerIssues += 1;
        details.push(`✖ prop "${prop.name}" (${prop.remixer.control}) missing: ${numericMissing.join(", ")}`);
      }
    }
  }
  if (registry.remixer && registry.remixer.enabled !== false && remixerControls.length === 0) {
    remixerIssues += 1;
    details.push("✖ remixer.enabled is true but no props have a remixer control — panel would render empty");
  }
  details.push(remixerIssues ? `✖ remixer: ${remixerIssues} issue(s)` : `✔ remixer (${remixerControls.length} control(s)) verified`);
  if (remixerIssues) errors.push("remixer issues");

  // Changelog
  const changelog = Array.isArray(registry.changelog) ? registry.changelog : [];
  if (!changelog.length) {
    details.push("✖ changelog empty");
    errors.push("changelog empty");
  } else {
    const top = changelog[0];
    const versions = changelog.map((entry) => entry.version);
    const duplicates = versions.filter((v, i) => versions.indexOf(v) !== i);
    const badDates = changelog.filter((entry) => !VALID_ISO_DATE_RE.test(entry.date || "") || new Date(entry.date) > new Date());
    if (top.version !== registry.version) {
      details.push(`✖ changelog top version "${top.version}" !== registry.json version "${registry.version}"`);
      errors.push("changelog/version mismatch");
    }
    if (duplicates.length) {
      details.push(`✖ duplicate changelog versions: ${[...new Set(duplicates)].join(", ")}`);
      errors.push("duplicate changelog versions");
    }
    if (badDates.length) {
      details.push(`✖ invalid/future changelog dates: ${badDates.map((e) => e.date).join(", ")}`);
      errors.push("invalid changelog dates");
    }
    if (!errors.some((e) => e.includes("changelog"))) details.push(`✔ changelog (${changelog.length} entries) verified`);
  }

  // Free-tier public payload
  if (registry.tier === "free") {
    const publicFile = path.join(DOCS_PUBLIC_REGISTRY_DIR, `${slug}.json`);
    const publicJson = readJsonIfExists(publicFile);
    if (!publicJson) {
      details.push(`✖ missing ${relative(publicFile)} — run \`registry\` phase first`);
      errors.push("public JSON missing");
    } else {
      const missingContent = (publicJson.files || []).filter((file) => !("content" in file) || !file.content);
      if (missingContent.length) {
        details.push(`✖ free-tier public JSON missing file content for: ${missingContent.map((f) => f.path).join(", ")}`);
        errors.push("free tier missing embedded content");
      } else {
        details.push(`✔ free-tier public JSON embeds content for all ${publicJson.files?.length || 0} file(s)`);
      }
    }
  } else if (registry.tier === "pro") {
    const publicFile = path.join(DOCS_PUBLIC_REGISTRY_DIR, `${slug}.json`);
    const publicJson = readJsonIfExists(publicFile);
    if (publicJson?.files?.some((file) => "content" in file)) {
      details.push("✖ pro-tier public JSON still contains file content (should be stripped)");
      errors.push("pro tier leaking content");
    } else {
      details.push("✔ pro-tier public JSON has no embedded file content, as expected");
    }
  }

  const ok = errors.length === 0;
  const result = { ok, summary: ok ? "props/remixer/changelog verified" : `${errors.length} issue(s) found`, details, errors };
  if (standalone) printStandaloneResult("metadata", slug, result);
  return result;
}

// ---------------------------------------------------------------------------
// Phase 3 — Sanity content sync
// ---------------------------------------------------------------------------

async function runSanity(options, { standalone }) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  const details = [];

  try {
    const existing = findComponent(slug);
    if (!existing) fail(`No registry entry found for "${slug}".`);

    const registryFiles = readRegistryCodeFiles(existing);
    const document = await fetchSanityDocument(existing.registry, options);
    if (!document) {
      const result = { ok: false, summary: `no Sanity effectContent document found for ${existing.category}/${slug}`, details };
      if (standalone) printStandaloneResult("sanity", slug, result);
      return result;
    }

    const plan = buildSanityPlan({ registryFiles, document, createMissing: Boolean(options.createMissing) });
    details.push(`sanity document: ${document._id}`);
    details.push(`changed blocks: ${plan.changed.length}`);
    details.push(`unchanged blocks: ${plan.unchanged.length}`);
    details.push(`missing (no sanity block yet): ${plan.missing.length}`);
    details.push(`stale (no matching registry file): ${plan.stale.length}`);
    if (plan.errors.length) details.push(`errors: ${plan.errors.join("; ")}`);

    if (plan.errors.length) {
      const result = { ok: false, summary: "plan has errors — see details", details };
      if (standalone) printStandaloneResult("sanity", slug, result);
      return result;
    }

    if (options.dryRun || !options.yes) {
      const result = { ok: true, summary: "dry run — pass --yes to apply", details };
      if (standalone) printStandaloneResult("sanity", slug, result);
      return result;
    }

    if (!plan.changed.length && !plan.creatable.length) {
      const result = { ok: true, summary: "no Sanity changes needed", details };
      if (standalone) printStandaloneResult("sanity", slug, result);
      return result;
    }

    const token = await resolveSanityToken(options);
    const nextBody = buildNextSanityBody(document, plan, options);
    await patchSanityBody(document._id, nextBody, token, options, document);
    details.push(`synced ${plan.changed.length + plan.created.length} code block(s) to draft ${document._id}`);
    details.push("NOT published — publish manually in Sanity Studio when ready");

    const result = { ok: true, summary: "sanity draft updated", details };
    if (standalone) printStandaloneResult("sanity", slug, result);
    return result;
  } catch (error) {
    const result = { ok: false, summary: error.message, details };
    if (standalone) printStandaloneResult("sanity", slug, result);
    return result;
  }
}

function readRegistryCodeFiles(existing) {
  const files = Array.isArray(existing.registry.files) ? existing.registry.files : [];
  const codeFiles = files
    .filter((file) => file.type !== "registry:asset")
    .filter((file) => CODE_EXTENSIONS.has(path.extname(file.path || "")))
    .map((file) => {
      const sourcePath = path.join(existing.dir, file.path);
      if (!fs.existsSync(sourcePath)) fail(`Registry file missing: ${relative(sourcePath)}`);
      return makeCodeFileEntry(file.path, fs.readFileSync(sourcePath, "utf8"));
    });
  if (!codeFiles.length) fail(`No code files found in registry.json for "${existing.registry.name}".`);
  return codeFiles;
}

function makeCodeFileEntry(relativePath, rawContent) {
  const ext = path.extname(relativePath);
  const isTsLike = ext === ".tsx" || ext === ".ts";
  return {
    path: slash(relativePath),
    filename: path.basename(relativePath),
    filenameNoExt: path.basename(relativePath, ext),
    // .tsx/.ts source is kept as-is for tsxCode; `code` gets the same
    // source with TS types stripped (jsx: "preserve" keeps JSX syntax).
    content: isTsLike ? stripTypesToJsx(rawContent) : rawContent,
    tsxCode: isTsLike ? rawContent : undefined,
  };
}

function stripTypesToJsx(source) {
  const ts = loadTypeScript();
  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
    },
  });
  return result.outputText.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function loadTypeScript() {
  if (cachedTs) return cachedTs;
  const tsEntry = path.join(ROOT, "apps/docs/node_modules/typescript");
  cachedTs = requireFromScript(tsEntry);
  return cachedTs;
}

function buildSanityPlan({ registryFiles, document, createMissing }) {
  const body = Array.isArray(document.body) ? document.body : [];
  const blocks = body
    .map((block, index) => ({ ...block, index }))
    .filter((block) => block?._type === "effectCodeBlock");
  const matchableBlocks = blocks.filter((block) => block.filename);
  const registryMatches = new Map();
  const changed = [];
  const unchanged = [];
  const stale = [];
  const errors = [];

  for (const block of matchableBlocks) {
    const match = matchRegistryFile(block.filename, registryFiles);
    if (match.error) {
      errors.push(`body[${block.index}] filename "${block.filename}": ${match.error}`);
      continue;
    }
    if (!match.file) {
      stale.push(block);
      continue;
    }
    registryMatches.set(match.file.path, true);
    const codeMatches = (block.code || "") === match.file.content;
    const tsxMatches = match.file.tsxCode === undefined || (block.tsxCode || "") === match.file.tsxCode;
    const item = { block, file: match.file, nextCode: match.file.content };
    (codeMatches && tsxMatches ? unchanged : changed).push(item);
  }

  const unclaimedFiles = registryFiles.filter((file) => !registryMatches.has(file.path));
  const USAGE_CODE_FILENAMES = new Set(["page", "layout"]);
  const stalePairingCandidates = stale.filter((block) => !USAGE_CODE_FILENAMES.has(block.filename));
  if (stalePairingCandidates.length === 1 && unclaimedFiles.length === 1) {
    const block = stalePairingCandidates[0];
    const file = unclaimedFiles[0];
    stale.splice(stale.indexOf(block), 1);
    registryMatches.set(file.path, true);
    const codeMatches = (block.code || "") === file.content;
    const tsxMatches = file.tsxCode === undefined || (block.tsxCode || "") === file.tsxCode;
    (codeMatches && tsxMatches ? unchanged : changed).push({ block, file, nextCode: file.content });
  }

  const missing = registryFiles.filter((file) => !registryMatches.has(file.path));
  const creatable = createMissing ? missing : [];

  return { registryFiles, document, blocks, changed, unchanged, missing, creatable, created: [], stale, errors };
}

function matchRegistryFile(filename, registryFiles) {
  const normalized = slash(filename).trim();
  const exact = registryFiles.find((file) => file.path === normalized);
  if (exact) return { file: exact };

  const basenameMatches = registryFiles.filter((file) => path.basename(file.path) === normalized);
  if (basenameMatches.length === 1) return { file: basenameMatches[0] };
  if (basenameMatches.length > 1) return { error: `ambiguous basename match [${basenameMatches.map((f) => f.path).join(", ")}]` };

  const noExtMatches = registryFiles.filter((file) => file.filenameNoExt === normalized);
  if (noExtMatches.length === 1) return { file: noExtMatches[0] };
  if (noExtMatches.length > 1) return { error: `ambiguous filename match [${noExtMatches.map((f) => f.path).join(", ")}]` };

  return { file: null };
}

function buildNextSanityBody(document, plan, options) {
  const body = Array.isArray(document.body) ? structuredClone(document.body) : [];
  const changedByIndex = new Map(plan.changed.map((item) => [item.block.index, item]));

  for (const [index, item] of changedByIndex) {
    const nextBlock = { ...body[index], code: item.nextCode, filename: body[index].filename || item.file.filenameNoExt };
    if (item.file.tsxCode !== undefined) nextBlock.tsxCode = item.file.tsxCode;
    body[index] = nextBlock;
  }

  if (options.createMissing) {
    let insertAt = -1;
    body.forEach((block, index) => { if (block?._type === "effectCodeBlock") insertAt = index; });
    if (insertAt === -1) insertAt = body.length - 1;
    const createdBlocks = plan.creatable.map((file) => ({
      _type: "effectCodeBlock",
      _key: makeKey(`code-${file.path}`),
      filename: file.filenameNoExt,
      code: file.content,
      ...(file.tsxCode !== undefined ? { tsxCode: file.tsxCode } : {}),
    }));
    body.splice(insertAt + 1, 0, ...createdBlocks);
    plan.created = createdBlocks;
  }

  return body;
}

async function fetchSanityDocument(registry, options) {
  if (options.fixture) return readJson(path.resolve(ROOT, options.fixture));

  const client = getSanityConfig(options.tokenOverride);
  const sanitySlug = options.sanitySlug || registry.name;
  const sanityCategory = options.sanityCategory || registry.category;
  const published = await queryFirstSanityDocument(client, {
    query: `*[_type == "effectContent" && effectSlug == $slug && categorySlug == $category && !(_id in path("drafts.**"))]{...}`,
    params: { "$slug": JSON.stringify(sanitySlug), "$category": JSON.stringify(sanityCategory) },
    context: `${sanityCategory}/${sanitySlug}`,
  });

  if (published) {
    const draftId = `drafts.${published._id}`;
    const draft = await queryFirstSanityDocument(client, {
      query: `*[_id == $id]{...}`,
      params: { "$id": JSON.stringify(draftId) },
      context: draftId,
    });
    return { ...(draft || published), _id: draftId };
  }

  const draftOnly = await queryFirstSanityDocument(client, {
    query: `*[_type == "effectContent" && effectSlug == $slug && categorySlug == $category && _id in path("drafts.**")]{...}`,
    params: { "$slug": JSON.stringify(sanitySlug), "$category": JSON.stringify(sanityCategory) },
    context: `${sanityCategory}/${sanitySlug} (draft-only)`,
  });
  return draftOnly || null;
}

async function queryFirstSanityDocument(client, { query, params, context }) {
  const url = new URL(`${client.baseUrl}/data/query/${client.dataset}`);
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const response = await fetchSanity(url, { headers: { Authorization: `Bearer ${client.token}` } }, "query Sanity document");
  if (!response.ok) {
    const body = await response.text();
    fail(`Sanity query failed (${response.status}): ${body.slice(0, 500)}`);
  }
  const data = await response.json();
  const results = data.result || [];
  if (results.length > 1) fail(`Sanity query returned ${results.length} documents for ${context}. Resolve duplicates before syncing.`);
  return results[0] || null;
}

async function patchSanityBody(documentId, body, token, options, baseDoc) {
  if (options.fixture) {
    const fixturePath = path.resolve(ROOT, options.fixture);
    const fixture = readJson(fixturePath);
    writeJson(fixturePath, { ...fixture, body });
    return;
  }

  const client = getSanityConfig(token);
  const url = `${client.baseUrl}/data/mutate/${client.dataset}`;
  const draftDoc = { ...baseDoc, _id: documentId, body };
  delete draftDoc._rev;

  const response = await fetchSanity(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${client.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ createOrReplace: draftDoc }] }),
  }, "patch Sanity document");

  if (!response.ok) {
    const responseBody = await response.text();
    fail(`Sanity mutation failed (${response.status}): ${responseBody.slice(0, 500)}`);
  }
}

async function resolveSanityToken(options) {
  if (options.token) return options.token;
  if (process.env.NEXT_PUBLIC_SANITY_VIEWER_TOKEN) return process.env.NEXT_PUBLIC_SANITY_VIEWER_TOKEN;
  return promptHidden("Sanity Viewer Token (write-enabled) — not stored, used for this run only: ");
}

function getSanityConfig(tokenOverride) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = tokenOverride || process.env.NEXT_PUBLIC_SANITY_VIEWER_TOKEN;
  const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";
  const baseUrl = process.env.HYPERIUX_SANITY_API_BASE || (projectId ? `https://${projectId}.api.sanity.io/v${apiVersion}` : "");

  if (!projectId && !process.env.HYPERIUX_SANITY_API_BASE) fail("NEXT_PUBLIC_SANITY_PROJECT_ID is required.");
  if (!dataset) fail("NEXT_PUBLIC_SANITY_DATASET is required.");
  if (!token) fail("Sanity token is required (NEXT_PUBLIC_SANITY_VIEWER_TOKEN or interactive prompt).");

  return { projectId, dataset, token, baseUrl };
}

async function fetchSanity(url, options, action) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error.cause;
    const details = [error.message, cause?.code, cause?.message, cause?.hostname ? `host=${cause.hostname}` : null].filter(Boolean).join(" | ");
    fail(`Could not ${action}: ${details}`);
  }
}

// ---------------------------------------------------------------------------
// Phase 4 — Revert
// ---------------------------------------------------------------------------

function runRevert(options) {
  const slug = requireOption(options, "slug");
  validateSlug(slug);
  const existing = findComponent(slug);
  if (!existing) fail(`No registry entry found for "${slug}".`);

  const distFiles = listDistFilesForSlug(slug);
  const paths = [
    existing.dir,
    ROOT_INDEX_FILE,
    path.join(DOCS_PUBLIC_REGISTRY_DIR, `${slug}.json`),
    path.join(DOCS_PUBLIC_REGISTRY_DIR, "index.json"),
    ...distFiles,
    path.join(ROOT, "registry", "dist", "registry-index.json"),
  ].filter((file) => fs.existsSync(file));

  const trackedPaths = paths.filter((file) => isGitTracked(file));
  if (!trackedPaths.length) {
    console.log(`No tracked revert paths found for ${slug}.`);
    return;
  }

  console.log("component:ship revert");
  console.log("\ntracked paths to restore from git:");
  console.log(trackedPaths.map(relative).join("\n"));

  if (!options.yes) {
    console.log("\nNo files changed. Re-run with --yes to apply this restore.");
    return;
  }

  execFileSync("git", ["restore", "--", ...trackedPaths.map(relative)], { cwd: ROOT, stdio: "inherit" });
  console.log(`Reverted tracked distribution files for ${slug}.`);
}

function listDistFilesForSlug(slug) {
  const distDir = path.join(ROOT, "registry", "dist");
  if (!fs.existsSync(distDir)) return [];
  return fs.readdirSync(distDir)
    .filter((file) => file.startsWith(`hyperiux-${slug}-`) && file.endsWith(".tgz"))
    .map((file) => path.join(distDir, file));
}

function isGitTracked(file) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", relative(file)], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Shared registry helpers
// ---------------------------------------------------------------------------

function findComponent(slug) {
  for (const category of listCategories()) {
    const dir = registryComponentDir(category, slug);
    const registryFile = path.join(dir, "registry.json");
    if (fs.existsSync(registryFile)) return { category, dir, registry: readJson(registryFile) };
  }
  return null;
}

function listCategories() {
  if (!fs.existsSync(REGISTRY_EFFECTS_DIR)) return [];
  return fs.readdirSync(REGISTRY_EFFECTS_DIR)
    .filter((entry) => !entry.startsWith("_"))
    .filter((entry) => fs.statSync(path.join(REGISTRY_EFFECTS_DIR, entry)).isDirectory())
    .sort();
}

function discoverDistributableFiles(sourceDir) {
  const allFiles = walkFiles(sourceDir)
    .map((filePath) => ({
      absolutePath: filePath,
      relativePath: slash(path.relative(sourceDir, filePath)),
      extension: path.extname(filePath),
    }))
    .filter((file) => SOURCE_EXTENSIONS.has(file.extension))
    .filter((file) => !EXCLUDED_FILE_RE.test(path.basename(file.relativePath)));

  const INDEX_FILES = new Set(["index.tsx", "index.ts", "index.jsx", "index.js"]);
  const sorted = allFiles.sort((a, b) => {
    if (INDEX_FILES.has(a.relativePath) && !INDEX_FILES.has(b.relativePath)) return -1;
    if (INDEX_FILES.has(b.relativePath) && !INDEX_FILES.has(a.relativePath)) return 1;
    return a.relativePath.localeCompare(b.relativePath);
  });
  if (!sorted.length) fail(`No distributable .ts, .tsx, .js, .jsx, or .css files found in ${relative(sourceDir)}`);
  return sorted;
}

function detectDependencies(files, sourceDir) {
  const deps = new Set();
  for (const file of files.filter((entry) => entry.extension !== ".css")) {
    const content = fs.readFileSync(path.join(sourceDir, file.relativePath), "utf8");
    for (const specifier of findImportSpecifiers(content)) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) continue;
      const packageName = specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];
      if (!PACKAGE_IMPORT_IGNORE.has(packageName)) deps.add(packageName);
    }
  }
  return [...deps].sort();
}

function findImportSpecifiers(content) {
  const specifiers = [];
  const importExportRe = /\b(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRe = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = importExportRe.exec(content))) specifiers.push(match[1]);
  while ((match = dynamicImportRe.exec(content))) specifiers.push(match[1]);
  return specifiers;
}

function detectExportInfo(mainFile, explicitName) {
  requirePath(mainFile, `Main file not found: ${relative(mainFile)}`);
  const content = fs.readFileSync(mainFile, "utf8");
  const defaultNamed = content.match(/export\s+default\s+(?:function|class)\s+([A-Za-z_$][\w$]*)/);
  const defaultIdentifier = content.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;/);
  if (defaultNamed) return { exportName: defaultNamed[1], exportKind: "default" };
  if (defaultIdentifier) return { exportName: defaultIdentifier[1], exportKind: "default" };
  const named = [...content.matchAll(/export\s+(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
  if (explicitName && named.includes(explicitName)) return { exportName: explicitName, exportKind: "named" };
  if (named.length === 1) return { exportName: named[0], exportKind: "named" };
  if (/export\s+default\b/.test(content)) return { exportName: explicitName, exportKind: "default" };
  fail(`Unable to detect export from ${relative(mainFile)}. Pass --export-name and --export-kind.`);
}

function makeRegistryJson({ slug, version, title, description, category, tier, dependencies, date, summary, main, exportName, exportKind, files }) {
  return {
    name: slug,
    version,
    changelog: [{ version, date, summary, breaking: false }],
    type: "registry:component",
    title,
    description,
    category,
    dependencies,
    registryDependencies: [],
    previewUrl: `/demo/${slug}`,
    tier,
    subfolder: true,
    main,
    exportName,
    exportKind,
    importPath: `@/components/effects/${slug}`,
    target: `src/components/effects/${slug}`,
    files,
    props: [],
    remixer: { enabled: false, layout: "panel", copyCode: { includeOnlyPublicProps: true } },
  };
}

function makePackageJson(registryJson, version, existing = {}) {
  const files = [...new Set([
    registryJson.main,
    ...(registryJson.files || []).filter((file) => file.type !== "registry:asset").map((file) => file.path),
    "registry.json",
  ])];
  return {
    ...existing,
    name: `@hyperiux/${registryJson.name}`,
    version,
    description: registryJson.description,
    main: registryJson.main,
    files,
    keywords: [registryJson.category || "effect", "hyperiux"],
    dependencies: Object.fromEntries((registryJson.dependencies || []).map((dependency) => [dependency, existing.dependencies?.[dependency] || "*"])),
  };
}

function makeFileEntries(files, slug) {
  return files.map((file) => ({ path: file.relativePath, target: `src/components/effects/${slug}/${file.relativePath}` }));
}

function prependChangelog(changelog = [], entry) {
  return [entry, ...changelog.filter((item) => item.version !== entry.version)];
}

function resolveSyncVersion(currentVersion, options) {
  if (options.versionBump === false) {
    if (options.version || options.bump) fail("--no-version-bump cannot be combined with --version or --bump.");
    return currentVersion;
  }
  if (!options.version && !options.bump) fail("Pass --bump patch|minor|major, --version x.y.z, or --no-version-bump.");
  if (options.version) {
    validateVersion(options.version);
    return options.version;
  }
  if (!["patch", "minor", "major"].includes(options.bump)) fail("--bump must be patch, minor, or major.");
  return bumpVersion(currentVersion || "1.0.0", options.bump);
}

function bumpVersion(version, bump) {
  const [major, minor, patch] = version.split(".").map((part) => Number.parseInt(part, 10));
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function updateRootIndex(registryJson, category) {
  const entries = readRootIndex().filter((entry) => entry.name !== registryJson.name);
  entries.push({ ...registryJson, registryPath: `registry/effects/${category}/${registryJson.name}/registry.json` });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  writeJson(ROOT_INDEX_FILE, entries);
}

function readRootIndex() {
  return readJsonIfExists(ROOT_INDEX_FILE) || [];
}

function copyDistributableFiles(files, destDir) {
  for (const file of files) {
    const dest = path.join(destDir, file.relativePath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file.absolutePath, dest);
  }
}

function resolveFreeRepoPath(options) {
  return path.resolve(ROOT, options.freeRepoPath || "../hyperiux-components");
}

function ensureFreeMirrorReady(tier, options) {
  if (tier !== "free" || options.skipFreeMirror) return;
  const repoPath = resolveFreeRepoPath(options);
  requirePath(repoPath, `Free-tier mirror repo not found: ${repoPath}. Pass --skip-free-mirror to skip intentionally.`);
}

function syncFreeMirror(tier, registryDir, options) {
  if (tier !== "free" || options.skipFreeMirror) return;
  const repoPath = resolveFreeRepoPath(options);
  const registryJson = readJson(path.join(registryDir, "registry.json"));
  const destDir = path.join(repoPath, "registry", "effects", registryJson.category, registryJson.name);
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.cpSync(registryDir, destDir, { recursive: true });
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(entryPath);
    if (entry.isFile()) return [entryPath];
    return [];
  });
}

function docsComponentDir(slug) {
  return path.join(DOCS_COMPONENTS_DIR, slug);
}

function registryComponentDir(category, slug) {
  return path.join(REGISTRY_EFFECTS_DIR, category, slug);
}

// ---------------------------------------------------------------------------
// CLI / IO utilities
// ---------------------------------------------------------------------------

function parseCli(argv) {
  const command = argv[0];
  const rest = argv.slice(1);
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith("--")) fail(`Unexpected argument "${arg}"`);
    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    if (rawKey.startsWith("no-")) {
      options[toCamelCase(rawKey.slice(3))] = false;
      continue;
    }
    const key = toCamelCase(rawKey);
    const next = rest[index + 1];
    if (inlineValue !== undefined) {
      options[key] = coerceValue(inlineValue);
    } else if (!next || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = coerceValue(next);
      index += 1;
    }
  }
  return { command, options };
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function coerceValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function printStandaloneResult(phase, slug, result) {
  console.log(`component:ship ${phase} — ${slug}\n`);
  for (const detail of result.details || []) console.log(detail);
  console.log(`\n${result.ok ? "PASSED" : "FAILED"}: ${result.summary}`);
  if (!result.ok) process.exitCode = 1;
}

function promptYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    process.stdout.write(question);
    let value = "";
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "") {
        stdin.removeListener("data", onData);
        stdin.setRawMode?.(false);
        process.stdout.write("\n");
        rl.close();
        resolve(value.trim());
        return;
      }
      if (char === "") process.exit(1);
      if (char === "") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

function makeKey(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 48);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function parseList(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slash(value) {
  return value.split(path.sep).join("/");
}

function relative(file) {
  return slash(path.relative(ROOT, file)) || ".";
}

function requireOption(options, key) {
  if (options[key] === undefined || options[key] === "") fail(`Missing required --${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.`);
  return options[key];
}

function requirePath(file, message) {
  if (!fs.existsSync(file)) fail(message);
}

function validateSlug(slug) {
  if (!SLUG_RE.test(slug)) fail(`Invalid slug "${slug}". Use lowercase hyphenated names only.`);
}

function validateCategory(category) {
  if (!listCategories().includes(category)) fail(`Invalid category "${category}". Existing categories: ${listCategories().join(", ")}`);
}

function validateTier(tier) {
  if (!["free", "pro"].includes(tier)) fail('--tier must be "free" or "pro".');
}

function validateVersion(version) {
  if (!VERSION_RE.test(version)) fail(`Invalid semver version "${version}".`);
}

function fail(message) {
  throw new Error(message);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
