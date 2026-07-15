# Component Versioning System

How component versions work, how to bump one when you change a component,
and every CLI command involved — for both the provider side (this repo) and
the consumer side (a project that installed effects via the CLI).

**This doc describes the local/dev testing setup.** Some of it (the
`HYPERIUX_DEV_REGISTRY_PATH` env var, the `npm link` step, the exact live
domain) will change once this is actually shipped to production — see the
"When this goes to production" section at the bottom for what to update
then.

---

## Why this exists

Effects are installed by **copying source code** into a user's project
(`hyperiux add <effect>`) — not via `npm install`. Once that code is copied,
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
| `hyperiux-pro-components` (this repo) | Source of truth. `registry/effects/**/registry.json` holds each component's metadata including `version`. `apps/docs/scripts/build-registry.js` compiles all of it into `apps/docs/public/r/*.json`, which is what gets served to the CLI (as static files for free effects, via an authenticated API route for pro effects). |
| `hyperiux-components` | Ships the `hyperiux` CLI (`packages/cli`). Also has its own **separate, manually-maintained mirror** of the free effects at `hyperiux-components/registry/` — used only so the CLI can be tested locally without hitting a live server. This mirror is not automatically kept in sync with this repo; see "Updating a component" below. |

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

- **`version`** — plain `major.minor.patch` (no ranges, no pre-release
  tags). Every component was migrated to start at `1.0.0`.
  - **patch** (`1.0.0` → `1.0.1`) — bug fix, however small. Even a
    one-character typo fix gets a patch bump — see "How small a change
    needs a bump" below.
  - **minor** (`1.0.0` → `1.1.0`) — new prop/feature, backward-compatible.
  - **major** (`1.0.0` → `2.0.0`) — breaking change (renamed/removed prop,
    changed behavior).
- **`changelog`** — array of `{ version, date, summary, breaking }`
  entries, newest first. Optional but strongly recommended — it's what a
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

**Any change at all** — there's no "too small to matter" threshold. The
whole point is that `outdated`/`diff` compare version numbers, not file
contents. If you skip bumping a "trivial" fix, it becomes permanently
invisible to everyone who already has the component installed — there's no
other mechanism that would ever surface it to them.

---

## Updating an existing component — step by step

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
   full rebuild (all ~115 components), not just the one you changed — that's
   expected and correct, it's idempotent for everything else.
4. **If the component is free-tier**, also update the mirror in
   `hyperiux-components/registry/effects/{category}/{slug}/` — copy the
   same source changes there and add the same `version`/`changelog` to
   that repo's `registry.json` too. This mirror is what the CLI reads when
   testing locally (see below); it is **not** auto-synced from this repo.
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

The CLI auto-detects it's running inside the `hyperiux-components` checkout
and reads from its **built-in** registry mirror
(`hyperiux-components/registry/`) or, for a closer-to-real test, from this
repo's actual built output via an env var override.

### One-time setup

```bash
cd hyperiux-components/packages/cli
npm link
```
Points the global `hyperiux` command at your local checkout instead of the
published npm package. Undo with `npm unlink -g hyperiux` when done.

### Every terminal session

```bash
export HYPERIUX_DEV_REGISTRY_PATH="/absolute/path/to/hyperiux-pro-components/apps/docs/public/r"
```
Tells the CLI to read component data from this repo's real built output
(reflecting whatever you just built in step 3 above) instead of its own
built-in mirror or the live production site. **This env var and the whole
"point at a local folder" mechanism only exists for local testing** — it
won't be set in a real user's environment.

Without it set, the CLI falls back to (in order): its own bundled
`hyperiux-components/registry/` mirror if present, then the real production
API.

### Logging in for pro effects

