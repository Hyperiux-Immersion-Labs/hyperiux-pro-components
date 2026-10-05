#!/usr/bin/env node
// Copies codegen/{slug}/index.jsx + index.tsx into the Sanity effectContent
// body, in the "index" code block that sits under the "Component Code" heading
// (block `code` = JSX, `tsxCode` = TSX).
//
//   node scripts/sanity-component-code-sync.mjs diff --slug parallax-strip-slider
//   node scripts/sanity-component-code-sync.mjs sync --slug parallax-strip-slider --yes
//   node scripts/sanity-component-code-sync.mjs sync --all --yes
//
// If the heading has no code block yet, one is inserted right after it. If the
// body has no "Component Code" heading, the slug is reported as an error and
// left alone.
//
// Draft-only: it creates drafts.<id> from the published doc if no draft exists,
// then patches just that one code block (matched by _key), so other in-progress
// Studio edits on an existing draft are left alone. Nothing goes live until
// someone publishes the draft in Studio.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CODEGEN_DIR = path.join(ROOT, "codegen");
const COMMANDS = new Set(["diff", "sync"]);
const HEADING_TEXT = "component code";
const BLOCK_FILENAME = "index";

async function main() {
  const { command, options } = parseCli(process.argv.slice(2));
  if (!COMMANDS.has(command)) fail(`Unknown command "${command}". Use one of: ${[...COMMANDS].join(", ")}`);

  const slugs = resolveSlugs(options);
  const client = getSanityConfig();
  const results = [];
  const record = (result) => {
    results.push(result);
    console.log(`${result.status.padEnd(13)} ${result.slug}  (${result.detail})`);
  };

  console.log(`sanity-component-code-sync ${command}\n`);
  for (const slug of slugs) {
    const source = readCodegenSource(slug);
    const published = await queryOne(client, `*[_type == "effectContent" && effectSlug == $slug && !(_id in path("drafts.**"))]`, { slug }, slug);
    if (!published) {
      record({ slug, status: "error", detail: "no published effectContent document" });
      continue;
    }

    const draftId = `drafts.${published._id}`;
    const draft = await queryOne(client, `*[_id == $id]`, { id: draftId }, draftId);
    const plan = planChange(draft || published, source);

    if (plan.error) {
      record({ slug, status: "error", detail: plan.error });
      continue;
    }
    if (!plan.change) {
      record({ slug, status: "unchanged", detail: draft ? "draft already matches" : "published already matches" });
      continue;
    }

    if (command === "sync" && options.yes) {
      await writeDraft(client, published, draftId, plan.change);
      record({ slug, status: "written", detail: `${plan.change.label} -> ${draftId}` });
    } else {
      record({ slug, status: "would change", detail: plan.change.label });
    }
  }

  printResults(command, options, results);
  if (results.some((result) => result.status === "error")) process.exitCode = 1;
}

function resolveSlugs(options) {
  if (options.all) {
    return fs.readdirSync(CODEGEN_DIR).filter((entry) => fs.statSync(path.join(CODEGEN_DIR, entry)).isDirectory()).sort();
  }
  if (typeof options.slug !== "string" || !options.slug.trim()) fail("Pass --slug a,b,c or --all.");
  return options.slug.split(",").map((slug) => slug.trim()).filter(Boolean);
}

function readCodegenSource(slug) {
  const dir = path.join(CODEGEN_DIR, slug);
  const jsxPath = path.join(dir, "index.jsx");
  const tsxPath = path.join(dir, "index.tsx");
  if (!fs.existsSync(jsxPath) || !fs.existsSync(tsxPath)) {
    fail(`codegen/${slug} must contain index.jsx and index.tsx - run component-ship codegen --slug ${slug} first.`);
  }
  return {
    code: fs.readFileSync(jsxPath, "utf8"),
    tsxCode: fs.readFileSync(tsxPath, "utf8"),
  };
}

