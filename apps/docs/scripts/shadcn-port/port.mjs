// Bundles one source component, its local deps and demo into one file
// Usage: node scripts/shadcn-port/port.mjs scripts/shadcn-port/configs/<name>.json
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = process.env.SHADCN_ANIMATED_SRC || path.join(process.env.HOME, "Downloads/shadcn-animated/src");
const require = createRequire(path.join(REPO, "package.json"));
const ts = require("typescript");

const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");

// ---------- themes from their globals.css ----------
function parseThemes() {
  const css = read("app/globals.css");
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
  return blocks;
}

const TOKENS = [
  "sidebar-primary-foreground", "sidebar-accent-foreground", "sidebar-foreground", "sidebar-primary",
  "sidebar-accent", "sidebar-border", "sidebar-ring", "sidebar",
  "card-foreground", "popover-foreground", "primary-foreground", "secondary-foreground", "muted-foreground",
  "accent-foreground", "destructive-foreground", "success-foreground", "warning-foreground", "info-foreground",
  "background", "foreground", "card", "popover", "primary", "secondary", "muted", "accent", "destructive",
  "success", "warning", "info", "border", "input", "ring", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
];
const PREFIX = "bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|divide|caret|decoration|placeholder|shadow|inset-ring|accent";
const tokenAlt = TOKENS.join("|");

function transformClasses(s) {
  // tw-animate enter/exit classes -> Base UI starting/ending styles
  s = s.replace(/(?<![\w-])(?:[\w\-\[\]=/.]+:)*animate-out(?![\w-])/g, "");
  s = s.replace(/(?<![\w-])(?:[\w\-\[\]=/.]+:)*animate-in(?![\w-])/g, "transition-[opacity,scale,translate] duration-150 ease-out");
  s = s.replace(/(?<![\w-])fade-in-0(?![\w-])/g, "data-starting-style:opacity-0");
  s = s.replace(/(?<![\w-])fade-out-0(?![\w-])/g, "data-ending-style:opacity-0");
  s = s.replace(/(?<![\w-])zoom-in-(\d+)(?![\w-])/g, "data-starting-style:scale-$1");
  s = s.replace(/(?<![\w-])zoom-out-(\d+)(?![\w-])/g, "data-ending-style:scale-$1");
  const dir = { top: "-translate-y-", bottom: "translate-y-", left: "-translate-x-", right: "translate-x-" };
  s = s.replace(/(?<![\w-])slide-in-from-(top|bottom|left|right)-(\d+)(?![\w-])/g, (_, d, n) => `data-starting-style:${dir[d]}${n}`);
  s = s.replace(/(?<![\w-])slide-out-to-(top|bottom|left|right)-(\d+)(?![\w-])/g, (_, d, n) => `data-ending-style:${dir[d]}${n}`);

  // Custom state variants -> plain data variants
  const variants = {
    open: "data-open", closed: "data-closed", checked: "data-checked", unchecked: "data-unchecked",
    disabled: "data-disabled", active: "data-active", selected: "data-[selected=true]",
    horizontal: "data-[orientation=horizontal]", vertical: "data-[orientation=vertical]",
  };
  s = s.replace(/hpx-(open|closed|checked|unchecked|disabled|active|selected|horizontal|vertical)(?=[:/])/g, (_, v) => variants[v]);
  s = s.replace(/(?<![\w-])hpx-no-scrollbar(?![\w-])/g, "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden");
  s = s.replace(/(?<![\w-])hpx-scroll-fade-none(?![\w-])/g, "[mask-image:none]");
  s = s.replace(/(?<![\w-])hpx-scroll-fade-x(?![\w-])/g, "[mask-image:linear-gradient(to_right,transparent,#000_2.5rem,#000_calc(100%-2.5rem),transparent)]");

  // Theme tokens -> namespaced variables
  s = s.replace(new RegExp(`(?<![\\w-])(${PREFIX})-(${tokenAlt})(?![\\w-])`, "g"), "$1-(--hx-$2)");
  s = s.replace(new RegExp(`var\\(--(${tokenAlt})(?![\\w-])`, "g"), "var(--hx-$1");
  s = s.replace(new RegExp(`\\((--)(${tokenAlt})\\)`, "g"), "(--hx-$2)");
  s = s.replace(/(?<![\w-])dark:/g, "in-data-[theme=dark]:");
  return s;
}

