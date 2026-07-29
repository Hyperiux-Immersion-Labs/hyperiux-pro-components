# Hyperiux Vault — Phase 2 Plan

*Internal planning · Rev. 4 (compressed for team-wide Claude Code)*

**2 / 19** items done · **4** waves · **~4–5** weeks estimated · **8** deferred to Phase 3

---

## Where the compression actually comes from

Five people each running Claude Code doesn't make every task 5x faster — it makes *repetitive, batchable-across-many-files* work compress hard, because the team can split 115 effects into parallel batches and process each one with assistance. It doesn't touch work that's bottlenecked by human review, not typing speed.

- **Compresses hardest:** typing all 115 effects, testing all 115 effects, the code-comments pass — all genuinely parallelizable across the team, batch by batch.
- **Compresses moderately:** the remixer panel, the registry/Sanity workflow tool, the admin dashboard — Claude Code speeds up writing and wiring the code, but these are single novel features that still need real iteration and testing, not a batch job.
- **Barely compresses:** Sanity content entry, comparison-page research and fact-checking, design. These are bottlenecked by a person deciding and reviewing, not by how fast code gets written.

## Before anything else

**Foundation gates the rest of the phase.** Six items below — props table, default image/text, published dates, changelog display, a11y badges, and the remixer panel itself — all read from the same registry + Sanity data. Right now that pipeline has a real crack in it: the documented free-effect build step in `hyperiux-components` is dead, and the registry's declared `files` array is silently ignored in favor of a directory scan. Building six features on top of that without fixing it first means fixing it six times, or shipping six things that quietly drift from each other.

- Fix the dead build step and the `files`-array inconsistency
- Ship a single scaffold command that creates the registry entry, runs the build, and drafts the matching Sanity document in one pass
- Design the props schema once — shared source for both the props table and the remixer's controls

## How the phase is sequenced

| Wave | Duration |
|---|---|
| Foundation | ~1 wk |
| Core | ~2.5 wk |
| Extended | ~1 wk |
| Design | TBD (parallel, non-blocking) |

Critical path Foundation → Core → Extended: **~4–5 weeks**. Design (Wave 4) runs alongside Core and Extended, not blocking either. The MCP Server stays at the tail of Extended, after Wave 1's registry fix has had time to prove out.

Wave 2's TypeScript and testing retrofits changed most: split across 2–3 people running Claude Code on parallel batches of effects, rather than one person working through 115 effects sequentially.

---

## Wave 1 — Foundation

| Item | Effort | Status |
|---|---|---|
| Unified registry + Sanity workflow | 2–3 days | — |
| Props schema design | 1 day | — |
| CI gate | ~~1 day~~ | ✅ Done |
| Extended linting | ~~1–2 days~~ | ✅ Done |

Registry workflow and props schema run in parallel with CI gate and linting — two tracks, not four sequential steps. That's the whole wave in about a week.

**CI gate + extended linting were estimated at 2–3 days combined — shipped in one session instead.** First real data point on how this compression model plays out in practice:
- CI gate: lint, test, and build run on every PR for both `apps/docs` and `hyperiux-vault`, verified green on GitHub's actual runners (not just locally) — [PR #17](https://github.com/Hyperiux-Immersion-Labs/hyperiux-pro-components/pull/17). Branch protection turned out to need a paid GitHub plan for a private repo (free-tier org, confirmed via the API) — deferred by choice, not blocked; the checks themselves are live and enforced by convention for now.
- Extended linting: found and fixed 2 real lint errors, wired the previously-unused Sanity Studio lint script, and made a deliberate call to keep ~70 new React-Compiler-rule warnings (`react-hooks/refs`, `set-state-in-effect`, `immutability`, `purity`) non-blocking rather than risk a blind fix across 39 animation/WebGL files — tracked in [issue #16](https://github.com/Hyperiux-Immersion-Labs/hyperiux-pro-components/issues/16) for a proper pass.

## Wave 2 — Core

| Item | Effort | Notes |
|---|---|---|
| Remixer panel + live prop controls | 4–5 days | Needs the props schema |
| Props table in Sanity | 1–2 days + ongoing | Needs the props schema; backfill runs alongside everything else |
| TypeScript, all 115 effects | ~1.5 wk | Infra first (1–2 days), then retype every existing effect, split across 2–3 people |
| Tests, all 115 effects | ~1 wk | Harness first (1–2 days), then a render + prop-contract test per effect. Real regression net, not full pixel-diff visual regression |
| Admin dashboard expansion | 2–3 days | Login/activity tracking, Vercel Analytics in-app, daily install/copy metric — extends existing email log view |
| Accessibility badge | 1 day | 94% of effects already handle reduced motion — surfaces it as a trust signal |
| "Similar effects" recommendations | 1 day | Category/tag-based, no ML needed |
| On-site changelog display | 1 day | Data already exists in registry's `changelog` field |
| Published date on effect cards | 1 day | `addedAt` already tracked in Sanity |
| Code comments pass | 1–2 days | Claude-assisted, human-reviewed before merge |
| Default image + text hardening | 1 day | Closes remaining gaps so no effect shows a blank state |
| Em dash cleanup in Sanity | 1 day | Same style rule already applied to CLI README/changelog |

## Wave 3 — Extended

| Item | Effort | Notes |
|---|---|---|
| Comparison pages | ~1 wk | Aceternity, Magic UI, Osmo + 1 reserved slot. Mostly research/writing, one page per person, concurrent |
| MCP Server | 2–3 days | Needs Wave 1 proven stable — an AI-readable catalog is only as good as the registry it reads from |

## Wave 4 — Design (parallel, not on the critical path)

| Item | Effort |
|---|---|
| Landing + category page design and build | Design: TBD · Build: 2–3 days |

Held for later, correctly — needs a real designer, not dev-driven design-in-code. Starts whenever that person is engaged and runs alongside Waves 2 and 3 rather than blocking either.

---

## Deferred to Phase 3

| Item | Why |
|---|---|
| In-browser sandbox (CodeSandbox / StackBlitz embed) | Large lift, nice-to-have over must-have |
| Curated effect collections / kits | Better once the registry foundation has settled |
| Framework support beyond Next.js App Router | Deserves its own initiative, not a line item |
| Theming / design-token layer | Cross-cutting — needs TS + registry work done first |
| Performance / bundle-size indicator | Lower priority than the a11y badge |
| Team / agency shared libraries | Pro-tier feature, real scope of its own |
| "Your project" dashboard view | Valuable, not urgent |
| Public showcase gallery | Needs a submission + moderation flow — content-ops, not engineering |

## One remaining call

**How deep should "proper tests for all 115 effects" go?**

Scoped above as render-mounts-cleanly + prop-contract tests — real, catches real breakage, achievable at this scale. If the intent is full pixel-diff visual regression across every effect, that's a separate, larger infrastructure project layered on top of this one, not a variant of the same estimate. Confirm the scope above, or say if you meant the bigger version.

---

*Hyperiux Vault — Phase 2, Rev. 4 · Wave 1: 2/4 done · ~4–5 wk critical path · TS + tests: all 115 effects, parallelized · Design: gated, parallel · Comparisons: Aceternity, Magic UI, Osmo + 1*
