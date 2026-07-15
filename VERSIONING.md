# Component Versioning & Updates — Implementation Plan

## The scenario this solves

A user runs `npx hyperiux add draggable-marquee` today. Two months later
you (the provider) ship a fix/rewrite to `draggable-marquee` in this repo.
The user has no way to know that happened, and no safe way to pull it in
without risking their own edits to the file. This doc is the plan to fix
that.

Two repos are involved:

- **`hyperiux-pro-components`** (this repo) — the registry source of truth
  (`registry/effects/**/registry.json`) and the build script that turns it
  into what the CLI fetches (`apps/docs/scripts/build-registry.js` →
  `apps/docs/public/r/*.json`).
- **`hyperiux-components`** — the CLI package the user actually runs
  (`packages/cli/src/commands/*.js`, `packages/cli/src/utils/*.js`).

Every section below says which repo it belongs to.

---

## Command list

| Command | Repo/file it lives in | Mutates files? | Purpose |
|---|---|---|---|
| `hyperiux add <name>` | `packages/cli/src/commands/add.js` (existing, needs a small addition) | yes | Install. Now also writes a lockfile entry. |
| `hyperiux outdated` | `packages/cli/src/commands/outdated.js` (new) | no | List installed components that are behind the registry. |
| `hyperiux diff <name>` | `packages/cli/src/commands/diff.js` (new) | no | Show a unified diff between what's on disk and the latest registry version. |
| `hyperiux update [name]` | `packages/cli/src/commands/update.js` (new) | yes, guarded | Apply the update. Refuses to overwrite a file the user has edited unless `--force`. |
| `hyperiux status` | `packages/cli/src/commands/status.js` (new, optional) | no | Detect drift (edited/deleted files) independent of whether a registry update exists. |

Workflow for the user in the "2 months later" scenario:

```
npx hyperiux outdated              # see that draggable-marquee is behind
npx hyperiux diff draggable-marquee   # see exactly what changed
npx hyperiux update draggable-marquee # pull it in (or --force if they edited it)
```

---

## Part 1 — `hyperiux-pro-components` (this repo)

### 1.1 Add `version` to every `registry.json`

File: `registry/effects/**/*/registry.json` (one per component).

Add a `version` field (semver: patch = fix, minor = additive, major =
breaking) and an optional `changelog` array:

```json
{
  "name": "draggable-marquee",
  "version": "1.1.0",
  "changelog": [
    { "version": "1.1.0", "date": "2026-07-01", "summary": "Fixed momentum easing on fast drags", "breaking": false },
    { "version": "1.0.0", "date": "2026-02-10", "summary": "Initial release", "breaking": false }
  ],
  "...": "existing fields unchanged"
}
```

Start every existing component at `"1.0.0"` in a single migration pass.

### 1.2 Propagate `version`/`changelog` through the build script

File: `apps/docs/scripts/build-registry.js`.

Same pattern as the `tier` field (see the `registryItem` object around
where `tier` is written into the per-effect JSON) — add `version` and
`changelog` to that same object so they land in
`apps/docs/public/r/<slug>.json`. This is the only way the CLI (a separate
repo/process) can see the version — it only ever talks to the public
registry output or the authenticated pro API, never this repo directly.

### 1.3 Pro-effect API route needs the same fields

File: `apps/docs/src/app/api/cli/effects/[slug]/route.js` (the
authenticated route pro users hit). Confirm it reads `version`/`changelog`
from the same source (`registry.json` via `getEffectBySlug`/registry.js
helpers) and includes them in its response — pro installs go through this
route instead of the public JSON, so it needs the fields independently
included.

### 1.4 Bump `version` as part of your own edit workflow

Whenever you (or an agent) change a file under
`registry/effects/<category>/<name>/`, bump that component's `version` in
the same commit. Worth adding a checklist line to
`developer-new-component.md` for this.

---

## Part 2 — `hyperiux-components` (CLI repo)

### 2.1 Lockfile format and utility

New file: `packages/cli/src/utils/lockfile.js`.

Written to the user's project root as `hyperiux.lock.json` (sibling to
their existing `hyperiux.json` config, same directory `config.js` already
resolves via `getConfigPath`/`configExists`):

```json
{
  "components": {
    "draggable-marquee": {
      "version": "1.0.0",
      "installedAt": "2026-04-12T10:00:00.000Z",
      "files": {
        "src/components/effects/draggable-marquee/index.jsx": "sha256:abc...",
        "src/components/effects/draggable-marquee/DraggableMarqueeComp.jsx": "sha256:def..."
      }
    }
  }
}
```

Functions needed: `readLockfile(cwd)`, `writeLockfile(lock, cwd)`,
`upsertLockEntry(cwd, name, { version, files })`,
`getLockEntry(cwd, name)`. Hash each file's content with Node's built-in
`crypto` (`sha256`) at write time — this hash is what later tells `update`
whether the user edited the file since install.

### 2.2 `add.js` — write the lockfile entry on install

File: `packages/cli/src/commands/add.js`.