```bash
hyperiux login
```
Prompts for a CLI token (generated from the site's `/cli-auth` page),
validates it against the live API, and saves it to `~/.hyperiux/auth.json`.
Pro effects always fetch their actual code from the live authenticated API
regardless of the dev-registry override above — there is no local mock for
pro content.

---

## Command reference

Every command below is run as `hyperiux <command>` in a project that has
already run `hyperiux init`.

| Command | Mutates files? | Purpose |
|---|---|---|
| `hyperiux init [-y]` | yes (writes `hyperiux.json`) | Initialize Hyperiux config in a project. `-y`/`--yes` skips the interactive prompts and uses defaults. |
| `hyperiux add <effect> [-o] [-y] [--dry-run]` | yes | Install a component. Fetches from the registry, installs missing npm dependencies, writes files, and records a `hyperiux.lock.json` entry (version + file hashes). `-o`/`--overwrite` skips the "files already exist" prompt and overwrites. `-y`/`--yes` skips confirmation prompts (still shows the overwrite warning, just doesn't wait for input). `--dry-run` prints what would be installed without writing anything. |
| `hyperiux list` | no | List every effect available in the registry (not what's installed — see `versions` for that). |
| `hyperiux outdated` | no | Check installed effects against the registry and print **only** the ones that are behind (version mismatch), with the bump type (patch/minor/major). Effects that are up to date are summarized as a count, not listed individually. Prints "All N installed effects are up to date." if nothing needs attention. |
| `hyperiux versions` | no | Full listing of **every** installed effect and its version/status, regardless of whether it's outdated. Use this instead of `outdated` when you want to see everything, not just what needs attention. |
| `hyperiux diff [effect]` | no | Show a colored line-by-line diff between what's installed and the latest registry version. Omit the effect name to diff every installed effect. Context around unchanged blocks is trimmed (like `git diff`) so large files stay readable. |
| `hyperiux login` | writes `~/.hyperiux/auth.json` | Authenticate for Pro effect access. Prompts for a token, validates it against the live API, saves it. |
| `hyperiux logout` | deletes `~/.hyperiux/auth.json` | Remove the saved Pro token. |
| `hyperiux whoami` | no | Show whether you're currently logged in (does not re-validate the token against the API). |

### Provider-side (this repo, not part of the `hyperiux` CLI)

| Command | Where | Purpose |
|---|---|---|
| `npm run build:registry` | `apps/docs/` | Rebuild `apps/docs/public/r/*.json` from every `registry/effects/**/registry.json`. Run this after any registry.json or component source edit — nothing is picked up automatically. |

### Recommended workflow for a user checking for updates

```bash
hyperiux outdated              # see what's behind, if anything
hyperiux diff <effect>         # review exactly what changed before touching files
hyperiux add <effect> --overwrite   # apply it, once you're satisfied with the diff
```

There is **no dedicated `update` command yet** — updating today means
reviewing the diff yourself and re-running `add --overwrite`. `add` now
prints an explicit warning above the overwrite confirmation prompt
pointing at `hyperiux diff` first, specifically to guide users through this
same sequence. A guarded `update` command (that refuses to overwrite a file
whose hash doesn't match what was originally installed, i.e. the user
edited it) is the natural next step but isn't built yet.

---

## When this goes to production

Update at that point:

- Remove/ignore `HYPERIUX_DEV_REGISTRY_PATH` from your own testing habits —
  real users never set it; the CLI will resolve straight to the live API.
- Confirm the live domain the CLI defaults to
  (`packages/cli/src/utils/registry.js`, `add.js`, `login.js`, `config.js`)
  is correct. As of this doc, it's `vault.hyperiux.com` — a previous bug
  had it hardcoded to `components.hyperiux.com`, which doesn't resolve to
  anything at all. Double-check this hasn't drifted again before a release.
- `npm link` is a local-only convenience; production users get the CLI via
  `npx hyperiux` / `npm install -g hyperiux`, which pulls the real published
  package.
- The `hyperiux-components/registry/` local mirror is never published
  (confirmed via that package's `package.json` `"files"` whitelist) — it's
  purely a local dev fixture. Don't assume it needs to be kept in sync for
  anything other than local testing.
