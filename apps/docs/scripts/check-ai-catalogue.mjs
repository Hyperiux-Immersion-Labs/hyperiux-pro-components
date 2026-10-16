#!/usr/bin/env node
// Lists every effect whose guide disagrees with its registry entry, so the
// Sanity content can be fixed effect by effect. See src/lib/ai-catalogue-checks.js
// for what's checked.
//
//   npm run check:ai-catalogue                       production
//   npm run check:ai-catalogue -- http://localhost:3000/ai-components.json
//   npm run check:ai-catalogue -- ./catalogue.json --markdown > todo.md

import fs from "node:fs";
import { checkCatalogue } from "../src/lib/ai-catalogue-checks.js";

const args = process.argv.slice(2);
const markdown = args.includes("--markdown");
const source = args.find((arg) => !arg.startsWith("--")) || "https://vault.hyperiux.com/ai-components.json";

const catalogue = /^https?:/.test(source)
  ? await fetch(source, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);
      return res.json();
    })
  : JSON.parse(fs.readFileSync(source, "utf-8"));

const results = checkCatalogue(catalogue);
const total = results.reduce((sum, entry) => sum + entry.issues.length, 0);
const byKind = {};
for (const entry of results) for (const issue of entry.issues) byKind[issue.kind] = (byKind[issue.kind] || 0) + 1;

if (markdown) {
  const lines = [
    `# AI catalogue issues`,
    "",
    `${total} issues in ${results.length} of ${catalogue.effects.length} effects (source: ${source}).`,
    "",
    ...Object.entries(byKind).map(([kind, count]) => `- ${kind}: ${count}`),
    "",
  ];
  let category = null;
  for (const entry of results) {
    if (entry.category !== category) {
      category = entry.category;
      lines.push(`## ${category}`, "");
    }
    lines.push(`### [${entry.title}](${entry.docsUrl})`, "", ...entry.issues.map((issue) => `- [ ] ${issue.message}`), "");
  }
  console.log(lines.join("\n"));
} else {
  for (const entry of results) {
    console.log(`\n${entry.title} (${entry.slug}, ${entry.category})`);
    for (const issue of entry.issues) console.log(`  - [${issue.kind}] ${issue.message}`);
  }
  console.log(`\n${total} issues in ${results.length} of ${catalogue.effects.length} effects`);
  console.log(Object.entries(byKind).map(([kind, count]) => `  ${kind}: ${count}`).join("\n"));
}

process.exitCode = total > 0 ? 1 : 0;
