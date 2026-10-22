import fs from "node:fs";
// Prints palette tables mapped to a component's own colour props
// Usage: node scripts/shadcn-port/palettes.mjs '{"accentColor":"primary"}'
const SRC = process.env.SHADCN_ANIMATED_SRC || process.env.HOME + "/Downloads/shadcn-animated/src";
const css = fs.readFileSync(SRC + "/app/globals.css", "utf8");
const blocks = {};
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(css))) {
  const sel = m[1].trim();
  const named = sel.match(/data-hpx-theme="([a-z-]+)"/);
  if (!named && sel !== ":root" && sel !== ".dark") continue;
  const name = named ? named[1] : "default";
  const dark = sel.includes(".dark") && !sel.includes(":not(.dark)");
  const vars = {};
  for (const d of m[2].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
  const key = `${name}:${dark ? "dark" : "light"}`;
  blocks[key] = { ...(blocks[key] || {}), ...vars };
}
const map = JSON.parse(process.argv[2]);
const out = {};
for (const p of ["default", "caffeine", "claude", "ghibli", "spotify", "valorant", "vscode"]) for (const mode of ["light", "dark"]) {
  const t = { ...blocks[`default:${mode}`], ...blocks[`${p}:${mode}`] };
  out[`${p}:${mode}`] = Object.fromEntries(Object.entries(map).map(([k, tok]) => [k, t[tok]]));
}
console.log(JSON.stringify(out, null, 2).replace(/"([a-zA-Z]+)":/g, "$1:").replace(/"(\w+:\w+)":/g, '"$1":'));
