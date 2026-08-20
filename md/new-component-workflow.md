# End-to-End Component Workflow

> **Status:** Implemented. This doc and `scripts/component-ship.mjs` are
> the complete, self-contained pair for this workflow — the script does not
> import or shell out to any other script in this repo. Everything it needs
> (registry sync, `public/r` build, props/changelog/remixer verification,
> Sanity content sync) is implemented directly inside `component-ship.mjs`.
>
> The three files this replaces conceptually — [`developer-new-component.md`](./developer-new-component.md),
> `scripts/component-workflow.mjs`, and `scripts/sanity-code-sync.mjs` — are
> left on disk for now and still work standalone, but they are no longer
> the source of truth for this pipeline and may be deleted later without
> affecting `component-ship.mjs`.

---

## Why this is needed (the gap today)

| Piece | Currently automated by | Currently verified by |
|---|---|---|
| Source files, `registry.json` core fields, `package.json`, root index, tarball | `component-workflow.mjs new/sync` | `component-workflow.mjs verify` |
| `props` table (with `remixer` sub-block per prop) | **nobody** — hand-typed in `registry.json` | **nobody** |
| `changelog` array | `component-workflow.mjs sync --bump` (writes it) | **nobody** checks it's non-empty/consistent |
| Effect-level `remixer` object (`enabled`, `layout`, `copyCode`) | **nobody** — hand-typed | **nobody** |
| Sanity `effectContent` code blocks (`code` / `tsxCode`) | `sanity-code-sync.mjs sync` | `sanity-code-sync.mjs diff` (read-only) |

So `verify` today can say "everything passed" for a component that has no
props table, no changelog entry matching its version, and a Sanity doc that
still has last month's source. The orchestrator closes that gap.

---

## Corrections vs. current code (found while verifying this doc)

Two places where `developer-new-component.md` (or an earlier draft of this
doc) doesn't match what the code actually does — `component-ship.mjs`
should follow the code, and `developer-new-component.md` should be
corrected separately:

1. **Main file extension is `.tsx`, not `.jsx`.** Every real component's
   `registry.json` (`registry/effects/**/registry.json`, all 260 of them)
   has `"main": "index.tsx"` — zero use `"index.jsx"`. `developer-new-component.md`
   still documents `index.jsx` as the convention; that's stale.
2. **Free-tier `public/r/{slug}.json` already embeds full source today** —
   this isn't something `component-ship.mjs` needs to add, it's existing
   behavior in `apps/docs/scripts/build-registry.js` (content kept for
   non-pro tiers, stripped for pro/paid). Called out explicitly here so
   Phase 2 verifies it rather than assuming it "just works."

---

## Pipeline overview

```
Phase 0  Preflight checklist   (does the component even have what it needs? auto-scaffold if not)
   |
Phase 1  Registry sync          (rebuilt in the new script: discover files, write registry.json/package.json,
   |                             copy into registry/effects/, update root index, free-mirror, build:registry)
Phase 2  Metadata verification  props / changelog / remixer sanity checks
   |
Phase 3  Sanity content sync    (rebuilt in the new script: diff -> sync, Sanity Viewer Token, draft-only)
   |
Phase 4  Rollback-on-failure    (auto-revert if a later phase fails after an earlier one already wrote)
   |
Done     final verify + summary report
```

Each phase can also be run standalone (`--only preflight`, `--only registry`,
`--only metadata`, `--only sanity`) for iterating on one piece without
re-running everything. Every phase is designed to be **idempotent** — safe
to re-run after fixing one issue without redoing already-correct work.

---

## Phase 0 — Preflight checklist

Reuses/extends the checklist already in `developer-new-component.md`, but
turns it into something the script checks programmatically instead of a
human reading a markdown list. New items are marked **NEW**.

**Source**
- [ ] Component folder in `apps/docs/src/components/{slug}/` exists, lowercase-hyphen name
- [ ] `index.tsx` has a default export, accepts `className`, no hardcoded colors
- [ ] No `@/` imports between own files
- [ ] Preview page exists at `apps/docs/src/app/(marketing)/demo/{slug}/page.js`

