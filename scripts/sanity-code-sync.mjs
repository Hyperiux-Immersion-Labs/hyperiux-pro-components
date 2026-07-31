#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(path.join(__dirname, ".."));
const COMMANDS = new Set(["diff", "sync"]);
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".json"]);

export function parseCli(argv) {
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

export async function run(argv = process.argv.slice(2)) {
  const { command, options } = parseCli(argv);

  if (!COMMANDS.has(command)) {
    fail(`Unknown command "${command}". Use one of: ${[...COMMANDS].join(", ")}`);
  }

  const plan = await createSanityCodePlan(options);
  printPlan(command, plan, options);

  if (command === "diff" || options.dryRun || !options.yes) {
    if (command === "sync" && !options.yes) {
      console.log("\nNo Sanity changes written. Re-run with --yes to apply this sync.");
    }
    return plan;
  }

  if (!plan.document?._id) fail("Cannot sync because no Sanity document was found.");
  if (plan.errors.length) fail(`Cannot sync because the plan has errors:\n- ${plan.errors.join("\n- ")}`);
  if (!plan.changed.length && !plan.creatable.length) {
    console.log("\nNo Sanity changes needed.");
    return plan;
  }

  const nextBody = buildNextBody(plan, options);
  await patchSanityBody(plan.document._id, nextBody, options);
  console.log(`\nSynced ${plan.changed.length + plan.created.length} code block(s) to Sanity.`);
  return plan;
}

export async function createSanityCodePlan(options) {
  const slug = requireOption(options, "slug");
  const registry = readRegistryForSlug(slug);
  const registryFiles = readRegistryCodeFiles(registry);
  const document = await fetchSanityDocument(registry, options);

  if (!document) {
    return {
      slug,
      registry,
      registryFiles,
      document: null,
      blocks: [],
      changed: [],
      unchanged: [],
      missing: registryFiles,
      creatable: options.createMissing ? registryFiles : [],
      created: [],
      stale: [],
      skipped: [],
      errors: [`No Sanity effectContent document found for ${registry.category}/${slug}.`],
    };
  }

  return buildPlanFromDocument({
    slug,
    registry,
    registryFiles,
    document,
    createMissing: Boolean(options.createMissing),
  });
}

export function buildPlanFromDocument({ slug, registry, registryFiles, document, createMissing = false }) {
  const body = Array.isArray(document.body) ? document.body : [];
  const blocks = collectCodeBlocks(body);
  const skipped = blocks.filter((block) => !block.filename);
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
    const nextLanguage = block.language || inferLanguage(match.file.path);
    const item = {
      block,
      file: match.file,
      nextCode: match.file.content,
      nextLanguage,
    };

    if ((block.code || "") === match.file.content && (block.language || nextLanguage) === nextLanguage) {
      unchanged.push(item);
    } else {
      changed.push(item);
    }
  }

  const missing = registryFiles.filter((file) => !registryMatches.has(file.path));
  const creatable = createMissing ? missing : [];

  return {
    slug,
    registry,
    registryFiles,
    document,
    blocks,
    changed,
    unchanged,
    missing,
    creatable,
    created: [],
    stale,
    skipped,
    errors,
  };
}

export function buildNextBody(plan, options = {}) {
  const body = Array.isArray(plan.document?.body) ? structuredClone(plan.document.body) : [];
  const changedByIndex = new Map(plan.changed.map((item) => [item.block.index, item]));

  for (const [index, item] of changedByIndex) {
    body[index] = {
      ...body[index],
      code: item.nextCode,
      language: options.syncLanguage ? item.nextLanguage : body[index].language || item.nextLanguage,
      filename: body[index].filename || item.file.path,
    };
  }

  if (options.createMissing) {
    const insertAt = findCodeBlockInsertIndex(body);
    const createdBlocks = plan.creatable.map((file) => makeCodeBlock(file));
    body.splice(insertAt, 0, ...createdBlocks);
    plan.created = createdBlocks;
  }

  return body;
}

export function collectCodeBlocks(body = []) {
  return body
    .map((block, index) => ({ ...block, index }))
    .filter((block) => block?._type === "effectCodeBlock");
}

export function matchRegistryFile(filename, registryFiles) {
  const normalized = slash(filename).trim();
  const exact = registryFiles.find((file) => file.path === normalized);
  if (exact) return { file: exact };

  const basenameMatches = registryFiles.filter((file) => path.basename(file.path) === normalized);
  if (basenameMatches.length === 1) return { file: basenameMatches[0] };
  if (basenameMatches.length > 1) {
    return {
      error: `ambiguous basename match [${basenameMatches.map((file) => file.path).join(", ")}]`,
    };
  }

  return { file: null };
}

