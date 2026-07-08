# Developer Guide: Creating a New Vault Component

A concise, step-by-step guide from writing your first file to making the component installable via the CLI.

---

## How the System Works (Read This First)

There are two separate locations that matter:

| Location | Purpose |
|---|---|
| `apps/docs/src/components/{name}/` | Where you build and test the component on the docs site |
| `registry/effects/{category}/{name}/` | Where the final source lives for distribution |

You build in `src/components/`, then once it's ready, you copy the source into `registry/effects/` and wire up the metadata. The public-facing JSON files (`public/r/`) are always **auto-generated** — never touch them manually.

---

## Step 1 — Build the Component in `src/components/`

Create a folder inside `apps/docs/src/components/` named after your component using **lowercase hyphens only**.

```
src/components/
└── glitch-text/
    ├── index.jsx        ← main component (what gets distributed)
    └── Demo.jsx         ← optional: demo wrapper just for the docs site
```

**Naming rules:**
- Folder: `glitch-text` (lowercase, hyphens, no spaces or underscores)
- Main file: always `index.jsx`
- Sub-components: `PascalCase.jsx` (e.g. `GlitchLayer.jsx`)

**Code rules for `index.jsx`:**
- Use a **default export** — `export default function GlitchText()`
- Accept a `className` prop so users can override styles
- No hardcoded colors — use props with sensible defaults
- Between your own files, use relative imports (`"./GlitchLayer"`) not `@/` aliases

Test and iterate here until the component is working exactly as you want.

---

## Step 2 — Create the Docs Preview Page

Every component needs a live preview page so users can see it before installing.

**Create the page at:**
```
apps/docs/src/app/effects/{your-slug}/page.jsx
```

Inside this page, import your component from `@/components/{name}` and render a live demo. The page also calls `getEffectBySlug(slug)` to pull in metadata for the code panel and install instructions — this data comes from the registry you'll set up in the next steps, so you can come back and wire this up fully after Step 4.

---

## Step 3 — Copy Source into the Registry

Once the component is working, copy (not move) the distributable files into the private registry. The docs site keeps its copy in `src/components/`, and the registry gets its own clean copy.

**Registry path:**
```
registry/effects/{category}/{your-slug}/
```

**Which category?**

| Category | What belongs here |
|---|---|
| `text` | Text reveal, scramble, typewriter, split animations |
| `scroll` | Scroll-triggered effects, parallax, inertia |
| `cursor` | Custom cursors, trails, magnetic effects |
| `webgl` | Three.js scenes, shaders, WebGL canvases |
| `buttons` | Animated buttons, toggles, CTAs |
| `carousels` | Sliders, marquees, carousels |
| `components` | General UI (cards, modals, FAQs, accordions) |
| `navigation` | Navbars, menus, mobile drawers |
| `backgrounds` | Animated backgrounds, particles, grids |
| `loaders` | Page loaders, skeletons, spinners |
| `transitions` | Page/route transition animations |
| `others` | Anything that doesn't fit above |

**Copy only the files users need** — no Demo.jsx, no docs-site-only wrappers. If your component has sub-component files (e.g. `GlitchLayer.jsx`), copy those too.

---

## Step 4 — Create `registry.json`

This is the most important file. The build script reads this to generate everything else.

**Path:** `registry/effects/{category}/{slug}/registry.json`

**Required fields:**

