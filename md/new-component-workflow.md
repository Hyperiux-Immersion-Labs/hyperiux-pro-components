# End-to-End Component Workflow

> **Status (checked 2026-11-02):** implemented in
> `apps/docs/scripts/component-ship.mjs` (commands `registry`, `codegen`,
> `update`, `revert`, `ship`). There is no npm script for it: run
> `node scripts/component-ship.mjs <command> ...` from `apps/docs/` (or
> `node apps/docs/scripts/component-ship.mjs ...` from the repo root; paths
> resolve from the script's own location either way). Sanity is not synced
> by any command in this pipeline. Effect content (summary, FAQ, code
> blocks) lives in Sanity; code blocks can be pushed to a Sanity *draft*
> separately with `npm run sanity:code:sync` (see
> [`component-workflow-tooling.md`](./component-workflow-tooling.md) Part 2),
> and publishing is always a manual step in Sanity Studio.

---

## Pipeline overview

```
Phase 0  Developer scaffold      component + demo page, wired to a shared LOCAL remixer component
   |                              (a scratch copy of the global Remixer Panel, used to try out
   |                              values/props before anything is final)
Phase 1  Registry sync            registry.json/package.json (props table, remixer sub-blocks,
   |                              changelog) written from what was settled on in Phase 0; files
   |                              copied into registry/effects/{category}/{slug}/; ONLY this
   |                              effect's public/r/{slug}.json is (re)built and public/r/index.json
   |                              is updated to add/refresh this effect's entry - no other effect's
   |                              public files are touched; this effect's dist tarball is re-packed
Phase 2  Codegen                  for ONE named effect only, in one step since both halves touch
   |                              the registry anyway: (a) rewrites the demo page's local-remixer
   |                              usage to the shared global Remixer Panel, carrying over the
   |                              finalized props/values; (b) re-syncs the registry-side files
   |                              (index.tsx, registry.json, package.json, and every other
   |                              distributable file) in registry/effects/{category}/{slug}/ so
   |                              they reflect the just-rewired demo/component; (c) writes a JSX
   |                              copy into a local codegen/{slug}/ folder for Sanity - only when
   |                              the `codegen` command itself is run, never from update/ship.
Phase 3  Rollback-on-failure      `ship` offers a revert if Phase 2 fails after Phase 1 already wrote
```

`update` re-runs Phases 1–2 together for one already-shipped effect whose
demo/component changed again later (see below) - the developer doesn't
walk through each phase by hand a second time.

---

## Phase 0 - Developer scaffold (manual)

- [ ] Component folder created at `apps/docs/src/components/{slug}/`,
  lowercase-hyphen name, `index.tsx` with a default export, accepts
  `className`, no hardcoded colors, no `@/` imports between own files.
- [ ] Preview page created at `apps/docs/src/app/(marketing)/demo/{slug}/page.tsx`.
- [ ] The preview page wires the component up to
  **`LocalRemixerDemo`** (`apps/docs/src/components/local-remixer/`) - a
  single shared component, reused across every effect's demo, that wraps
  the same production `RegistryRemixerDemo`/`RemixerPanel` machinery every
  shipped demo uses, but takes a draft `{ name, props, remixer }` object
  literal written directly in the demo file instead of an imported
  `registry.json` (which doesn't exist yet for a brand-new component).
  Same controls, same UI, same behavior as the real thing - just fed from
  local draft state instead of a shipped registry entry.
- [ ] The developer iterates using the local remixer until the
  props/defaults/ranges are settled. Those settled values are what Phase 1
  turns into `registry.json`'s `props` array, and what Phase 2 later wires
  the *global* Remixer Panel to. Write the `props={[...]}` array as a
  plain inline literal on the `<LocalRemixerDemo>` tag; see the Phase 1
  note on what the script can and can't read.

No automated check today - this is groundwork before Phase 1 runs.

---

## Phase 1 - Registry sync (effect-scoped public/r rebuild)

```bash
# brand-new component (no registry.json for the slug yet)
node scripts/component-ship.mjs registry --slug {slug} --category {c} --tier {t} --title "..." --description "..."
# already-shipped component
node scripts/component-ship.mjs registry --slug {slug} --bump patch|minor|major --summary "..."
# new component vs existing is auto-detected from whether a registry.json already exists for the slug
```

What it does:
- Requires `apps/docs/src/components/{slug}/` to exist. For a new
  component it refuses to touch an existing `registry/effects/{category}/{slug}/`
  folder unless `--overwrite` is passed. For an existing one it requires
  `--bump`, `--version x.y.z` or `--no-version-bump`, plus `--summary`
  whenever the version changes.
- Discovers the component's distributable files, detects dependencies and
  the export name/kind.
- Writes `registry.json` - including the `props` array with a `remixer`
  sub-block per prop (drafted from what was settled on with the Phase 0
  local remixer) and a `changelog` entry for this version. `remixer.enabled`
  is set to `true` only when at least one drafted prop has a
  `remixer.control`.
- **How props are drafted (new components only).** `detectPropsFromLocalRemixer`
  finds the first `.tsx`/`.jsx` file under the demo folder that mentions
  `LocalRemixerDemo`, regex-matches the `props={[ ... ]}` attribute on the
  `<LocalRemixerDemo>` tag, and evaluates that array text with
  `new Function`. It is not a TypeScript/JSX parser and has no access to the
  file's scope, so the array must be a self-contained plain JS literal.
  Props built through helper functions (e.g. `props={[colorProp("tint"), ...]}`),
  variables or imported constants (`props={DRAFT_PROPS}`, `...sharedProps`),
  or TypeScript-only syntax (`as const`, type annotations) are **not** picked
  up: evaluation fails or the match is skipped, and the effect ships with
  `props: []` and `remixer.enabled: false`. There is no warning; the only
  sign is that the output lacks the "props (N) drafted from LocalRemixerDemo
  usage" line. If that happens, inline the literal and re-run with
  `--overwrite`, or fill in `registry.json`'s `props` by hand. For an
  existing component the `props`/`remixer` already in `registry.json` are
  kept as they are and are not redrafted from the demo.
- Writes `package.json` (version follows the registry version unless
  `--package-version` is passed).
- Copies the distributable files into `registry/effects/{category}/{slug}/`,
  with `// Built using Hyperiux Vault: https://vault.hyperiux.com` inserted
  as the first line of every distributable code file (`.ts`/`.tsx`/`.js`/
  `.jsx`/`.css`) - added if the source file doesn't already start with it,
  left as-is if it does (so re-running `registry`/`update` doesn't stack
  duplicate headers). An import of `usePrefersReducedMotion`/
  `prefersReducedMotion` from `@/lib/motion` is replaced in the copy with an
  inlined `matchMedia` version, since `@/lib/motion` isn't shipped.
- Updates the single entry for this slug in root `registry/index.json`
  (adds it if new, replaces it if existing - other entries untouched).
- Free-mirror sync into `../hyperiux-components` if `tier: "free"`: the
  registry folder is copied to
  `../hyperiux-components/registry/effects/{category}/{slug}/` (override with
  `--free-repo-path`, skip with `--skip-free-mirror`). The mirror's own
  `registry/index.json` is not updated.
- **Rebuilds `public/r` scoped to this effect only:** regenerates
  `public/r/{slug}.json` for this effect, and updates just this effect's
  entry inside `public/r/index.json` (add if new, refresh if existing).
  It does **not** re-run a full `build:registry` pass over every effect -
  only this slug's public JSON and this slug's entry in the shared index
  file are touched. Skip with `--skip-public-rebuild`.
- Re-packs this effect's tarball (`npm pack` in the registry folder, moved
  into `registry/dist/`) and refreshes its entry in
  `registry/dist/registry-index.json`. Skip with `--skip-tarball`.
- Follows the same source rule as the full `npm run build:registry`
  (see `apps/docs/NO_ANONYMOUS_INSTALLS.md`): free code files get the
  one-line sign-in stub as `content`, pro files get no `content`, so no
  effect's source is published in `public/r`. The full build also emits
  `importPath`, `fixedText` and `undocumentedProps`, which the scoped
  rebuild leaves out, so run `npm run build:registry` before committing
  `public/r` if those fields matter for the effect.

Stops the pipeline on failure; Phase 3 can revert what this phase wrote if
a later phase fails. `--dry-run` stops this phase before any write.

---

## Phase 2 - Codegen (global-remixer swap + registry re-sync + local JSX handoff, one effect only)

```bash
node scripts/component-ship.mjs codegen --slug {slug}
```

**Always scoped to exactly the one `--slug` passed in.** Never reads,
writes, or deletes anything belonging to any other effect.

Merged into one step because (b) and (a) both end up touching the
registry for the same effect - no reason to split them into two phases
that would each re-sync the same files:

1. **Swap to the global remixer.** Rewrites the demo page created in
   Phase 0: removes the local-remixer wiring, replaces it with the shared,
   production **global Remixer Panel** component (the same one every other
   effect's demo page uses), carrying over the finalized props/values/
   ranges the developer settled on with the local remixer - now also
   present in `registry.json`'s `props` from Phase 1 - so the global
   Remixer Panel reads the same values from `registry.json` instead of
   local demo-page state. The demo page that ships never contains the
   local remixer. Concretely (best-effort text rewrite, review the result):
   in the first demo `.tsx`/`.jsx` that mentions `LocalRemixerDemo`, the
   `@/components/local-remixer` import becomes
   `import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo"`,
   the tag loses its `name`/`category`/`props`/`remixer` attributes and gains
   `registry={registry}` (other attributes such as `component`/`render` are
   kept), a parameterless `export default function X()` becomes
   `X({ registry }: any)`, and `page.tsx` gets an import of the effect's
   `registry.json` passed as `<DemoContent registry={...} />`. If no
   `LocalRemixerDemo` usage is found the swap is skipped.
2. **Registry-side re-sync - only if something actually differs.** Before
   writing anything, diffs the current source in
   `apps/docs/src/components/{slug}/` against what's already copied into
   `registry/effects/{category}/{slug}/`. If no file differs (ignoring the
   Vault header line, after the `@/lib/motion` inlining) and the detected
   dependencies, file list and export are unchanged, this step is a no-op -
   `registry.json`, `package.json`, and the copied files are left untouched,
   no version bump, no changelog entry. Otherwise only the differing files
   are recopied (same Vault-header insertion rule as Phase 1), and
   `registry.json` (`dependencies`, `files`), `package.json` and the root
   `registry/index.json` entry are rewritten, then this effect's
   `public/r` JSON and tarball are rebuilt. `props`, `remixer` and the
   version are never changed by this step.
3. **Local JSX handoff - explicit `codegen` runs only.** Writes each registry
   code file into `codegen/{slug}/`: the type-stripped `.jsx`/`.js` copy for
   pasting into Sanity, plus the original `.tsx`/`.ts` alongside it. Only files
   that changed are rewritten. This happens only when you run the `codegen`
   command itself - `update` and `ship` reuse the codegen step but never write
   this folder. `codegen/` is in `.gitignore`; delete `codegen/{slug}/` once
   Sanity is updated. (Removed on 2026-10-26, restored as opt-in on 2026-10-28.)

`codegen` has no dry-run mode: `--dry-run` is ignored and it writes
straight away.

---

## `update` - re-sync an already-shipped component

```bash
node scripts/component-ship.mjs update --slug {slug} --summary "..." (--bump patch|minor|major | --version x.y.z | --no-version-bump)
```

For a component that's already been shipped once, whose demo/component
code changed again later: `update` re-runs Phase 1 (registry sync,
effect-scoped `public/r` rebuild, tarball) and Phase 2 (global-remixer swap +
registry re-sync) together for that one effect, in one call. It fails if
the slug has no `registry.json` yet (use `registry`/`ship` for a new one).

- Scoped to the single `--slug` passed in - must not read, write, or
  delete anything belonging to any other component's registry entry,
  `public/r` files, or codegen output.
- One of `--bump`, `--version` or `--no-version-bump` is required;
  `--summary` is required whenever the version changes.
- The registry-sync half rewrites `registry.json` from the existing file:
  it keeps `props`, `remixer` and every other hand-authored field, and
  refreshes `version`, `dependencies`, `files`, `main`, export fields,
  `previewUrl`/`importPath`/`target`, plus a new changelog entry when the
  version changed. Changes to the demo's props are **not** picked up; edit
  `registry.json`'s `props` directly. The codegen half then only re-syncs
  the registry copy if anything still differs. It writes no `codegen/` folder.
- If the codegen half fails, `update` reports the failure but does not
  offer a revert (only `ship` does); use `revert` by hand.

---

## Phase 3 - Rollback on partial failure

If `ship`'s Phase 2 fails after Phase 1 has already written new
registry/version data, the script doesn't leave the repo half-shipped:

- Prompts once: "A later phase failed after the registry was already
  updated for `{slug}`. Revert the registry changes from this run? [y/N]"
  - and on yes runs the same restore as `revert --yes`.
- Never auto-reverts silently - always asks first.
- `revert` collects these paths for the slug: the registry folder, root
  `registry/index.json`, `public/r/{slug}.json`, `public/r/index.json`,
  `registry/dist/hyperiux-{slug}-*.tgz` and `registry/dist/registry-index.json`.
  It then `git restore`s the ones git tracks, as **whole files**: the shared
  index files go back to their committed state, so any other uncommitted
  changes in them are lost too.
- Untracked paths are skipped, not deleted. For a brand-new component
  (registry folder, public JSON and tarball never committed) the revert
  therefore only restores the shared index files; remove the new files by
  hand.
- Without `--yes`, `revert` only prints the paths it would restore.

---

## Command reference

All commands are `node scripts/component-ship.mjs <command> --slug {slug} [flags]`.

| Command | What it does |
|---|---|
| `registry` | Phase 1: create (`new`) or update (`sync`) the registry entry - props table, remixer sub-blocks, changelog; rebuilds only this effect's `public/r/{slug}.json`, this effect's entry in `public/r/index.json`, and this effect's tarball. |
| `codegen` | Phase 2: **requires `--slug`**, scoped to exactly that effect. Rewrites the demo to the global Remixer Panel, re-syncs that effect's registry-side files **only if they differ from source** (no-op otherwise). Writes the `codegen/{slug}/` JSX handoff folder - the only command that does. Never touches any other slug. |
| `update` | Re-runs `registry` + `codegen` together for one already-shipped `--slug` whose demo/component changed again. Diff-scoped like `codegen`. |
| `revert` | Standalone Phase 3: `git restore` the tracked distribution paths for a slug (prints them only, unless `--yes`). |
| `ship` | Runs Phase 1 (`registry`) then Phase 2 (`codegen`, without the `codegen/` folder) for a slug end to end, stopping on failure, offering `revert` if Phase 2 fails after Phase 1 wrote. |

Flags (all read by `parseCli`; `--no-x` sets `x` to false):

- `--slug` - required by every command.
- `--category`, `--tier free|pro`, `--title`, `--description` - required by
  `registry`/`ship` for a brand-new component; ignored for an existing one
  (category and tier come from its `registry.json`).
- `--bump patch|minor|major`, `--version x.y.z`, `--no-version-bump` - one is
  required by `registry`/`update`/`ship` on an existing component. For a new
  component `--version` sets the starting version (default `1.0.0`).
- `--summary` - changelog text (defaults to "Initial release" for a new
  component; required on an existing one when the version changes).
- `--date YYYY-MM-DD` (changelog date, default today), `--breaking`
  (changelog flag, defaults to true for `--bump major`).
- `--overwrite` - let `registry` replace an existing registry folder for a
  new slug.
- `--dependencies a,b`, `--main`, `--export-name`, `--export-kind`,
  `--package-version` - override auto-detection.
- `--dry-run` - `registry` (and so `ship`/`update`) stops before writing;
  `codegen` ignores it. With `ship --dry-run` on an existing component,
  Phase 2 still runs and writes.
- `--skip-public-rebuild`, `--skip-tarball` - skip the scoped `public/r`
  rebuild or the tarball re-pack.
- `--skip-free-mirror`, `--free-repo-path <path>` - free-tier mirror control.
- `--yes` - required for `revert` to actually restore.

There is no `--no-props-ok` flag; an effect with no props simply gets
`props: []`.

---

## Implementation notes (`component-ship.mjs`)

- Done: the effect-scoped `public/r` rebuild (`buildPublicEffect`) writes
  one `public/r/{slug}.json` and patches one entry into `public/r/index.json`
  instead of shelling out to the full `build:registry`. It writes the same
  sign-in stub for free code files as the full build; see the Phase 1 note.
- Done, with a narrow contract: the "settled values" are the inline
  `props={[...]}` array literal on `<LocalRemixerDemo>`, evaluated with
  `new Function` (see Phase 1). Helper-built, variable or TS-typed prop
  arrays are not read and come out as `props: []`.
- The shared local remixer component now exists at
  `apps/docs/src/components/local-remixer/LocalRemixerDemo.tsx` (barrel at
  `local-remixer/index.ts`) - a normal source component the developer
  imports into a demo page, not something `component-ship.mjs` generates.
  It wraps `RegistryRemixerDemo` from `remixer-panel/`, so Phase 2's
  automated swap just needs to replace the `LocalRemixerDemo` import/JSX
  with `RegistryRemixerDemo` reading from the real `registry.json`,
  carrying over the same `props`/`render`/`children`/`component` values.
- The `codegen/` output folder is written only by an explicit `codegen` run
  (`writeCodegenOutput` -> `codegen/{slug}/`, type-stripped `.jsx`/`.js` plus
  the original `.tsx`/`.ts`); `codegen/` is in `.gitignore`.