> **Correction vs. `developer-new-component.md`:** that doc says
> `index.jsx` as the main file. In practice every real component in the
> registry uses `.tsx` — a check of `registry/effects/**/registry.json`
> shows all 260 `main` fields are `"index.tsx"`, zero are `"index.jsx"`.
> `.jsx` only shows up for a handful of demo-only files. `component-ship.mjs`
> should treat `.tsx` as the expected main-file extension (still accepting
> `.jsx` for the rare exception), and `developer-new-component.md` should
> be corrected separately — it's currently stale against actual practice.

**Registry metadata**
- [ ] `registry.json` has all required fields (name/version/type/title/description/category/tier/dependencies/previewUrl/main/exportName/exportKind/importPath/target/files)
- [ ] **NEW** `props` array is present and non-empty (unless the component genuinely takes no props — allow `--no-props-ok` to acknowledge that explicitly rather than silently passing)
- [ ] **NEW** every prop intended to be user-tunable has a `remixer` sub-object (`control`, `group`, and `min`/`max`/`step` where numeric) — see `md/remixer-effect-props.md`
- [ ] **NEW** effect-level `remixer` object present (`enabled`, `layout`, `copyCode.includeOnlyPublicProps`) if `remixer.enabled !== false`
- [ ] **NEW** `changelog` array has at least one entry, and its first entry's `version` matches `registry.json`'s top-level `version`
- [ ] `package.json` exists with `@hyperiux/{slug}` name

**Free tier only**
- [ ] **HARD FAIL, not a warning** — if `tier: "free"` and the
  `../hyperiux-components` mirror repo path isn't reachable, Phase 0 stops
  the whole pipeline right here. `developer-new-component.md` already
  documents this as a hard requirement ("it won't be installable without
  auth" if skipped), so the script should never let it slide through as a
  warning that's easy to miss.

Output of this phase: a pass/fail report per checklist item, run *before*
touching any files — so a developer gets one clear list of what's missing
instead of the pipeline failing halfway through phase 1 or 2.

**Auto-scaffolding for the NEW items.** Rather than just failing when
`props`/`remixer` are missing, Phase 0 makes one attempt to draft them from
source before asking a human to fill anything in:
- Parse the main file's destructured props / TS prop types (reusing the
  same regex approach `component-workflow.mjs`'s `detectExportInfo` already
  uses for exports) into a draft `props` array with `name`/`type`/`default`
  pre-filled from source.
- Guess a `remixer.control` per prop from its type — `boolean` → `checkbox`,
  `number` → `range`, `string` → `text` (matches the actual control
  vocabulary used across the registry: `range`/`color`/`checkbox`/`select`/`text`
  — confirmed by grepping `registry/effects/**/registry.json`, not guessed).
- Write the draft straight into `registry.json` under a `"_draft": true`
  marker — no confirmation prompt for this write itself — so a human only
  has to *adjust* grouping/min/max/description rather than write the whole
  table from a blank page. The `_draft` marker stays until a human either
  edits the entry (Phase 2 can treat any human edit as implicit review) or
  explicitly clears it, and Phase 2's report calls out any props still
  marked `_draft` so they don't silently ship unreviewed.
- This scaffold is a best-effort starting point, not a substitute for
  Phase 2's validation — Phase 2 still runs against whatever ends up in
  `registry.json`, scaffolded or hand-written.

---

## Phase 1 — Registry sync

Called as part of the same `component-ship.mjs` process (not a shell-out to
`component-workflow.mjs`), reimplementing the same logic so it lives in one
script with one set of shared helpers:

```bash
node scripts/component-ship.mjs --slug {slug} --category {c} --tier {t} --title "..." --description "..."
# new component vs existing is auto-detected from whether a registry.json already exists for the slug
```

Behavior carried over from `component-workflow.mjs new`/`sync`: discover
distributable files → detect deps/exports → write `registry.json`/
`package.json` → copy into `registry/effects/` → update root
`registry/index.json` → free-mirror sync if tier is free → `build:registry`
(regenerates `public/r/{slug}.json` + `public/r/index.json`) → in-process
verify.

