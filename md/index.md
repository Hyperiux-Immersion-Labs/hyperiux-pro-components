# Docs index

Every markdown doc in this repo other than the root `README.md`, with what it covers and how far to trust it.
Last reconciled against the codebase 2026-11-02; each doc's own status callout has the specifics.

Five docs stay at repo root because tooling or contributors expect to find them there on sight; everything
else lives in this folder.

## At repo root

| File | What it is |
|---|---|
| [`README.md`](../README.md) | Public-facing overview: 185 effects (75 free, 110 pro) by category, CLI commands, architecture and contributing steps. Counts and lists match `registry/index.json` as of 2026-11-02. |
| [`AGENTS.md`](../AGENTS.md) | One-paragraph warning for AI coding agents that this repo's pinned Next.js has breaking changes vs. training data, pointing at `apps/docs/node_modules/next/dist/docs/`. Kept at root because AI tools look for it by exact filename. |
| [`CHANGE_GUIDELINES.md`](../CHANGE_GUIDELINES.md) | Four hard constraints for any change (don't touch UI, responsiveness, registry functionality, or unrelated code without asking first). Prescriptive, not descriptive. |
| [`CODING_STANDARDS.md`](../CODING_STANDARDS.md) | Code style rules (naming, file structure, GLSL conventions, CSS, React patterns), now in TypeScript and matched to how the code is actually written: desktop-first `max-lg:`/`max-md:` breakpoints, the ref-sync pattern alongside one setup effect for WebGL, and where `next/link`/`next/image` apply. |
| [`Installation-SyncUp.md`](../Installation-SyncUp.md) | Plan for install tracking and daily limits across web, CLI and MCP, with a status table: tracking tables, the `claim_install_slot` RPC, `install-limit.js`, the gated delivery routes and the admin Activity page are built; free-source stripping in `public/r` is in progress. See also `apps/docs/NO_ANONYMOUS_INSTALLS.md`. |

## In `md/`

### Building and shipping effects

| File | What it is |
|---|---|
| [`developer-new-component.md`](./developer-new-component.md) | Step-by-step guide for building and shipping a brand-new effect, source through CLI. |
| [`new-component-workflow.md`](./new-component-workflow.md) | The `component-ship.mjs` pipeline: local remixer scaffold, registry sync, codegen (global Remixer swap, registry re-sync, `codegen/<slug>/` JSX+TSX for the Sanity paste), `update`, `revert` and `ship`. Notes that props built through helper functions in a demo aren't picked up when drafting `registry.json`. |
| [`component-workflow-tooling.md`](./component-workflow-tooling.md) | Merged: the `component-workflow.mjs` plan (new/sync/rename/move/delete/diff/revert/verify) and the `sanity-code-sync.mjs` plan, both built. |
| [`versioning.md`](./versioning.md) | How effect versioning works (`registry.json` version/changelog, `component-ship.mjs` bump flags) and the original plan that shipped it. The CLI's `add` now writes the lockfile, so `outdated`/`versions`/`diff` work against new installs. |
| [`mcp-documentation.md`](./mcp-documentation.md) | Reference for the `hyperiux-mcp-server` package (tools, params, auth, client setup). Auth order is `HYPERIUX_TOKEN` first, then the saved login; source fetches need an account and count towards the daily install limit. |

### Remixer Panel

| File | What it is |
|---|---|
| [`remixer-panel.md`](./remixer-panel.md) | How the Remixer Panel (live prop controls on effect pages) works: the `registry.json` props/remixer shape, the implemented files in `remixer-panel/` and `local-remixer/`, supported control types and fields, and how demos wire `RegistryRemixerDemo`. Read by the `props-remixer-audit` agent. |
| [`effect-remixer-standards.md`](./effect-remixer-standards.md) | The rules every effect follows (`disabledWhen`, `hideWhenReducedMotion`, "Needs X on." wording, reduced-motion handling, `reducedMotionNote`), with counts recomputed from the registry on 2026-11-02. |
| [`remixer-effect-props.md`](./remixer-effect-props.md) | Generated snapshot of every effect's `registry.json` props (default, type, control, group, description, dependency flags). Regenerate it after adding or changing props. Read by the `props-remixer-audit` agent. |

### Dashboard and product plans

| File | What it is |
|---|---|
| [`admin-dashboard-audit.md`](./admin-dashboard-audit.md) | Engineering audit of the user/admin dashboards. The audit log, role filter, recipient search and comped-vs-paid handling are now done; health alerting and showing CLI token status to its owner are still open. |
| [`dashboard-analytics-plan.md`](./dashboard-analytics-plan.md) | Activity charts for the admin and user dashboards. Largely built (hand-built charts on `invoices` and `admin_audit_log`); deliverability, invitation funnel, CLI adoption and effect-view tracking are not. |
| [`auto-invite-csv-plan.md`](./auto-invite-csv-plan.md) | Daily automated CSV invite sender sharing the Resend-driven invite cap. Not started. |
| [`sections-templates-plan.md`](./sections-templates-plan.md) | Plan for Sections and Templates. Sections are not started; Templates are built on a different architecture (`template-demo/<slug>`, `mock-templates.js`, Razorpay plus template credits); the live preview on effect pages is built. |
| [`template-download-purchase-plan.md`](./template-download-purchase-plan.md) | Turning `template-demo/<slug>` into downloadable project zips behind credit or one-time-purchase access. Built (Phases A to F); the doc lists where it differs from the plan. |
| [`section-qc-checklist.md`](./section-qc-checklist.md) | BLOCK/WARN gate checklist a Section must clear before shipping. No Sections exist yet; not wired into tooling. |
| [`template-qc-checklist.md`](./template-qc-checklist.md) | BLOCK/WARN gate checklist a Template must clear before shipping, with notes on which fields actually exist today. Not wired into tooling. |

## Removed

Finished work, deleted 2026-11-02 (recoverable from git history): `RBAC-ADMIN-PLAN.md` (super admin/admin roles are built in `apps/docs/src/lib/admin.js`), `sample.md`, `md/typescript-migration-plan.md` (registry is 100% TypeScript), `md/effect-audit-reports.md`, `md/performance-changes.md`, `md/ai-catalogue-sanity-todo.md`, `md/phase-2-plan.md` and `md/shadcn-animated-migration-plan.md`.

Earlier: `PUBLISHING.md` (described a package that lives in the sibling `hyperiux-components` repo) and `LIVE_CONTROLS_PROPS.md` (superseded by `remixer-effect-props.md`).
