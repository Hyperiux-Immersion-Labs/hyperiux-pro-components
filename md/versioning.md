# Versioning

Two docs, merged: how effect versioning works today, and the original plan that shipped
it. Both were written 2026-07-15 and neither had been updated since.

> **Audit status (2026-11-02):** re-checked against this repo and the sibling
> `hyperiux-components` checkout (CLI `hyperiux@1.2.0`). The data model (`registry.json`
> `version`/`changelog`, patch/minor/major, hand-rolled comparator in
> `packages/cli/src/utils/semver.js`, no `semver` dependency) is still accurate. The
> 2026-08-12 findings have been folded into Part 1 below:
>
> 1. **Lockfile now written.** `add.js` calls `upsertLockEntry()` after writing files,
>    so `outdated`/`versions`/`diff` work against real installs. Installs made with an
>    older CLI have no lock entry and stay invisible to those commands until re-added.
> 2. **No local-folder registry any more.** Neither `HYPERIUX_DEV_REGISTRY_PATH` nor
>    the old hardcoded `DEV_REGISTRY_PATH` exists. The CLI only talks to HTTP endpoints,
>    overridable with `HYPERIUX_REGISTRY_URL` / `HYPERIUX_APP_URL` / `HYPERIUX_API_URL`.
>    "Testing locally" below has been rewritten to match.
> 3. **Free-tier mirror sync is automated** by `component-workflow.mjs` and
>    `component-ship.mjs` (`syncFreeMirror()`, opt out with `--skip-free-mirror`). The
>    CLI no longer reads that mirror at all.
> 4. Still true: the `add` overwrite prompt never mentions `hyperiux diff`. (`outdated`
>    does point at `npx hyperiux diff <effect>` when something is behind.)
>
> Not a doc issue, but blocking: as of 2026-11-02 the working tree has unresolved
> stash-conflict markers in `apps/docs/scripts/component-ship.mjs`,
> `registry/index.json`, `apps/docs/public/r/index.json` and the `animated-faq`
> registry files, so the ship script and those JSON files won't parse until resolved.

---

## Part 1 - How versioning works today

*(formerly `effects-versioning.md`)*


How component versions work, how to bump one when you change a component,
and every CLI command involved - for both the provider side (this repo) and
the consumer side (a project that installed effects via the CLI).

**This doc also covers the local/dev testing setup.** Some of it (the URL
override env vars, the `npm link` step) only applies to local testing - see
the "When this goes to production" section at the bottom for the release
checks.

---

## Why this exists

Effects are installed by **copying source code** into a user's project
(`hyperiux add <effect>`) - not via `npm install`. Once that code is copied,
it's the user's own file; they may have edited it. When we later fix or
improve a component, there was previously no way for:

- **us** to signal "this component changed" in a structured way, or
- **the user** to find out their installed copy is behind, see what
  changed, or safely pull in the update without silently overwriting any
  edits they made.

That's what this system solves: every component has its own version
number, every install is recorded in a lockfile in the user's project, and
a few CLI commands let the user check what's outdated and see real diffs
before touching anything.

---

## The two repos involved

| Repo | Role |
|---|---|
| `hyperiux-pro-components` (this repo) | Source of truth. `registry/effects/**/registry.json` holds each component's metadata including `version`. `apps/docs/scripts/build-registry.js` compiles all of it into `apps/docs/public/r/*.json`: public metadata only (tier, `version`, `changelog`, dependencies, file paths), with no real source for any effect - free code files carry a sign-in stub. The actual code, free and Pro, is served only by the signed-in, metered route `apps/docs/src/app/api/cli/effects/[effectSlug]/route.js`. |
| `hyperiux-components` | Ships the `hyperiux` CLI (`packages/cli`) and `hyperiux-mcp-server` (`packages/mcp-server`). Also holds a mirror of the free effects at `hyperiux-components/registry/`, kept in sync automatically by this repo's component tooling (`syncFreeMirror()` in `component-workflow.mjs` / `component-ship.mjs`). The CLI itself does not read this mirror. |

---

## Data model

### `registry.json` (per component, in `registry/effects/{category}/{slug}/`)

Two fields matter for versioning, added on top of the existing schema
(see `developer-new-component.md` for the full field list):