function renameHpx(s) {
  s = s.replace(/data-hpx-slot/g, "data-slot").replace(/\[hpx-slot/g, "[slot").replace(/hpx-input-otp /g, "");
  s = s.replace(/\bhpxSlot\b/g, "slotAttr");
  s = s.replace(/\buseHpx(?=[A-Z])/g, "use");
  s = s.replace(/\bcreateHpx(?=[A-Z])/g, "create");
  s = s.replace(/\bHpx(?=[A-Z])/g, "");
  s = s.replace(/\bhpx([A-Z])/g, (_, c) => c.toLowerCase());
  s = s.replace(/\bHPX_/g, "");
  s = s.replace(/--hpx-/g, "--hx-");
  return s;
}

// ---------- imports ----------
const external = new Map();
function addImport(mod, clause) {
  if (!external.has(mod)) external.set(mod, { named: new Map(), def: null, ns: null, types: new Set() });
  const e = external.get(mod);
  const c = clause.trim();
  const nsm = c.match(/^\*\s+as\s+(\w+)$/);
  if (nsm) return void (e.ns = nsm[1]);
  const typeOnly = c.startsWith("type ");
  const body = typeOnly ? c.slice(5) : c;
  const dm = body.match(/^(\w+)\s*(?:,\s*(\{[\s\S]*\}))?$/);
  let braces = body;
  if (dm) { e.def = dm[1]; braces = dm[2] || ""; }
  const inner = braces.match(/\{([\s\S]*)\}/);
  if (!inner) return;
  for (let part of inner[1].split(",")) {
    part = part.trim();
    if (!part) continue;
    const isType = typeOnly || part.startsWith("type ");
    part = part.replace(/^type\s+/, "");
    e.named.set(part, isType && !(e.named.get(part) === false) ? true : false);
  }
}

function stripImports(code, file) {
  return code.replace(/^import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];?[ \t]*\n/gm, (_, clause, mod) => {
    if (mod.startsWith("@/") || mod.startsWith(".")) return "";
    addImport(mod, clause);
    return "";
  }).replace(/^import\s+["'][^"']+["'];?\n/gm, "");
}

// ---------- local dependency graph ----------
const SKIP_LOCAL = new Set(["components/controls-panel", "lib/utils", "components/api-reference"]);
function resolveLocal(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = path.join(path.dirname(fromFile), spec);
  else return null;
  if (SKIP_LOCAL.has(base)) return null;
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) if (fs.existsSync(path.join(SRC, base + ext))) return base + ext;
  throw new Error(`cannot resolve ${spec} from ${fromFile}`);
}
function localImports(file) {
  return [...read(file).matchAll(/^import\s+[\s\S]*?\s+from\s+["']([^"']+)["']/gm)].map((m) => resolveLocal(file, m[1])).filter(Boolean);
}
if (!cfg.deps) {
  const order = [];
  const seen = new Set();
  const skip = new Set([cfg.main, ...cfg.demos]);
  const visit = (f) => {
    if (seen.has(f)) return;
    seen.add(f);
    for (const d of localImports(f)) visit(d);
    if (!skip.has(f)) order.push(f);
  };
  for (const f of [cfg.main, ...cfg.demos]) visit(f);
  cfg.deps = order;
}

// ---------- collisions ----------
function topNames(code) {
  const sf = ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = new Set();
  for (const st of sf.statements) {
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) names.add(st.name.text);
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.add(d.name.text);
  }
  return names;
}

