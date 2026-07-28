# Sanity Code Sync Plan

This document plans an automation layer that keeps Sanity `effectCodeBlock`
content in sync with the registry source files for each component.

It is a plan only. No implementation code is included here.

## Goal

When a component is updated in:

```text
registry/effects/{category}/{slug}/
```

the matching code blocks in Sanity should be updated automatically, so the
effect detail page does not keep showing stale code copied manually into Sanity.

The sync should update the actual Sanity document, not override code locally in
the app. After a successful sync, opening the document in Sanity Studio should
show the new code inside the existing code block.

## Current System

The effect detail page renders content from Sanity in:

```text
apps/docs/src/app/(app)/effects/[slug]/effect-detail.jsx
```

Code blocks are rendered when `content.body` contains objects like:

```json
{
  "_type": "effectCodeBlock",
  "filename": "index.jsx",
  "language": "jsx",
  "code": "..."
}
```

The schema is defined in:

```text
hyperiux-vault/schemaTypes/effectContent.js
```

The current `effectCodeBlock` schema has:

- `code`
- `language`
- `filename`

There is no registry-source marker today. That means the first implementation
has to match Sanity code blocks to registry files by `filename`.

## Reference Script

There is an existing script:

```text
hyperiux-vault/upload-missing-content.py
```

It is useful only as a reference for Sanity mutation shape. It should not be
used directly for this workflow because:

- it is a markdown content seeder, not a registry code sync tool
- it uses broad `createOrReplace` document writes
- it does not understand registry file lists
- it contains a hardcoded Sanity token

New automation must use environment variables for credentials.

## Proposed Commands

Read-only diff:

```bash
npm run sanity:code:diff -- --slug immersive-full-screen-nav
```

Dry run sync:

```bash
npm run sanity:code:sync -- --slug immersive-full-screen-nav --dry-run
```

Real sync:

```bash
npm run sanity:code:sync -- --slug immersive-full-screen-nav --yes
```

Sync all changed code blocks for all registry components:

```bash
npm run sanity:code:sync -- --all --dry-run
```

Optional integration after the standalone command is trusted:

```bash
npm run component:sync -- \
  --slug immersive-full-screen-nav \
  --bump patch \
  --summary "Updated source" \
  --sync-sanity-code
```

The first implementation should keep Sanity sync separate from
`component:sync`. Sanity writes affect production CMS data and need their own
dry-run and review step.

## Why Not Use a Studio Agent as the Primary Workflow

It is technically possible to use a Claude/browser agent to update code through
Sanity Studio:

1. open Sanity Studio
2. search for the effect document
3. open each code block
4. paste the latest registry code
5. save/publish the document

That should not be the primary workflow for recurring code sync.

Reasons:

- Studio UI automation is brittle; layout changes, focus issues, modals,
  loading states, or login/session problems can break it.
- Large code blocks are easy to paste incompletely or into the wrong field.
- It is harder to produce a reliable diff before writing.
- It is harder to test in fixtures.
- It is harder to guarantee that only `effectCodeBlock.code` changed.
- It may accidentally touch text, SEO, CTA, FAQ, or manual example blocks.
- It depends on browser state instead of explicit credentials and API calls.

The primary sync should be a deterministic Sanity API command:

- fetch the exact `effectContent` document
- compare registry files to Sanity code blocks
- print a dry-run diff
- patch only intended code fields
- preserve all other body content
- require `--yes` for mutation

An agent can still help with one-time editorial cleanup:

- fixing old documents whose code blocks have missing or wrong filenames
- deciding which missing registry files should become visible code blocks
- tagging blocks with future metadata like `source: "registryFile"`
- reviewing diff output before a real sync

Use an agent for messy migration/review work. Use the API command for repeatable
sync.

## Required Environment

The command should fail unless these are available:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
```

The token must have permission to update `effectContent` documents.

Do not hardcode tokens in scripts.

## Matching Strategy: First Version

For a given slug:

1. Find the component in the registry.
2. Read its `registry.json`.
3. Read `registry.json.files`.
4. For each non-asset file entry, read:

   ```text
   registry/effects/{category}/{slug}/{files[].path}
   ```

5. Fetch the Sanity document:

   ```groq
   *[_type == "effectContent" && effectSlug == $slug][0]
   ```

   Category slug can be included as an extra guard when available:

   ```groq
   *[
     _type == "effectContent" &&
     effectSlug == $slug &&
     categorySlug == $category
   ][0]
   ```

6. Walk `body`.
7. Find top-level `_type: "effectCodeBlock"` blocks.
8. Match each block by `filename`.
9. If `block.filename` equals a registry file path or basename, compare
   `block.code` with the registry file content.
10. Patch only changed matching blocks.

Example:

```text
Sanity body block filename: index.jsx
Registry file path: index.jsx
```

This updates:

```json
{
  "_type": "effectCodeBlock",
  "filename": "index.jsx",
  "code": "old code"
}
```

to:

```json
{
  "_type": "effectCodeBlock",
  "filename": "index.jsx",
  "code": "new registry code"
}
```

The same Sanity block remains in place. Only its `code`, and optionally
`language`, are updated.

## What Diff Should Print

For one slug, `sanity:code:diff` should print:

- registry category
- registry version
- Sanity document id
- registry files discovered
- Sanity code block filenames discovered
- matching blocks
- changed blocks
- missing Sanity blocks for registry files
- stale Sanity blocks with no matching registry file
- skipped blocks with no filename
- whether the command would require `--create-missing`

Example output shape:

```text
sanity:code:diff