**Free tier: full source embedded in `public/r/{slug}.json`.** This is
already how `apps/docs/scripts/build-registry.js` behaves today (confirmed
in code, not just docs): when `tier` is `"pro"`/`"paid"` the build script
strips each file's `content` field from the public JSON so only metadata is
public (code is served through the authenticated API instead); for any
other tier (i.e. `"free"`) it keeps `content` in place, so the full source
ships in `public/r/{slug}.json`. `component-ship.mjs` doesn't need to
special-case this — it's a property of `build:registry`, which Phase 1
already calls — but Phase 2's report should confirm it explicitly for free
components (e.g. `public/r/{slug}.json` files[].content present: ✔) since a
missing `content` field on a free component would silently break installs
for anyone not authenticated.

The pipeline does **not** proceed to Phase 2 if this step fails or reports
drift, and if a later phase fails, Phase 4 can revert what this phase wrote
(see below) rather than leaving the repo half-updated.

---

## Phase 2 — Metadata verification (props / changelog / remixer)

This is the genuinely new piece — nothing today looks inside `props`,
`changelog`, or `remixer`. Built directly into `component-ship.mjs` as its
own internal verification step (not bolted onto the old `verify` command):

- **Props table**
  - `props[].name` matches an actual prop the component destructures/accepts (cross-check against source, same regex-based approach `detectExportInfo` already uses for exports)
  - Every prop has `type`, `default` (or explicit `"required": true`), `description`
  - Flag props in source with no `registry.json` entry (silent undocumented prop) and `registry.json` entries with no matching source prop (stale)
- **Remixer**
  - Every prop with a `remixer` block has a valid `control` type (cross-check against the control types documented in `md/remixer-panel.md`)
  - Numeric controls (`slider`, etc.) have `min`/`max`/`step`
  - If effect-level `remixer.enabled` is true, at least one prop must be remixable — otherwise the panel renders empty
  - `copyCode.includeOnlyPublicProps` referenced props actually exist
- **Changelog**
  - Top entry's `version` === `registry.json.version` (would have caught the "edited code without bumping version" failure mode `developer-new-component.md` already warns about)
  - No duplicate versions
  - `date` is a valid ISO date, not in the future
- **Free-tier public payload**
  - If `tier === "free"`, every entry in `public/r/{slug}.json`'s `files`
    array has a non-empty `content` field (matches `build-registry.js`'s
    actual behavior — content is only stripped for `pro`/`paid`)

This phase is pure validation — it never edits files. If it can't safely
auto-fix something, it reports and stops; a human fixes `registry.json` and
re-runs.

---

## Phase 3 — Sanity content sync

Runs after registry + metadata are confirmed good, since Sanity should only
ever receive code that's already correct in the registry. Reimplemented
in `component-ship.mjs` (same logic as `sanity-code-sync.mjs`, not a call
into that file), so the whole pipeline is one script with one shared set of
helpers.

1. **Token — Sanity Viewer Token.** The project already has a token named
   the **Sanity Viewer Token** that has been granted write access, so that's
   what this phase authenticates with (despite the "viewer" name). Resolution
   order:
   - If the `NEXT_PUBLIC_SANITY_VIEWER_TOKEN` env var is set, use it
     directly — enables non-interactive/CI runs.
   - Otherwise prompt interactively, masked like a password field. Never
     echo or log it, and never persist it to disk — used only for this run.
2. Run a `diff`-equivalent first and print the plan (changed/missing/stale
   blocks) for visibility before writing anything.
3. Push the update using the token resolved above. This carries over the
   TS→JSX split from `sanity-code-sync.mjs`'s `makeCodeFileEntry` /
   `stripTypesToJsx`: `.tsx`/`.ts` registry files get written to the
   Sanity block's `tsxCode` field as-is, and a type-stripped, JSX-only
   version goes into the `code` field via the TypeScript compiler
   (`transpileModule` with `jsx: "preserve"`). `.css`/`.json` files pass
   through unchanged with no `tsxCode`.