function renameIdentifiers(code, map) {
  const sf = ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const visit = (node) => {
    if (ts.isIdentifier(node) && map.has(node.text)) {
      const p = node.parent;
      const isKey = (ts.isPropertyAccessExpression(p) && p.name === node) || (ts.isPropertyAssignment(p) && p.name === node) ||
        (ts.isJsxAttribute(p) && p.name === node) || (ts.isPropertySignature(p) && p.name === node) ||
        (ts.isBindingElement(p) && p.propertyName === node) || (ts.isMethodDeclaration(p) && p.name === node) ||
        (ts.isQualifiedName(p) && p.right === node);
      if (ts.isShorthandPropertyAssignment(p)) edits.push([node.getStart(sf), node.getEnd(), `${node.text}: ${map.get(node.text)}`]);
      else if (!isKey) edits.push([node.getStart(sf), node.getEnd(), map.get(node.text)]);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  edits.sort((a, b) => b[0] - a[0]);
  for (const [s, e, t] of edits) code = code.slice(0, s) + t + code.slice(e);
  return code;
}

const pascal = (f) => path.basename(f, ".tsx").split(/[^a-z0-9]+/i).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

// ---------- assemble ----------
let body = "";
const mainExports = [];
const allFiles = [...cfg.deps, cfg.main, ...cfg.demos];
const namesByFile = Object.fromEntries(allFiles.map((f) => [f, topNames(read(f))]));
for (const f of [...cfg.deps, cfg.main]) {
  let code = read(f).replace(/^["']use client["'];?\n/m, "");
  const later = new Set(allFiles.slice(allFiles.indexOf(f) + 1).flatMap((g) => [...namesByFile[g]]));
  const clash = [...namesByFile[f]].filter((n) => later.has(n));
  if (f !== cfg.main && clash.length) {
    const prefix = pascal(f);
    code = renameIdentifiers(code, new Map(clash.map((n) => [n, /^[A-Z]/.test(n) ? `${prefix}${n}` : `${prefix[0].toLowerCase()}${prefix.slice(1)}${n[0].toUpperCase()}${n.slice(1)}`])));
  }
  code = stripImports(code, f);
  const isMain = f === cfg.main;
  code = code.replace(/^export\s+(type\s+)?\{([\s\S]*?)\}\s*;?\s*$/gm, (_, blockType, list) => {
    if (isMain) for (const item of list.replace(/\/\/.*$/gm, "").split(",")) {
      const t = item.trim().replace(/^type\s+/, "");
      if (!t) continue;
      const [local, alias] = t.split(/\s+as\s+/);
      mainExports.push({ local: local.trim(), alias: (alias || local).trim(), type: Boolean(blockType) || item.trim().startsWith("type ") });
    }
    return "";
  });
  if (!isMain) code = code.replace(/^export\s+(?=(function|const|type|interface|class|async))/gm, "");
  body += `\n// ---- ${path.basename(f)} ----\n` + code;
}

let demo = "";
const earlierNames = new Set([...cfg.deps, cfg.main].flatMap((g) => [...namesByFile[g]]));
for (const f of cfg.demos) {
  let code = read(f).replace(/^["']use client["'];?\n/m, "");
  const demoClash = [...namesByFile[f]].filter((n) => earlierNames.has(n));
  if (demoClash.length) code = renameIdentifiers(code, new Map(demoClash.map((n) => [n, /^[A-Z]/.test(n) ? `Demo${n}` : `demo${n[0].toUpperCase()}${n.slice(1)}`])));
  code = stripImports(code, f);
  code = code.replace(/^export\s+default\s+/gm, "").replace(/^export\s+(?=(function|const|type|interface))/gm, "");
  demo += `\n// ---- demo: ${path.basename(f)} ----\n` + code;
}

if (cfg.extraDemo) demo += `\n${cfg.extraDemo}\n`;
// Demo: controls become props
let controlsSrc = null;
demo = demo.replace(/const controls = (\{[\s\S]*?\n\})\s*satisfies\s+\w+/m, (m0, obj) => {
  controlsSrc = obj;
  return `const controls = ${obj.replace(/disabled: \((\w+)\) =>/g, "disabled: ($1: Record<string, unknown>) =>")}`;
});
if (!controlsSrc) throw new Error("controls schema not found in demo");
demo = demo.replace(/useHpxControls\(controls\)/g, "useDemoControls(props)");
demo = demo.replace(new RegExp(`function ${cfg.demoFn}\\(\\)`), `function ${cfg.demoFn}(props: Partial<ControlValues>)`);
demo = demo.replace(/^\s*<HpxControlsPanel[\s\S]*?\/>\s*\n/m, "\n");
// Our demo page has its own title
demo = demo.replace(/\n\s*<h1[^>]*>[\s\S]*?<\/h1>\s*\n\s*<p className="[^"]*muted-foreground[^"]*">[\s\S]*?<\/p>/, "");
external.delete("@/components/controls-panel");

let out = body + demo;
out = renameHpx(transformClasses(out));
// Portaled popups get the theme through a contents wrapper
out = out.replace(/<(\w+Primitive\.Portal|[A-Z]\w*Portal)(\s[^>]*)?>/g, (m, tag, attrs = "") => (attrs.trim().endsWith("/") ? m : `<${tag}${attrs}><ThemeScope>`));
out = out.replace(/<\/(\w+Primitive\.Portal|[A-Z]\w*Portal)>/g, "</ThemeScope></$1>");
out = out.replace(/createPortal\(\s*\n(\s*)<MotionConfig reducedMotion="user">([\s\S]*?)<\/MotionConfig>,/g, 'createPortal(\n$1<ThemeScope><MotionConfig reducedMotion="user">$2</MotionConfig></ThemeScope>,');
for (const e of mainExports) { e.local = renameHpx(e.local); e.alias = renameHpx(e.alias); }
for (const e of mainExports) if (e.alias !== e.local && !e.type) out = out.replace(new RegExp(`\\b${e.alias}\\b`, "g"), e.local);
for (const e of mainExports) if (e.alias !== e.local && e.type) out = out.replace(new RegExp(`\\b${e.alias}\\b`, "g"), e.local);

// Themes: only the tokens this file uses
const themes = parseThemes();
const used = [...new Set(["background", "foreground", "border", "ring", ...[...out.matchAll(/--hx-([a-z0-9-]+)/g)].map((m) => m[1])])].filter((t) => TOKENS.includes(t)).sort();
const palettes = ["default", "caffeine", "claude", "ghibli", "spotify", "valorant", "vscode"];
const themeObj = {};
for (const p of palettes) for (const mode of ["light", "dark"]) {
  const base = themes[`default:${mode}`] || {};
  const own = themes[`${p}:${mode}`] || {};
  themeObj[`${p}:${mode}`] = Object.fromEntries(used.map((t) => [t, own[t] ?? base[t]]));
}

const usesThemeHook = external.has("next-themes");
external.delete("next-themes");
const header = `"use client";\n\n` +
  [...external.entries()].map(([mod, e]) => {
    const parts = [];
    if (e.def) parts.push(e.def);
    if (e.named.size) parts.push(`{ ${[...e.named.entries()].map(([n, t]) => (t ? `type ${n}` : n)).join(", ")} }`);
    const lines = [];
    if (e.ns) lines.push(`import * as ${e.ns} from "${mod}";`);
    if (parts.length) lines.push(`import ${parts.join(", ")} from "${mod}";`);
    return lines.join("\n");
  }).join("\n") + `\nimport { twMerge } from "tailwind-merge";\n`;

const helpers = `
function toClass(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(" ");
  if (Object.getPrototypeOf(value) !== Object.prototype) return "";
  const record = value as Record<string, unknown>;
  return Object.keys(record).filter((key) => record[key]).join(" ");
}

function cn(...inputs: unknown[]) {
  return twMerge(toClass(inputs));
}

function slotAttr(name: string) {
  return { "data-slot": name };
}

export type ${cfg.exportName}Theme = ${palettes.map((p) => `"${p}"`).join(" | ")};
export type ${cfg.exportName}Mode = "light" | "dark";

const THEMES: Record<\`\${${cfg.exportName}Theme}:\${${cfg.exportName}Mode}\`, Record<string, string>> = ${JSON.stringify(themeObj, null, 2)};

// Popups render in a portal, so they need these too
function themeProps(theme: ${cfg.exportName}Theme = "default", mode: ${cfg.exportName}Mode = "light") {
  const palette = THEMES[\`\${theme}:\${mode}\`] ?? THEMES["default:light"];
  const style = Object.fromEntries(Object.entries(palette).map(([token, value]) => [\`--hx-\${token}\`, value]));
  return { "data-theme": mode, style: style as React.CSSProperties };
}

const ThemeContext = React.createContext(themeProps());
${usesThemeHook ? `
const ModeContext = React.createContext<{ mode: ${cfg.exportName}Mode; setMode: (mode: ${cfg.exportName}Mode) => void } | null>(null);

// Light/dark state owned by the component
function useTheme() {
  const context = React.useContext(ModeContext);
  return {
    resolvedTheme: context?.mode,
    forcedTheme: undefined as string | undefined,
    setTheme: (next: string) => context?.setMode(next === "dark" ? "dark" : "light"),
  };
}
` : ""}

function ThemeScope({ children }: { children?: React.ReactNode }) {
  const themed = React.useContext(ThemeContext);
  return (
    <div {...themed} className="contents [:where(&_*)]:border-(--hx-border) [:where(&_*)]:outline-(--hx-ring)/50">
      {children}
    </div>
  );
}
`;

const demoFn = renameHpx(cfg.demoFn);
const footer = `
type ControlValues = { [K in keyof typeof controls]: (typeof controls)[K]["value"] };
const controlDefaults = Object.fromEntries(
  Object.entries(controls).map(([key, control]) => [key, control.value])
) as ControlValues;

// Demo-set values win until the props change
function useDemoControls(props: Partial<ControlValues>) {
  const [overrides, setOverrides] = React.useState<Partial<ControlValues>>({});
  const [seen, setSeen] = React.useState(props);
  if (seen !== props && JSON.stringify(seen) !== JSON.stringify(props)) {
    setSeen(props);
    setOverrides({});
  }
  const values = { ...controlDefaults, ...props, ...overrides } as ControlValues;
  const set = <K extends keyof ControlValues>(key: K, value: ControlValues[K]) =>
    setOverrides((current) => ({ ...current, [key]: value }));
  return { values, set };
}

export interface ${cfg.exportName}Props extends Partial<ControlValues> {
  theme?: ${cfg.exportName}Theme;
  mode?: ${cfg.exportName}Mode;
  className?: string;
}

export default function ${cfg.exportName}({ theme = "default", mode = "light", className, ...props }: ${cfg.exportName}Props) {
${usesThemeHook ? `  const [liveMode, setLiveMode] = React.useState(mode);
  const [seenMode, setSeenMode] = React.useState(mode);
  if (seenMode !== mode) {
    setSeenMode(mode);
    setLiveMode(mode);
  }
  const modeContext = React.useMemo(() => ({ mode: liveMode, setMode: setLiveMode }), [liveMode]);
  const themed = themeProps(theme, liveMode);
  return (
    <ModeContext.Provider value={modeContext}>
    <ThemeContext.Provider value={themed}>
      <div {...themed} className={cn(` : `  const themed = themeProps(theme, mode);
  return (
    <ThemeContext.Provider value={themed}>
      <div {...themed} className={cn(`}"w-full text-(--hx-foreground) [:where(&,&_*)]:border-(--hx-border) [:where(&,&_*)]:outline-(--hx-ring)/50", className)}>
        <${demoFn} {...props} />
      </div>
    </ThemeContext.Provider>${usesThemeHook ? "\n    </ModeContext.Provider>" : ""}
  );
}

export {
  themeProps as getThemeProps,
${mainExports.map((e) => `  ${e.type ? "type " : ""}${e.local === e.alias ? e.local : `${e.local} as ${e.alias}`},`).join("\n")}
};
`;

let file = header + helpers + out + footer;
if (!/^import \* as React from "react"/m.test(file) && !/import React/.test(file)) file = file.replace(`"use client";\n\n`, `"use client";\n\nimport * as React from "react";\n`);

// ---------- prune unused top-level declarations ----------
function prune(src) {
  for (let pass = 0; pass < 30; pass++) {
    const sf = ts.createSourceFile("x.tsx", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const decls = [];
    for (const st of sf.statements) {
      const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (exported) continue;
      let names = [];
      if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) {
        if (st.name) names = [st.name.text];
      } else if (ts.isVariableStatement(st)) {
        names = st.declarationList.declarations.flatMap((d) => (ts.isIdentifier(d.name) ? [d.name.text] : []));
        if (names.length !== st.declarationList.declarations.length) continue;
      } else continue;
      if (names.length) decls.push({ st, names });
    }
    const refs = new Map();
    const exportNames = new Set();
    for (const st of sf.statements) if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) exportNames.add((el.propertyName || el.name).text);
    }
    const visit = (node, owner) => {
      if (ts.isIdentifier(node)) {
        const n = node.text;
        const parent = node.parent;
        const isDeclName = parent && (parent.name === node) && (ts.isFunctionDeclaration(parent) || ts.isVariableDeclaration(parent) || ts.isTypeAliasDeclaration(parent) || ts.isInterfaceDeclaration(parent) || ts.isClassDeclaration(parent)) && parent.parent && (parent.parent === sf || parent.parent.parent?.parent === sf);
        const isProp = parent && ts.isPropertyAccessExpression(parent) && parent.name === node;
        if (!isDeclName && !isProp) {
          if (!refs.has(n)) refs.set(n, new Set());
          refs.get(n).add(owner);
        }
      }
      ts.forEachChild(node, (c) => visit(c, owner));
    };
    for (const st of sf.statements) visit(st, st);
    const dead = decls.filter(({ st, names }) => names.every((n) => !exportNames.has(n) && ![...(refs.get(n) || [])].some((o) => o !== st)));
    if (!dead.length) {
      // drop unused import specifiers
      let changed = false;
      for (const st of sf.statements) {
        if (!ts.isImportDeclaration(st) || !st.importClause) continue;
        const ic = st.importClause;
        const keepNamed = ic.namedBindings && ts.isNamedImports(ic.namedBindings)
          ? ic.namedBindings.elements.filter((el) => [...(refs.get(el.name.text) || [])].some((o) => o !== st)) : null;
        const keepDefault = ic.name && [...(refs.get(ic.name.text) || [])].some((o) => o !== st);
        const keepNs = ic.namedBindings && ts.isNamespaceImport(ic.namedBindings) && [...(refs.get(ic.namedBindings.name.text) || [])].some((o) => o !== st);
        const origCount = (ic.name ? 1 : 0) + (ic.namedBindings ? (ts.isNamedImports(ic.namedBindings) ? ic.namedBindings.elements.length : 1) : 0);
        const newCount = (keepDefault ? 1 : 0) + (keepNamed ? keepNamed.length : 0) + (keepNs ? 1 : 0);
        if (newCount === origCount) continue;
        changed = true;
        const mod = st.moduleSpecifier.getText(sf);
        let text = "";
        if (newCount) {
          if (keepNs) text = `import * as ${ic.namedBindings.name.text} from ${mod};`;
          else {
            const parts = [];
            if (keepDefault) parts.push(ic.name.text);
            if (keepNamed?.length) parts.push(`{ ${keepNamed.map((el) => el.getText(sf)).join(", ")} }`);
            text = `import ${parts.join(", ")} from ${mod};`;
          }
        }
        src = src.slice(0, st.getStart(sf)) + text + src.slice(st.getEnd());
        break;
      }
      if (!changed) return src;
      continue;
    }
    dead.sort((a, b) => b.st.getStart(sf) - a.st.getStart(sf));
    for (const { st } of dead) src = src.slice(0, st.getFullStart()) + src.slice(st.getEnd());
  }
  return src;
}
for (const [from, to] of cfg.patches || []) {
  if (!file.includes(from)) throw new Error(`patch not found: ${from}`);
  file = file.split(from).join(to);
}
file = prune(file).replace(/\n{3,}/g, "\n\n");

const outDir = path.join(REPO, "src/components", cfg.slug);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.tsx"), file);

// ---------- remixer props from the controls schema ----------
// Constants the schema may reference, taken from the demo
let autoPrelude = "";
for (const f of cfg.demos) {
  const sf = ts.createSourceFile("d.tsx", read(f), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    const text = st.getText(sf);
    if (/^(export\s+)?const controls\b/.test(text)) break;
    const js1 = ts.transpileModule(text.replace(/^export\s+/, ""), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
    autoPrelude += `try { ${js1.replace(/^"use strict";\s*/, "").replace(/\b(const|let)\s+/, "var ")} } catch (e) {}\n`;
  }
}
const js = ts.transpileModule(`module.exports = ${controlsSrc}`, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function("module", "require", "React", (cfg.schemaPrelude || "") + "\n" + autoPrelude + "\n" + js)(mod, require, {});
const lit = (v) => JSON.stringify(v);
const rows = [
  `{ name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [${palettes.map((p) => `{ label: ${lit(p[0].toUpperCase() + p.slice(1))}, value: ${lit(p)} }`).join(", ")}] } }`,
  `{ name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } }`,
];
for (const [name, c] of Object.entries(mod.exports)) {
  const group = c.group || "Controls";
  const gid = group.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const type = c.type === "checkbox" ? "boolean" : c.type === "slider" ? "number" : "string";
  const control = c.type === "slider" ? "range" : c.type;
  let extra = "";
  if (c.type === "slider") extra = `, min: ${c.min}, max: ${c.max}, step: ${c.step}`;
  if (c.type === "select") extra = `, options: [${c.options.map((o) => `{ label: ${lit(o.label)}, value: ${lit(o.value)} }`).join(", ")}]`;
  if (c.type === "text" && c.placeholder) extra = `, placeholder: ${lit(c.placeholder)}`;
  const desc = (cfg.descriptions?.[name] || c.label).replace(/"/g, '\\"');
  rows.push(`{ name: ${lit(name)}, label: ${lit(c.label)}, type: "${type}", default: ${lit(c.value)}, description: "${desc}", remixer: { control: "${control}", group: "${gid}", groupTitle: ${lit(group)}${extra} } }`);
}
console.log(`${cfg.slug}: ${file.split("\n").length} lines, ${rows.length} props, tokens: ${used.join(" ")}`);

// ---------- demo page ----------
if (cfg.title) {
  cfg.subtitle = cfg.subtitle.replace(/'/g, "\u2019");
  const demoDir = path.join(REPO, "src/app/(marketing)/demo", cfg.slug);
  fs.mkdirSync(demoDir, { recursive: true });
  fs.writeFileSync(path.join(demoDir, "page.tsx"), `import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";

export default function Page() {
  return <DemoContent />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("${cfg.slug}");
}
`);
  fs.writeFileSync(path.join(demoDir, "DemoContent.tsx"), `"use client";

import ${cfg.exportName}, { getThemeProps, type ${cfg.exportName}Theme, type ${cfg.exportName}Mode } from "@/components/${cfg.slug}";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="${cfg.slug}"
      category="components"
      render={(values) => (
        <${cfg.exportName} {...values} className="${cfg.panelClass || "p-[2vw] max-md:p-[5vw]"}" />
      )}
      props={[
${rows.map((r) => `        ${r},`).join("\n")}
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as ${cfg.exportName}Theme, values.mode as ${cfg.exportName}Mode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">${cfg.title}</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">${cfg.subtitle}</p>
              </SplitLine>
            </div>
            <div className="${cfg.width || "w-[60vw] max-md:w-full"}">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
`);
}