```json
{
  "name": "link-button",
  "version": "1.0.1",
  "changelog": [
    { "version": "1.0.1", "date": "2026-07-15", "summary": "Removed an errant scale-150 class", "breaking": false },
    { "version": "1.0.0", "date": "2026-02-10", "summary": "Initial release", "breaking": false }
  ],
  "...": "rest of the existing fields unchanged"
}
```

- **`version`** - plain `major.minor.patch` (no ranges, no pre-release
  tags). Every component was migrated to start at `1.0.0`.
  - **patch** (`1.0.0` → `1.0.1`) - bug fix, however small. Even a
    one-character typo fix gets a patch bump - see "How small a change
    needs a bump" below.
  - **minor** (`1.0.0` → `1.1.0`) - new prop/feature, backward-compatible.
  - **major** (`1.0.0` → `2.0.0`) - breaking change (renamed/removed prop,
    changed behavior).
- **`changelog`** - array of `{ version, date, summary, breaking }`
  entries, newest first. Optional but strongly recommended - it's what a
  user sees context for when `diff`/`versions` tells them something
  changed.

**This never updates itself.** If you edit a component's code and forget
to bump `version` here, the registry will silently serve the new code
under the old version number, and no CLI command will ever detect it
changed.

### `hyperiux.lock.json` (per consumer project, written by the CLI)

```json
{
  "components": {
    "link-button": {
      "version": "1.0.1",
      "installedAt": "2026-07-15T09:28:30.838Z",
      "files": {
        "src/components/effects/link-button/index.jsx": "sha256:9b92245d..."
      }
    }
  }
}
```

Written/updated automatically by `hyperiux add`. Records the version that
was installed and a sha256 hash of every file as actually written to disk.
This is what future update tooling will use to tell "user never touched
this file" apart from "user edited it" before deciding whether it's safe
to overwrite.

---

## How small a change needs a version bump

**Any change at all** - there's no "too small to matter" threshold. The
whole point is that `outdated`/`diff` compare version numbers, not file
contents. If you skip bumping a "trivial" fix, it becomes permanently
invisible to everyone who already has the component installed - there's no
other mechanism that would ever surface it to them.

---

## Updating an existing component - step by step

The tooling does steps 2 and 4 for you. Edit the docs copy in
`apps/docs/src/components/{slug}/`, then sync it into the registry with a
bump:

```bash
cd apps/docs
node scripts/component-ship.mjs update --slug {slug} --bump patch|minor|major --summary "..."
# or --version x.y.z instead of --bump; --no-version-bump to sync without a bump
```

`component-ship.mjs` (`registry`/`update`/`ship`) and `npm run component:sync`
(`component-workflow.mjs`) both refuse to sync an existing component unless
you pass `--bump`, `--version` or `--no-version-bump`. When the version
changes, `--summary` is required and a `{ version, date, summary, breaking }`
entry is prepended to `changelog` (`breaking` defaults to true for
`--bump major`, override with `--breaking`/`--no-breaking`; `--date` overrides
today's date). See [`new-component-workflow.md`](./new-component-workflow.md)
and [`component-workflow-tooling.md`](./component-workflow-tooling.md) for all
flags.

By hand, the steps are:

1. **Edit the component's source** under
   `registry/effects/{category}/{slug}/`.
2. **Bump `version`** in that same folder's `registry.json` (patch/minor/major
   per the rules above), and add a `changelog` entry describing what
   changed.
3. **Rebuild the registry:**
   ```bash
   cd apps/docs
   npm run build:registry
   ```
   This regenerates every `apps/docs/public/r/*.json` from source. It's a
   full rebuild (all ~185 components), not just the one you changed - that's
   expected and correct, it's idempotent for everything else.
   (`component-ship.mjs` rebuilds just that effect's `public/r/<slug>.json`
   and its index entry itself, unless you pass `--skip-public-rebuild`.)