4. Sync stays **draft-only** (same guarantee as today) — nothing goes live
   until a human publishes in Sanity Studio. The final report says this
   explicitly so nobody assumes "synced" means "live."

---

## Phase 4 — Rollback on partial failure

If Phase 3 (or Phase 2) fails after Phase 1 has already written new
registry/version data, the script doesn't leave the repo half-shipped:
- Detects which tracked paths Phase 1 touched for this slug (registry
  folder, root index, `public/r/{slug}.json`, `public/r/index.json`, dist
  tarball).
- Prompts once: "Phase 3 failed. Revert the registry changes from this run
  for `{slug}`? [y/N]" — a `git restore` on just those tracked paths (the
  same mechanism `component-workflow.mjs revert` uses today) if confirmed.
- Never auto-reverts silently — this is the one place a failure could
  discard work, so it always asks first, matching the "confirm before
  destructive git operations" rule.

---

## Final report

One consolidated summary at the end, e.g.:

```
component:ship — glitch-text (text/pro)

Phase 0 preflight   ✔ all checks passed (props/remixer auto-scaffolded, review before commit)
Phase 1 registry    ✔ synced (v1.2.0 -> v1.3.0), tarball rebuilt
Phase 2 metadata    ✔ props (4), remixer (3 controls), changelog verified
Phase 3 sanity      ✔ drafts.abc123 updated (2 blocks changed, 0 created)
                      NOT published — publish manually in Studio when ready
Phase 4 rollback    – not needed (no failures)
```

Non-zero exit code if any phase fails, with the failing phase's detail
already printed above (no need to re-run to see why).

---

## Single entry point

One npm script drives the whole pipeline:

```bash
npm run component:ship -- --slug {slug} [--only preflight|registry|metadata|sanity] [--ci]
```

wired to `scripts/component-ship.mjs` — a **new file**, written from
scratch, that pulls in whatever logic is needed from
`developer-new-component.md` (as the checklist definition),
`component-workflow.mjs`, and `sanity-code-sync.mjs`, rather than shelling
out to the old scripts. The old three files are left untouched and still
work standalone for anyone who wants a single phase without the full
pipeline; `component-ship.mjs` is the new recommended path end-to-end.

---

## Command reference

All commands are `node scripts/component-ship.mjs <command> --slug {slug} [flags]`.
Every command works standalone against an existing component — you do not
need to have run `ship` first (resolved from the earlier open question:
yes, every phase is independently runnable).

| Command | What it does |
|---|---|
| `preflight` | Runs Phase 0 only: checklist + auto-scaffold missing `props`/`remixer` as `_draft`. |
| `registry` | Runs Phase 1 only: create (`new`) or update (`sync`) the registry entry, rebuild `public/r`. |
| `metadata` | Runs Phase 2 only: read-only verification of props/remixer/changelog/free-payload. |
| `sanity` | Runs Phase 3 only: diff + push to Sanity (prompts for token unless `NEXT_PUBLIC_SANITY_VIEWER_TOKEN` is set). |
| `revert` | Runs Phase 4 standalone: `git restore` the tracked distribution paths for a slug. |
| `ship` | Runs Phases 0 → 1 → 2 → 3 in order, stopping at the first failure, offering `revert` (Phase 4) on failure after Phase 1 has written. |

Common flags: `--slug` (required by every command), `--category`, `--tier`,
`--title`, `--description` (required by `registry` for a brand-new
component), `--bump patch|minor|major` or `--version x.y.z` (for `registry`
on an existing component), `--summary` (changelog entry text), `--dry-run`
(print the plan, write nothing), `--yes` (apply without an extra confirm
prompt, still required for `sanity` and `revert` specifically since those
are the two commands that touch state outside the local filesystem/git),
`--no-props-ok` (acknowledge a component intentionally has no props),
`--create-missing` (let `sanity` append blocks for registry files with no
matching Sanity block yet).
