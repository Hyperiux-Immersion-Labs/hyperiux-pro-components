#!/usr/bin/env node
// Writes each effect's full component source into its Sanity effectContent
// document's top-level `jsxCode` / `tsxCode` fields (read by the effect page's
// "Copy code" dropdown), from codegen/{slug}/index.jsx + index.tsx.
//
//   node scripts/sanity-source-sync.mjs diff --slug stack-loader,link-button
//   node scripts/sanity-source-sync.mjs sync --slug stack-loader,link-button --yes
//   node scripts/sanity-source-sync.mjs sync --all --yes
//
// Draft-only, like sanity-code-sync.mjs: it creates drafts.<id> from the
// published doc if no draft exists yet, then patches just these two fields -
// any other in-progress Studio edits on an existing draft are left alone.
// Nothing goes live until someone publishes the draft in Studio.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CODEGEN_DIR = path.join(ROOT, "codegen");
const COMMANDS = new Set(["diff", "sync"]);

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

  console.log(`sanity-source-sync ${command}\n`);
  for (const slug of slugs) {
    const source = readCodegenSource(slug);
    const published = await queryOne(client, `*[_type == "effectContent" && effectSlug == $slug && !(_id in path("drafts.**"))]`, { slug }, slug);
    if (!published) {
      record({ slug, status: "error", detail: "no published effectContent document" });
      continue;
    }

    const draftId = `drafts.${published._id}`;
    const draft = await queryOne(client, `*[_id == $id]`, { id: draftId }, draftId);
    const current = draft || published;
    const changes = ["jsxCode", "tsxCode"].filter((field) => (current[field] || "") !== source[field]);

    if (!changes.length) {
      record({ slug, status: "unchanged", detail: draft ? "draft already matches" : "published already matches" });
      continue;
    }

    if (command === "sync" && options.yes) {
      await writeDraft(client, published, draftId, source);
      record({ slug, status: "written", detail: `${changes.join(" + ")} -> ${draftId}` });
    } else {
      record({ slug, status: "would change", detail: changes.join(" + ") });
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
    jsxCode: fs.readFileSync(jsxPath, "utf8"),
    tsxCode: fs.readFileSync(tsxPath, "utf8"),
  };
}

async function writeDraft(client, published, draftId, source) {
  // eslint-disable-next-line no-unused-vars
  const { _rev, _updatedAt, _createdAt, ...base } = published;
  await mutate(client, [
    { createIfNotExists: { ...base, _id: draftId } },
    { patch: { id: draftId, set: { jsxCode: source.jsxCode, tsxCode: source.tsxCode } } },
  ]);
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

// Retries transient network failures (timeouts, resets) with backoff - a
// full --all run makes ~450 requests and one dropped socket shouldn't abort it.
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