| Field | What to put |
|---|---|
| `name` | Must match the folder name exactly — e.g. `"glitch-text"` |
| `type` | Always `"registry:component"` |
| `title` | Human-readable Title Case name — e.g. `"Glitch Text"` |
| `description` | One sentence describing what it does and when to use it |
| `category` | Exact category string from the table above |
| `tier` | `"free"` (anyone can install) or `"pro"` (subscribers only) |
| `dependencies` | Array of npm packages your component imports — e.g. `["gsap"]`. Empty array `[]` if none |
| `registryDependencies` | Array of other Hyperiux component slugs this depends on. Usually `[]` |
| `previewUrl` | The path of the docs page you created in Step 2 — e.g. `"/glitch-text"` |
| `main` | Entry file — always `"index.jsx"` |
| `exportName` | The component function name — e.g. `"GlitchText"` |
| `exportKind` | Always `"default"` since we use `export default function` |
| `importPath` | How users import it — e.g. `"@/components/effects/glitch-text"` |
| `target` | Where it installs in the user's project — e.g. `"src/components/effects/glitch-text"` |
| `files` | Array of every file to install. Each entry needs `path` (filename in your registry folder) and `target` (full path in user's project) |

**For multi-file components**, every sub-component file must have its own entry in the `files` array with the correct `target` path. If a file is missing here, users who install via CLI will get import errors.

---

## Step 5 — Create `package.json` (for NPM distribution)

**Path:** `registry/effects/{category}/{slug}/package.json`

Only three things matter here:
- `name` — must be `@hyperiux/{slug}` (e.g. `"@hyperiux/glitch-text"`)
- `version` — start at `"0.0.1"`, bump when you update
- `peerDependencies` — list `react` and any major packages like `gsap` or `framer-motion`

---

## Step 6 — Build the Public Registry

Run this from inside `apps/docs/`:

```bash
npm run build:registry
```

This script reads every `registry.json` in `registry/effects/`, processes them, and generates:
- `apps/docs/public/r/{slug}.json` — your component's public metadata
- `apps/docs/public/r/index.json` — the master index (updated automatically)

For **free** tier components, the full source code is embedded in the public JSON.
For **pro** tier components, only metadata is public — code is served via authenticated API.

> After running this, verify `public/r/{slug}.json` exists and `public/r/index.json` contains your component. If either is missing, check your `registry.json` for typos.

---

## Step 7 — Add to the Root Registry Index

Open `registry/index.json` at the monorepo root and add an entry for your component. Keep entries sorted alphabetically by `name`. The entry mirrors the key fields from your `registry.json` but uses full paths relative to the monorepo root.

---

## Step 8 — Add Slug Aliases (if needed)

If your component might be searched under an alternative name, or you're renaming an existing one, add an alias in:

```
apps/docs/src/lib/effect-slugs.js
```

Add an entry with the canonical `slug` and an array of `aliases`. The lookup system resolves any alias to the canonical slug automatically — useful for redirecting old URLs after a rename.

---

## Step 9 — Pack the NPM Tarball

From inside your registry component folder:

```bash
cd registry/effects/{category}/{slug}
npm pack
```

This creates `hyperiux-{slug}-{version}.tgz`. Move it to `registry/dist/`.

The tarball filename must follow: `hyperiux-{slug}-{version}.tgz`

When you update a component, always bump the `version` in `package.json`, delete the old tarball from `registry/dist/`, and re-pack.

---

## Checklist

### Source
- [ ] Component folder named in lowercase-hyphens
- [ ] `index.jsx` uses a default export (`export default function`)
- [ ] Accepts `className` prop
- [ ] Relative imports between own files (no `@/` aliases)
- [ ] No hardcoded colors or site-specific tokens

### Registry
- [ ] `registry/effects/{category}/{slug}/` folder created
- [ ] Distributable files copied in (no demo wrappers)
- [ ] `registry.json` created with all required fields
- [ ] `name` in `registry.json` matches folder name exactly
- [ ] All sub-component files listed in `files` array
- [ ] `package.json` created with correct `@hyperiux/{slug}` name

### Build
- [ ] `npm run build:registry` ran with no errors
- [ ] `public/r/{slug}.json` exists
- [ ] `public/r/index.json` includes the new component
- [ ] Entry added to `registry/index.json`

### Docs Site
- [ ] Preview page created at `src/app/effects/{slug}/page.jsx`
- [ ] `previewUrl` in `registry.json` matches that page path
- [ ] Alias added to `effect-slugs.js` if the component has alternate names

### Distribution
- [ ] `npm pack` run inside component folder
- [ ] `.tgz` moved to `registry/dist/`

---

## Things That Will Break It

- **Editing `public/r/` files manually** — always overwritten on next build
- **Named export instead of default** — always use `export default function` in `index.jsx`; the registry expects `exportKind: "default"`
- **`name` in `registry.json` not matching the folder name** — the slug will be wrong everywhere
- **Missing files in the `files` array** — users get import errors after installing
- **Using `@/` imports between your own files** — `@/` resolves to the user's project, not yours
- **Not bumping the version before re-packing** — old tarballs get silently overwritten
- **Forgetting to re-run `build:registry` after edits** — the docs site and CLI both read from `public/r/`, not the source