4. **If the component is free-tier**, the mirror in
   `hyperiux-components/registry/effects/{category}/{slug}/` must match.
   The tooling copies it automatically (`--skip-free-mirror` to opt out,
   `--free-repo-path` if the sibling checkout isn't at `../hyperiux-components`);
   only copy by hand if you bypassed the tooling.
5. **Verify** the built output actually has your change before moving on:
   ```bash
   python3 -c "import json; d=json.load(open('apps/docs/public/r/<slug>.json')); print(d['version'], d.get('changelog'))"
   ```

---

## Creating a new component

Same as the existing process in `developer-new-component.md`, with one
addition: every new `registry.json` must include `"version": "1.0.0"` from
the start. See that doc for the full walkthrough.

---

## Testing locally (this section changes for production)

The CLI has no local-folder mode. It always fetches over HTTP: public
metadata from `HYPERIUX_REGISTRY_URL` (default `https://vault.hyperiux.com/r`)
and code from the signed-in API at `HYPERIUX_API_URL`, which defaults to
`HYPERIUX_APP_URL` (default `https://vault.hyperiux.com`). To test against
this repo, run the docs app locally and point the CLI at it.

### One-time setup

```bash
cd hyperiux-components/packages/cli
npm link
```
Points the global `hyperiux` command at your local checkout instead of the
published npm package. Undo with `npm unlink -g hyperiux` when done.

### Every terminal session

```bash
# with `npm run dev` running in apps/docs (adjust the port if yours differs)
export HYPERIUX_APP_URL="http://localhost:3000"
export HYPERIUX_REGISTRY_URL="http://localhost:3000/r"
```
`HYPERIUX_REGISTRY_URL` makes `outdated`/`versions`/`list` read this repo's
built `public/r/*.json` (reflecting whatever you just built in step 3
above); `HYPERIUX_APP_URL` points `login`/`whoami` and, unless
`HYPERIUX_API_URL` is also set, the code-delivery API at your local server.
These overrides are for local testing only - a real user never sets them.

### Logging in

```bash
hyperiux login
```
Prints `${HYPERIUX_APP_URL}/cli-auth`, prompts for the CLI token generated
there (must start with `hpx_`), validates it against `/api/cli/validate` and
saves it to `~/.hyperiux/auth.json` (mode 0600). **Every** install needs this
now, free effects included: the API answers 401 `sign-in-required` without a
token. A `HYPERIUX_TOKEN` env var, if set, takes precedence over the saved
file.

---

## Command reference

Every command below is run as `hyperiux <command>` in a project that has
already run `hyperiux init`.

| Command | Mutates files? | Purpose |
|---|---|---|
| `hyperiux init [-y]` | yes (writes `hyperiux.json`) | Initialize Hyperiux config in a project. `-y`/`--yes` skips the interactive prompts and uses defaults. |
| `hyperiux add <effect> [-o] [-y] [--dry-run]` | yes | Install a component. Requires `hyperiux login` for every effect (free included); fetches the code from the signed-in API, installs missing npm dependencies, writes files, and records a `hyperiux.lock.json` entry (version + file hashes). `-o`/`--overwrite` skips the "files already exist" prompt and overwrites. `-y`/`--yes` skips prompts but never overwrites: if files already exist it lists them and exits with "re-run with --overwrite". `--dry-run` prints what would be installed without writing anything. |
| `hyperiux list` | no | List every effect available in the registry (not what's installed - see `versions` for that). |
| `hyperiux outdated` | no | Check every effect in `hyperiux.lock.json` against the public registry metadata (no sign-in needed, never counts as an install) and print **only** the ones that are behind, with the bump type (patch/minor/major), plus any it couldn't check. Up-to-date effects are summarized as a count, and it suggests `npx hyperiux diff <effect>` when something can be updated. Prints "All N installed effects are up to date." if nothing needs attention. |
| `hyperiux versions` | no | Full listing of **every** effect in the lockfile and its installed/latest version, regardless of whether it's outdated. Same public metadata source as `outdated`. |
| `hyperiux diff [effect]` | no | Show a colored line-by-line diff between what's on disk and the latest registry code. Omit the effect name to diff every effect in the lockfile. Fetches code through the signed-in API, so it needs `hyperiux login`. Context around unchanged blocks is trimmed (like `git diff`) so large files stay readable. |
| `hyperiux login` | writes `~/.hyperiux/auth.json` | Sign in (needed for every install). Prompts for an `hpx_` token, validates it against the API, saves it. |
| `hyperiux logout` | deletes `~/.hyperiux/auth.json` | Remove the saved token. |
| `hyperiux whoami` | no | Re-validates the saved (or `HYPERIUX_TOKEN`) token against `/api/cli/validate` and reports whether it's still valid, plus the token file path and a masked preview. |

All three version commands only know about effects that have a lock entry,
i.e. ones installed by a CLI version that writes the lockfile.

### Provider-side (this repo, not part of the `hyperiux` CLI)

| Command | Where | Purpose |
|---|---|---|
| `npm run build:registry` | `apps/docs/` | Rebuild `apps/docs/public/r/*.json` from every `registry/effects/**/registry.json`. Run this after any registry.json or component source edit - nothing is picked up automatically. |

### Recommended workflow for a user checking for updates

```bash
hyperiux outdated              # see what's behind, if anything
hyperiux diff <effect>         # review exactly what changed before touching files
hyperiux add <effect> --overwrite   # apply it, once you're satisfied with the diff
```

There is **no dedicated `update` command yet** - updating today means
reviewing the diff yourself and re-running `add --overwrite`. `outdated`
points at `hyperiux diff` when something is behind, but `add`'s own
"Overwrite existing files?" prompt does not mention `diff`. A guarded
`update` command (that refuses to overwrite a file
whose hash doesn't match what was originally installed, i.e. the user
edited it) is the natural next step but isn't built yet.

---

## When this goes to production

Update at that point:

- Unset the `HYPERIUX_*_URL` overrides from your own shell before testing a
  release - real users never set them; the CLI will resolve straight to the
  live site.
- Confirm the live domain the CLI defaults to is correct. The defaults now
  live in two places: `packages/cli/src/utils/urls.js` (`APP_URL`) and
  `packages/cli/src/utils/registry.js` (`REGISTRY_URL`). As of 2026-11-02
  both are `vault.hyperiux.com` - a previous bug had it hardcoded to
  `components.hyperiux.com`, which doesn't resolve to anything at all.
  Double-check this hasn't drifted again before a release.
- `npm link` is a local-only convenience; production users get the CLI via
  `npx hyperiux` / `npm install -g hyperiux`, which pulls the real published
  package.
- The `hyperiux-components/registry/` mirror is never published (the CLI
  package's `package.json` `"files"` whitelist only ships `src/commands`,
  `src/utils`, `src/index.js`, README and LICENSE) and the CLI doesn't read
  it. The component tooling still keeps it in sync, but nothing in the CLI's
  install or version flow depends on it.

---

## Part 2 - Original implementation plan (historical)

*(formerly `VERSIONING.md`, written before Part 1's system existed - kept for the
design rationale and the resolved open questions; superseded where it conflicts
with Part 1.)*

> **Status (2026-11-02):** 1.1-1.3 done. 2.1-2.5 done (`lockfile.js`, lockfile
> write in `add.js`, `outdated`, `diff`), plus an unplanned `versions` command and a
> metadata-only `fetchRegistryMetadata()` for 2.3. 2.6 (`update`) and 2.7 (`status`)
> not started. Open questions resolved: hand-rolled comparator
> (`utils/semver.js`), `diff` npm package, lockfile at the project root next to
> `hyperiux.json`.


## The scenario this solves

A user runs `npx hyperiux add draggable-marquee` today. Two months later
you (the provider) ship a fix/rewrite to `draggable-marquee` in this repo.
The user has no way to know that happened, and no safe way to pull it in
without risking their own edits to the file. This doc is the plan to fix
that.

Two repos are involved:

- **`hyperiux-pro-components`** (this repo) - the registry source of truth
  (`registry/effects/**/registry.json`) and the build script that turns it
  into what the CLI fetches (`apps/docs/scripts/build-registry.js` →
  `apps/docs/public/r/*.json`).
- **`hyperiux-components`** - the CLI package the user actually runs
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

## Part 1 - `hyperiux-pro-components` (this repo)

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
where `tier` is written into the per-effect JSON) - add `version` and
`changelog` to that same object so they land in
`apps/docs/public/r/<slug>.json`. This is the only way the CLI (a separate
repo/process) can see the version - it only ever talks to the public
registry output or the authenticated pro API, never this repo directly.

### 1.3 Pro-effect API route needs the same fields

File: `apps/docs/src/app/api/cli/effects/[effectSlug]/route.js` (the
authenticated route; it now serves free effects' code too, and its payload
comes from `buildEffectDeliveryPayload()` in `apps/docs/src/lib/registry.js`,
which includes `version`/`changelog`). Confirm it reads `version`/`changelog`
from the same source (`registry.json` via `getEffectBySlug`/registry.js
helpers) and includes them in its response - pro installs go through this
route instead of the public JSON, so it needs the fields independently
included.

### 1.4 Bump `version` as part of your own edit workflow

Whenever you (or an agent) change a file under
`registry/effects/<category>/<name>/`, bump that component's `version` in
the same commit. Worth adding a checklist line to
`developer-new-component.md` for this.

---

## Part 2 - `hyperiux-components` (CLI repo)

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
`crypto` (`sha256`) at write time - this hash is what later tells `update`
whether the user edited the file since install.

### 2.2 `add.js` - write the lockfile entry on install

File: `packages/cli/src/commands/add.js`.

After the existing `filesSpinner.succeed("Files written successfully")`
block (around where `files` finishes writing), call
`upsertLockEntry(cwd, effectName, { version: registryItem.version, files: <hash each written file> })`.
`registryItem` already comes back from `fetchRegistry()` - just needs
`version` to actually be present on it, which Part 1.2/1.3 above provides.

### 2.3 `registry.js` - expose a "fetch latest metadata only" call

File: `packages/cli/src/utils/registry.js`.

`fetchRegistry()` already exists and returns the full item (including
`files`). `outdated` doesn't need file contents, just `version` - either
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
   compare helper - `semver` is a fine dependency to add, or hand-roll a
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
   to `git diff --no-index` against two temp files both work - `diff` npm
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
     the same file-writing logic `add.js` uses - consider extracting that
     into a shared `writeInstallableFiles()` helper in
     `packages/cli/src/utils/install.js` so `add` and `update` share it
     instead of duplicating).
   - **Hash differs** (user edited it) → skip by default, print a warning
     + the diff from 2.5, require `--force` to overwrite anyway.