function readRegistryForSlug(slug) {
  const registryEffectsDir = path.join(getRoot(), "registry", "effects");
  for (const category of fs.readdirSync(registryEffectsDir)) {
    const categoryDir = path.join(registryEffectsDir, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const registryFile = path.join(categoryDir, slug, "registry.json");
    if (!fs.existsSync(registryFile)) continue;

    const registryJson = readJson(registryFile);
    return {
      ...registryJson,
      category: registryJson.category || category,
      dir: path.dirname(registryFile),
      registryPath: registryFile,
    };
  }

  fail(`No registry component found for slug "${slug}".`);
}

function readRegistryCodeFiles(registry) {
  const files = Array.isArray(registry.files) ? registry.files : [];
  const codeFiles = files
    .filter((file) => file.type !== "registry:asset")
    .filter((file) => CODE_EXTENSIONS.has(path.extname(file.path || "")))
    .map((file) => {
      const sourcePath = path.join(registry.dir, file.path);
      if (!fs.existsSync(sourcePath)) fail(`Registry file missing: ${relative(sourcePath)}`);
      return {
        path: slash(file.path),
        filename: path.basename(file.path),
        language: inferLanguage(file.path),
        content: fs.readFileSync(sourcePath, "utf8"),
      };
    });

  if (!codeFiles.length) fail(`No code files found in registry.json for "${registry.name}".`);
  return codeFiles;
}

async function fetchSanityDocument(registry, options) {
  if (options.fixture) return readJson(path.resolve(getRoot(), options.fixture));

  const client = getSanityConfig();
  const query = `*[_type == "effectContent" && effectSlug == $slug && categorySlug == $category]{_id, _rev, categorySlug, effectSlug, body}`;
  const params = {
    query,
    "$slug": JSON.stringify(registry.name),
    "$category": JSON.stringify(registry.category),
  };
  const url = new URL(`${client.baseUrl}/data/query/${client.dataset}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetchSanity(url, {
    headers: {
      Authorization: `Bearer ${client.token}`,
    },
  }, "query Sanity document");

  if (!response.ok) {
    const body = await response.text();
    fail(`Sanity query failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const results = data.result || [];
  if (results.length > 1) {
    fail(`Sanity query returned ${results.length} documents for ${registry.category}/${registry.name}. Resolve duplicates before syncing.`);
  }
  return results[0] || null;
}

async function patchSanityBody(documentId, body, options) {
  if (options.fixture) {
    const fixturePath = path.resolve(getRoot(), options.fixture);
    const fixture = readJson(fixturePath);
    writeJson(fixturePath, { ...fixture, body });
    return;
  }

  const client = getSanityConfig();
  const url = `${client.baseUrl}/data/mutate/${client.dataset}`;
  const response = await fetchSanity(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: documentId,
            set: { body },
          },
        },
      ],
    }),
  }, "patch Sanity document");

  if (!response.ok) {
    const responseBody = await response.text();
    fail(`Sanity mutation failed (${response.status}): ${responseBody.slice(0, 500)}`);
  }
}

function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;
  const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";
  const baseUrl = process.env.HYPERIUX_SANITY_API_BASE || (projectId ? `https://${projectId}.api.sanity.io/v${apiVersion}` : "");

  if (!projectId && !process.env.HYPERIUX_SANITY_API_BASE) fail("NEXT_PUBLIC_SANITY_PROJECT_ID is required.");
  if (!dataset) fail("NEXT_PUBLIC_SANITY_DATASET is required.");
  if (!token) fail("SANITY_API_TOKEN is required.");

  return { projectId, dataset, token, baseUrl };
}

async function fetchSanity(url, options, action) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error.cause;
    const details = [
      error.message,
      cause?.code,
      cause?.message,
      cause?.hostname ? `host=${cause.hostname}` : null,
    ].filter(Boolean).join(" | ");
    fail(`Could not ${action}: ${details}`);
  }
}

function printPlan(command, plan, options = {}) {
  console.log(`sanity:code:${command}`);
  console.log("\ncomponent:");
  console.log(`${plan.registry.category}/${plan.slug}@${plan.registry.version || "unknown"}`);
  console.log("\nsanity document:");
  console.log(plan.document?._id || "missing");

  printList("registry files", plan.registryFiles.map((file) => file.path));
  printList("matching changed blocks", plan.changed.map((item) => `${item.file.path} body[${item.block.index}]`));
  printList("matching unchanged blocks", plan.unchanged.map((item) => `${item.file.path} body[${item.block.index}]`));
  printList("missing sanity blocks", plan.missing.map((file) => file.path));
  printList("stale sanity blocks", plan.stale.map((block) => `${block.filename} body[${block.index}]`));
  printList("skipped blocks", plan.skipped.map((block) => `body[${block.index}] has no filename`));
  printList("errors", plan.errors);

  if (options.createMissing) {
    printList("blocks to create", plan.creatable.map((file) => file.path));
  } else if (plan.missing.length) {
    console.log("\ncreate missing:");
    console.log("pass --create-missing to append missing registry files as Sanity code blocks");
  }
}

function printList(label, values) {
  console.log(`\n${label}:`);
  console.log(values.length ? values.map((value) => `- ${value}`).join("\n") : "none");
}

function makeCodeBlock(file) {
  return {
    _type: "effectCodeBlock",
    _key: makeKey(`code-${file.path}`),
    filename: file.path,
    language: file.language,
    code: file.content,
  };
}

function findCodeBlockInsertIndex(body) {
  let index = -1;
  body.forEach((block, blockIndex) => {
    if (block?._type === "effectCodeBlock") index = blockIndex;
  });
  return index === -1 ? body.length : index + 1;
}

function inferLanguage(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".css") return "css";
  if (ext === ".json") return "json";
  if (ext === ".ts" || ext === ".tsx") return "tsx";
  return "jsx";
}

function makeKey(value) {
  return value
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function requireOption(options, key) {
  if (options[key] === undefined || options[key] === "") fail(`Missing required --${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.`);
  return options[key];
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function coerceValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function slash(value) {
  return value.split(path.sep).join("/");
}

function relative(file) {
  return slash(path.relative(getRoot(), file)) || ".";
}

function getRoot() {
  return path.resolve(process.env.HYPERIUX_WORKFLOW_ROOT || DEFAULT_ROOT);
}

function fail(message) {
  throw new Error(message);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