component:
navigation/immersive-full-screen-nav@1.1.1

sanity document:
effect-content-immersive-full-screen-nav

matching blocks:
- index.jsx changed
- CustomNavbar.jsx unchanged
- FullscreenNav.jsx changed

missing sanity blocks:
- useFocusTrap.js

stale sanity blocks:
- old-helper.jsx

skipped:
- code block without filename at body[7]
```

## Sync Behavior

Default behavior:

- update only existing matching `effectCodeBlock` blocks
- match by exact `filename` first
- allow basename match only if it is unambiguous
- preserve `_key`
- preserve block order
- preserve text, image, FAQ, CTA, SEO, and manual content
- preserve unknown fields on each code block
- update `code`
- update `language` only when missing or when `--sync-language` is passed

The command should not create missing code blocks by default.

To create missing code blocks:

```bash
npm run sanity:code:sync -- \
  --slug immersive-full-screen-nav \
  --create-missing \
  --yes
```

When `--create-missing` is passed, missing registry files should be appended to
the body after the last existing `effectCodeBlock`. If no code blocks exist,
they should be appended to the end of `body`.

## Patch Shape

The command should avoid replacing the whole document.

Preferred mutation:

1. Fetch the document.
2. Build a new `body` array in memory with only intended code changes.
3. Send a patch for the `body` field:

```json
{
  "mutations": [
    {
      "patch": {
        "id": "effect-content-immersive-full-screen-nav",
        "set": {
          "body": []
        }
      }
    }
  ]
}
```

This replaces the body array, but leaves all other document fields untouched.
Because Sanity array patching individual nested objects by `_key` can be more
fragile, replacing `body` is acceptable only if the command preserves every
existing non-code block exactly.

The diff output should show a summary before any mutation.

## Safety Rules

- Default to dry-run behavior unless `--yes` is passed.
- `--dry-run` and missing `--yes` should never write to Sanity.
- Never use `createOrReplace` for existing documents.
- Never touch documents whose `_type` is not `effectContent`.
- Never update code blocks without a filename unless an explicit mapping is
  provided later.
- Never overwrite stale Sanity blocks that do not match registry files.
- Fail on ambiguous basename matches.
- Fail if multiple Sanity documents match the same slug/category.
- Fail if `SANITY_API_TOKEN` is missing.
- Print the Sanity document id before mutation.
- Print the number of changed blocks after mutation.

## Pro Component Security Note

Pro source code is already stored in this private repo. Syncing Pro source into
Sanity means Sanity also becomes a source-code store.

The app currently redacts locked code server-side before sending props to the
client. That protects browser output, but Sanity access permissions must also be
treated as source-code access.

Before syncing Pro source, verify:

- only trusted team members can read/edit these Sanity documents
- public APIs do not expose raw `body.code`
- Sanity tokens used by CI or local scripts are write-scoped and not committed

## Future Schema Improvement

The safer long-term model is to add registry metadata to `effectCodeBlock`:

```js
source: "manual" | "registryFile"
registryFile: "index.jsx"
```

Then the sync command can update only blocks where:

```js
source === "registryFile"
```

This avoids accidentally updating hand-authored example code that happens to use
the same filename.

Suggested future schema fields:

```js
defineField({
  name: 'source',
  title: 'Code Source',
  type: 'string',
  initialValue: 'manual',
  options: {
    list: [
      {title: 'Manual', value: 'manual'},
      {title: 'Registry File', value: 'registryFile'},
    ],
  },
})

defineField({
  name: 'registryFile',
  title: 'Registry File',
  type: 'string',
})
```

The first implementation can work without this schema change, but should be
written so it can use these fields later when they exist.

## Test Plan

Unit tests with fixture Sanity documents should cover:

- matching `filename` to registry `files[].path`
- exact path match beats basename match
- basename match fails when ambiguous
- missing code blocks are reported
- stale code blocks are reported
- no-filename code blocks are skipped
- manual/non-code body blocks are preserved exactly
- changed code updates only `code`
- `--create-missing` appends missing blocks
- dry run does not mutate

Integration-style tests should use a mocked Sanity HTTP endpoint or a fake
client object. They should not hit production Sanity.

## Open Decisions

1. Should the first version update all existing filename-matched blocks, or only
   blocks marked with a phrase/convention in `filename`?
2. Should missing registry files create new Sanity code blocks by default, or
   require `--create-missing`? Recommended: require `--create-missing`.
3. Should `language` always be derived from extension, or only filled when
   missing? Recommended: fill when missing.
4. Should `component:sync` call Sanity sync automatically? Recommended: no for
   the first implementation.
5. Should Pro code be synced to Sanity for every component, or only selected
   effects? Recommended: require explicit slug or `--all --include-pro`.

## Minimum Viable Version

Implement only:

```bash
npm run sanity:code:diff -- --slug slug
npm run sanity:code:sync -- --slug slug --yes
```

MVP behavior:

1. Read registry files for one slug.
2. Fetch one Sanity document by `effectSlug`.
3. Match top-level `effectCodeBlock` blocks by `filename`.
4. Update only changed matching `code` fields.
5. Preserve all other body content.
6. Print a clear diff before mutation.
7. Require `--yes` to mutate.