3. On success, call `upsertLockEntry()` again with the new version/hashes.
4. Before writing anything, if `git` is available and the repo is dirty
   (`git status --porcelain` non-empty), print a suggestion to commit
   first - don't block on it, just warn.

### 2.7 `status.js` (new command, optional)

File: `packages/cli/src/commands/status.js`.

Same hash-comparison logic as 2.6 step 2, but doesn't touch the registry
at all - just reports "edited since install" / "missing" / "unchanged"
per component. Useful on its own even before an update is available.

### 2.8 Wire the new commands into the CLI entrypoint

File: `packages/cli/src/index.js`.

Follow the exact pattern already used for `init`/`add`/`list` (see the
`.command("add")` block) - add `.command("outdated")`,
`.command("diff <name>")`, `.command("update [name]")`, and optionally
`.command("status")`.

---

## Suggested build order

1. **1.1 + 1.2 + 1.3** (this repo) - get `version` flowing end-to-end
   through the registry first. Nothing downstream works without this.
2. **2.1 + 2.2** (CLI repo) - lockfile + write-on-install. Ship this and
   let it sit for a bit so real installs start accumulating lock entries.
3. **2.4 (`outdated`)** - read-only, low risk, immediately useful once
   step 2 has been out for a while.
4. **2.5 (`diff`)** - also read-only, builds user trust before you give
   them a mutating command.
5. **2.6 (`update`)** - the risky one; ship last, once diff has proven the
   comparison logic is solid.
6. **2.7 (`status`)** - nice-to-have, do whenever.

## Open questions to settle before starting

- **Semver dependency**: add `semver` npm package to `packages/cli`, or
  hand-roll comparison since your version strings are always plain
  `major.minor.patch`?
- **Diff dependency**: use the `diff` npm package, or shell out to
  `git diff --no-index`? npm package avoids requiring git to be installed,
  but git output is more familiar to most devs.
- **Where does `hyperiux.lock.json` live** - repo root next to
  `hyperiux.json`? (Recommended - same discovery mechanism
  `configExists()`/`getConfigPath()` already uses.)
- **Should `hyperiux.lock.json` be gitignored or committed?** Recommend
  **committed** - it's the whole point of the feature; if it's
  gitignored, a teammate cloning the repo has no record of what's
  installed.