// Finds the "Component Code" h2 and the code block under it (up to the next
// heading or separator), and describes the single patch needed, if any.
function planChange(doc, source) {
  const body = Array.isArray(doc.body) ? doc.body : [];
  const headingIndex = body.findIndex((block) => block?._type === "block" && block.style === "h2" && blockText(block).trim().toLowerCase() === HEADING_TEXT);
  if (headingIndex === -1) return { error: 'no "Component Code" heading in body' };

  let codeIndex = -1;
  for (let index = headingIndex + 1; index < body.length; index += 1) {
    const block = body[index];
    if (block._type === "horizontalRule" || (block._type === "block" && block.style === "h2")) break;
    if (block._type === "effectCodeBlock") {
      codeIndex = index;
      break;
    }
  }

  if (codeIndex === -1) {
    const block = { _type: "effectCodeBlock", _key: crypto.randomBytes(6).toString("hex"), filename: BLOCK_FILENAME, ...source };
    return { change: { label: "insert index code block", insertAfterKey: body[headingIndex]._key, block } };
  }

  const existing = body[codeIndex];
  const fields = ["code", "tsxCode"].filter((field) => (existing[field] || "") !== source[field]);
  if (!fields.length) return {};
  return { change: { label: `${fields.join(" + ")} in body[${codeIndex}]`, blockKey: existing._key, fields: Object.fromEntries(fields.map((field) => [field, source[field]])) } };
}

function blockText(block) {
  return (block.children || []).map((child) => child.text || "").join("");
}

async function writeDraft(client, published, draftId, change) {
  // eslint-disable-next-line no-unused-vars
  const { _rev, _updatedAt, _createdAt, ...base } = published;
  const patch = change.block
    ? { id: draftId, insert: { after: `body[_key=="${change.insertAfterKey}"]`, items: [change.block] } }
    : { id: draftId, set: Object.fromEntries(Object.entries(change.fields).map(([field, value]) => [`body[_key=="${change.blockKey}"].${field}`, value])) };
  await mutate(client, [{ createIfNotExists: { ...base, _id: draftId } }, { patch }]);
}

// ---------------------------------------------------------------------------
// Sanity HTTP API
// ---------------------------------------------------------------------------

function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN || process.env.NEXT_PUBLIC_SANITY_VIEWER_TOKEN;
  const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";

  if (!projectId) fail("NEXT_PUBLIC_SANITY_PROJECT_ID is required (source apps/docs/.env.local).");
  if (!token) fail("A Sanity write token is required: set SANITY_API_TOKEN.");

  return { dataset, token, baseUrl: `https://${projectId}.api.sanity.io/v${apiVersion}` };
}

// Retries transient network failures (timeouts, resets) with backoff.
async function fetchWithRetry(url, init, attempts = 4) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
    }
  }
}

async function queryOne(client, query, params, context) {
  const url = new URL(`${client.baseUrl}/data/query/${client.dataset}`);
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));

  const response = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${client.token}` } });
  if (!response.ok) fail(`Sanity query failed for ${context} (${response.status}): ${(await response.text()).slice(0, 300)}`);

  const results = (await response.json()).result || [];
  if (results.length > 1) fail(`Sanity returned ${results.length} documents for ${context} - resolve duplicates first.`);
  return results[0] || null;
}

async function mutate(client, mutations) {
  const response = await fetchWithRetry(`${client.baseUrl}/data/mutate/${client.dataset}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${client.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!response.ok) fail(`Sanity mutation failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
}

// ---------------------------------------------------------------------------
// CLI helpers
// ---------------------------------------------------------------------------

function parseCli(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith("--")) fail(`Unexpected argument "${arg}"`);
    const [key, inline] = arg.slice(2).split("=", 2);
    const next = rest[index + 1];
    if (inline !== undefined) options[key] = inline;
    else if (!next || next.startsWith("--")) options[key] = true;
    else {
      options[key] = next;
      index += 1;
    }
  }
  return { command, options };
}

function printResults(command, options, results) {
  const counts = results.reduce((acc, { status }) => ({ ...acc, [status]: (acc[status] || 0) + 1 }), {});
  console.log(`\n${Object.entries(counts).map(([status, count]) => `${count} ${status}`).join(", ")}`);
  if (command === "sync" && !options.yes && counts["would change"]) {
    console.log("\nNo Sanity changes written. Re-run with --yes to write drafts.");
  } else if (counts.written) {
    console.log("\nDrafts written - review and publish them in Sanity Studio.");
  }
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

main();
