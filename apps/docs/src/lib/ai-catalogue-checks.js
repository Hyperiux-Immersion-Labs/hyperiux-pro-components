// Consistency checks for the AI component catalogue (/ai-components.json): the
// places where an effect's written guide (Sanity) disagrees with its registry
// entry (dependencies, documented props, install path), so an AI assistant
// reading the catalogue would hand out code that breaks.
//
// Pure - no app imports - so scripts/check-ai-catalogue.mjs can run it against
// any catalogue JSON (production, a preview, or a local build).

// Text the writers used as an internal reminder; never meant to ship
export const INTERNAL_NOTE = /verify the shipped component api|implementation guidance\. verify|before relying on exact props/i;

// Imports every project has, so they're never a missing dependency
const BUILT_IN = /^(react|react-dom|next)(\/|$)/;
// Props every component takes without documenting them
const IMPLICIT_PROPS = new Set(["className", "style", "children", "key", "ref", "id"]);
// Prop names that let a user set the text of a text effect
const TEXT_PROPS = /^(text|children|label|content|words|lines|title|heading|value|phrase|items)$/i;

const packageOf = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

function readImports(usage) {
  const imports = [];
  for (const [, clause, spec] of usage.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g)) {
    const defaultName = /^([A-Z][\w$]*)/.exec(clause.trim())?.[1] || null;
    imports.push({ spec, defaultName });
  }
  return imports;
}

// Attributes passed to <Name ...> in the usage snippet: [{ name, value }]
function readJsxProps(usage, componentName) {
  const props = [];
  const open = new RegExp(`<${componentName}(?=[\\s/>])([^>]*?)/?>`, "g");
  for (const [, attrs] of usage.matchAll(open)) {
    for (const [, name, value] of attrs.matchAll(/([A-Za-z_$][\w$-]*)(?:\s*=\s*("[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}))?/g)) {
      props.push({ name, value: value ?? null });
    }
  }
  return props;
}

const isStringLiteral = (value) => /^["']/.test(value || "") || /^\{\s*["'`]/.test(value || "");
const isNumberLiteral = (value) => /^\{\s*-?(0x[\da-f]+|\d[\d_.]*)\s*\}$/i.test(value || "");

/** Issues for one catalogue effect: [{ kind, message }] */
export function checkEffect(effect) {
  const issues = [];
  const add = (kind, message) => issues.push({ kind, message });
  const deps = new Set(effect.dependencies || []);
  const documented = new Map((effect.props || []).map((prop) => [prop.name, prop]));

  // Copy that was never meant to ship, and stray whitespace
  for (const [field, value] of Object.entries(effect)) {
    const texts = Array.isArray(value) ? value.filter((v) => typeof v === "string") : typeof value === "string" ? [value] : [];
    if (texts.some((text) => INTERNAL_NOTE.test(text))) add("internal-note", `"${field}" contains the internal "verify the shipped component API" note`);
  }
  for (const field of ["title", "summary"]) {
    const value = effect[field];
    if (typeof value === "string" && (value !== value.trim() || /\\n/.test(value))) add("whitespace", `${field} has leading/trailing spaces or a stray \\n`);
  }

  // Usage snippet vs the registry
  const usage = effect.usage || "";
  if (!usage) {
    add("no-usage", "no Usage Code block");
  } else {
    const imports = readImports(usage);
    for (const { spec } of imports) {
      if (spec.startsWith(".") || spec.startsWith("@/") || BUILT_IN.test(spec)) continue;
      if (!deps.has(packageOf(spec))) add("usage-import", `usage imports "${spec}", which isn't in its dependencies`);
    }

    const own = imports.find(({ spec }) => spec.startsWith("@/components/effects/"));
    if (own) {
      const pathSlug = own.spec.replace("@/components/effects/", "").split("/")[0];
      if (pathSlug !== effect.slug) add("import-path", `usage imports from "${own.spec}" but the CLI installs it at @/components/effects/${effect.slug}`);
    }

    const componentName = own?.defaultName;
    if (componentName) {
      for (const { name, value } of readJsxProps(usage, componentName)) {
        if (IMPLICIT_PROPS.has(name)) continue;
        const prop = documented.get(name);
        if (!prop) {
          add("undocumented-prop", `usage passes ${name}, which isn't a documented prop`);
          continue;
        }
        const type = String(prop.type || "").toLowerCase();
        if (type === "number" && isStringLiteral(value)) add("prop-type", `usage passes ${name} as a string, but it's documented as a number`);
        if (type === "string" && isNumberLiteral(value)) add("prop-type", `usage passes ${name} as a number (${value.slice(1, -1).trim()}), but it's documented as a string`);
      }

      const isText = effect.category?.id === "text";
      const settable = [...documented.keys()].some((name) => TEXT_PROPS.test(name));
      const passesChildren = new RegExp(`<${componentName}(\\s[^>]*[^/])?>[\\s\\S]*?</${componentName}>`).test(usage);
      if (isText && !settable && !passesChildren) add("no-text-prop", "a text effect with no documented text/children prop - users can't set the text");
    }
  }

  return issues;
}

/** Every effect with at least one issue: [{ slug, title, category, docsUrl, issues }] */
export function checkCatalogue(catalogue) {
  return (catalogue.effects || [])
    .map((effect) => ({
      slug: effect.slug,
      title: String(effect.title || effect.slug).trim(),
      category: effect.category?.name || effect.category?.id || "",
      docsUrl: effect.docsUrl,
      issues: checkEffect(effect),
    }))
    .filter((entry) => entry.issues.length > 0);
}