After the existing `filesSpinner.succeed("Files written successfully")`
block (around where `files` finishes writing), call
`upsertLockEntry(cwd, effectName, { version: registryItem.version, files: <hash each written file> })`.
`registryItem` already comes back from `fetchRegistry()` — just needs
`version` to actually be present on it, which Part 1.2/1.3 above provides.

### 2.3 `registry.js` — expose a "fetch latest metadata only" call

File: `packages/cli/src/utils/registry.js`.

`fetchRegistry()` already exists and returns the full item (including
`files`). `outdated` doesn't need file contents, just `version` — either
reuse `fetchRegistry()` as-is (simplest, slightly wasteful for pro items
since it may trigger the authenticated route) or add a lighter
`fetchRegistryVersion(name)` that hits the same endpoints but only reads
`version`/`changelog` off the response. Start with reusing
`fetchRegistry()`; optimize later if it's slow.

### 2.4 `outdated.js` (new command)

File: `packages/cli/src/commands/outdated.js`.

1. Read lockfile via `readLockfile(cwd)`.
2. For each locked component, `fetchRegistry(name)` and compare
   `lockEntry.version` to `registryItem.version` (use a small semver
   compare helper — `semver` is a fine dependency to add, or hand-roll a
   3-number comparator since your versions are plain `x.y.z`).
3. Print a table: name, installed version, latest version, bump type
   (patch/minor/major).

### 2.5 `diff.js` (new command)

File: `packages/cli/src/commands/diff.js`.

1. Look up the lock entry for `<name>` to get the list of installed file
   paths.
2. `fetchRegistry(name)` for the latest version, run through the existing
   `getRegistryItemFiles()` (already in `registry.js`) to get latest file
   contents.
3. For each file, read the on-disk content and diff it against the latest
   registry content. A small diff library (`diff` on npm) or shelling out
   to `git diff --no-index` against two temp files both work — `diff` npm
   package is simpler since it avoids requiring git.
4. Print with `chalk` (red `-` lines, green `+` lines), matching the
   existing CLI's visual style.

### 2.6 `update.js` (new command)

File: `packages/cli/src/commands/update.js`.

1. Resolve target list: named component, or every entry `outdated` would
   report if no arg given.
2. For each: re-hash the current on-disk file(s) and compare to the hash
   stored in the lockfile at install time.
   - **Hash matches** (user never touched it) → overwrite directly (reuse
     the same file-writing logic `add.js` uses — consider extracting that
     into a shared `writeInstallableFiles()` helper in
     `packages/cli/src/utils/install.js` so `add` and `update` share it
     instead of duplicating).
   - **Hash differs** (user edited it) → skip by default, print a warning
     + the diff from 2.5, require `--force` to overwrite anyway.
3. On success, call `upsertLockEntry()` again with the new version/hashes.
4. Before writing anything, if `git` is available and the repo is dirty
   (`git status --porcelain` non-empty), print a suggestion to commit
   first — don't block on it, just warn.

### 2.7 `status.js` (new command, optional)

File: `packages/cli/src/commands/status.js`.

Same hash-comparison logic as 2.6 step 2, but doesn't touch the registry
at all — just reports "edited since install" / "missing" / "unchanged"
per component. Useful on its own even before an update is available.

### 2.8 Wire the new commands into the CLI entrypoint

File: `packages/cli/src/index.js`.

Follow the exact pattern already used for `init`/`add`/`list` (see the
`.command("add")` block) — add `.command("outdated")`,
`.command("diff <name>")`, `.command("update [name]")`, and optionally
`.command("status")`.

---

## Suggested build order

1. **1.1 + 1.2 + 1.3** (this repo) — get `version` flowing end-to-end
   through the registry first. Nothing downstream works without this.
2. **2.1 + 2.2** (CLI repo) — lockfile + write-on-install. Ship this and
   let it sit for a bit so real installs start accumulating lock entries.
3. **2.4 (`outdated`)** — read-only, low risk, immediately useful once
   step 2 has been out for a while.
4. **2.5 (`diff`)** — also read-only, builds user trust before you give
   them a mutating command.
5. **2.6 (`update`)** — the risky one; ship last, once diff has proven the
   comparison logic is solid.
6. **2.7 (`status`)** — nice-to-have, do whenever.

## Open questions to settle before starting

- **Semver dependency**: add `semver` npm package to `packages/cli`, or
  hand-roll comparison since your version strings are always plain
  `major.minor.patch`?
- **Diff dependency**: use the `diff` npm package, or shell out to
  `git diff --no-index`? npm package avoids requiring git to be installed,
  but git output is more familiar to most devs.
- **Where does `hyperiux.lock.json` live** — repo root next to
  `hyperiux.json`? (Recommended — same discovery mechanism
  `configExists()`/`getConfigPath()` already uses.)
- **Should `hyperiux.lock.json` be gitignored or committed?** Recommend
  **committed** — it's the whole point of the feature; if it's
  gitignored, a teammate cloning the repo has no record of what's
  installed.
