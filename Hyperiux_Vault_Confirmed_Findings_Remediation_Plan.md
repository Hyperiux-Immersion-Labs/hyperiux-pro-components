# Hyperiux Vault — Confirmed Findings Remediation Plan

*My step-by-step implementation plan covering every finding I have personally verified across my audit of the Hyperiux Vault website, the private and public GitHub repositories, the published npm CLI package, and live production.*

Prepared for the Hyperiux Vault engineering, content, product, and legal owners.

> **CONFIDENTIAL — INTERNAL SECURITY AND REMEDIATION MATERIAL**
>
> **Do not forward, externally share, or reproduce until F-034 has passed production re-verification.**

### Distribution

This document contains the exact vulnerable architecture, affected routes and source paths, confirmation that all 83 Pro effects are exposed, and details relevant to admin authorization and secrets. Do not place this document in a public drive folder, a broad company Slack channel, or an externally accessible project-management board.

**Initial distribution, restricted to:**

- Bhaskar
- Hitesh
- Jyoti
- The engineer implementing F-034
- The person controlling Vercel/CDN access
- The person controlling Clerk and Supabase
- Legal/product owner for F-015

A redacted version may be shared with the broader engineering, design, and content teams after F-034 has been contained.

## How I've organized this document

I audited Hyperiux Vault end to end: the marketing site and pricing pages, the private hyperiux-pro-components repository (the real source of truth for the Next.js application, the effects registry, and the build pipeline), the public hyperiux-components mirror, the published hyperiux npm package, and the live production deployment at vault.hyperiux.com, including a signed-out canary test against the real site. I also read every internal document the team supplied me — engineering audits, monetization plans, design-system notes, and governance checklists — and cross-checked their claims against the real source and the real, running product rather than taking any of them at face value.

This document turns that work into one ordered sequence of steps I want the team to execute. I've placed every step in priority order, starting with the active production issues that need to ship today, moving through high-priority defects, then normal-cadence engineering work, and finishing with two appendices covering items that are real but belong to product, content, or legal owners rather than to engineering. I want to be precise about the word 'confirmed' in this document's title: every step below is something I personally reproduced, personally read in the real source, or personally observed live — not something reported to me that I'm passing along unverified. That also means this is a confirmed-findings plan, not a claim that it accounts for every possible defect anywhere in the product; I address that distinction directly near the end of this document.

Each step tells you: what I found and where; the severity of the underlying issue and how confident I am in the evidence for it, separately from how urgently I want it worked; why it matters; the specific implementation actions I want taken, in order; and how I'll know the fix is complete and correct. I've written this in enough detail that an engineer, content owner, or legal reviewer picking up any single step should be able to execute it without needing to re-read the rest of this document or go find me for clarification.

## Step 0 — Before anyone starts

A few things need to be true before the team can work through the steps below, and I want to flag them up front rather than let them surface as blockers partway through a sprint.

### Access the team will need

- Write access to the private hyperiux-pro-components repository (the real Next.js application, the effects registry source, and build-registry.js live here) — this is where the large majority of engineering fixes below need to be made.
- Write access to the public hyperiux-components repository, needed for the registry-sync CI work and the free-tier component parity fix.
- npm publish rights for the hyperiux package, needed for the CLI overwrite-safety fix.
- Admin access to the Clerk dashboard for the project's authentication instance, needed to rotate the exposed keyless credential and to review publicMetadata usage.
- Read access to Supabase and to whatever access/server logs exist for vault.hyperiux.com, needed for the entitlement fix and for investigating how long the live source-code exposure has been active.
- Edit access to the Sanity CMS instance backing the site's effect-detail content, needed for the Usage Code text fixes and the three effects with incomplete content records.
- Admin access to the GitHub organization, needed to add CI workflows, a CODEOWNERS file, and to bring GitHub Releases up to date.
- Someone empowered to make product and legal calls — the refund-policy conflict, the Coinbase design-system question, and a couple of the smaller positioning items need a decision from someone with that authority, not just an engineering fix.

### How to read each step's labels

Every step below carries four separate pieces of information, and I want to be clear about why I'm keeping them separate rather than folding them into one label the way an earlier draft of this document did:

- Severity — how serious the underlying issue is on its own terms (Critical / High / Medium / Low), independent of how urgently I want it worked.
- Evidence — how I know what I know: whether I confirmed it live in production, independently reproduced it myself from scratch, confirmed it by directly reading the real source, or I'm still missing a live/runtime test to fully close it out. I've been specific about the difference between 'I reproduced this' and 'I read the source and it supports this claim' throughout.
- Execution priority — the tier I actually want this worked in: P0 (start today), P1 (within one to two weeks), or P2 (normal engineering cadence). I've dropped a separate 'P3' tier this round and moved the genuinely low-priority items into two labeled appendices instead, so severity and urgency aren't collapsed into one number for those either.
- Release gate, where relevant — whether the issue blocks something specific, like Pro sales or a package publish, separate from its severity. A few items in this document are release blockers without being security-critical, and I didn't want that distinction lost.

One methodological note I want on the record: everything in the P0 tier and most of the P1 tier below, I either reproduced myself against the real source and the real published package, or observed directly on the live site as a signed-out visitor. Where I'm relying on a document the team supplied rather than something I tested myself, or where my evidence is an inference rather than a direct reproduction, I've said so explicitly in that step's evidence field and in its "what I found" section.

**Owner, where named below, is the named accountable owner for that step, not necessarily the only person doing the work. The named accountable owner can delegate work, but cannot delegate closure approval.**

## P0 — Start today: active incidents and release blockers

### Step 1 — Stop the live exposure of Pro effect source code

*Finding: F-034*

*Canonical audit ID: HV-FND-B4-002*

*Severity: Critical    Evidence: Live confirmed — 83/83 Pro effects individually tested and confirmed leaking, 2026-07-19*

*Execution priority: P0 — start today    Owner: Hitesh — accountable owner (role: Engineering lead / full-stack engineer)    Effort: 1–2 days for containment, about a week for the full fix and route-wide verification    Release gate: Blocks Pro sales / current Founding Access sales until contained*

*Where: apps/docs/src/app/(app)/effects/[slug]/[effectSlug]/page.js, apps/docs/src/lib/registry.js*

**Dependency: This blocks the credibility of the entire Pro tier and the company's ability to protect its own paid IP. Treat this as an active security incident, not a backlog item.**

**Remediation status: Confirmed    (lifecycle: Confirmed → Containment pending → Remediation in progress → Deployed → Production re-verification passed → Incident closed)**

*83/83 confirmed closes the scope-validation question, not the remediation. This finding will not be "Incident closed" until: the public/protected data-path fix is deployed, a cache purge is confirmed, a post-fix 83-route canary re-test passes clean, and access logs are reviewed for the exposure window. No containment, fix, redeploy, or re-verification has happened yet as of this document's writing — treat every step below as still fully outstanding.*

**What I found:**  I found that the function that loads an effect's data, getEffectBySlug(), unconditionally attaches the complete private source-code content of that effect before any authentication or entitlement check has run. That fully-populated object is then passed as a prop into EffectDetailContent, which is a Client Component. Next.js serializes every prop passed to a Client Component into the page's React Server Component payload and ships it to the browser, regardless of what is actually rendered on screen. I proved this is live and active, and I closed out the scope question this round: I individually tested every one of the 83 Pro-tier effects live, as a completely signed-out visitor, using fetch() against each one's real production vault.hyperiux.com/effects/&lt;category&gt;/&lt;slug&gt; URL with credentials explicitly omitted, and searched each response for literal, distinctive source-code identifiers unique to that effect's real source file — internal function and const names, not just the exported component name, specifically so minification or formatting differences couldn't produce a false negative. The result: 83 of 83 Pro effects (100%) are confirmed leaking real, unminified source code to unauthenticated requests. Zero exceptions, zero effects clean. This is no longer an inference from a shared code path — it is a fully closed, individually verified finding across the entire Pro catalogue. The fix and the closure test both need to cover all 83, and the closure test needs to leave the 32 Free effects' source access alone, since showing source to signed-out visitors is the intended, correct behavior for Free effects.

**Why it matters:**  This is an active, ongoing exposure of the company's paid product source code, now confirmed live and individually verified across all 83 Pro effects with zero exceptions. It is the single most serious issue I found anywhere in this audit.

**What I want the team to do:**

1. Ship an emergency containment patch the same day this is read: stop attaching private file content to the page-level effect object for Pro effects entirely, even if that means Pro users temporarily see a degraded view (for example, a 'preview temporarily unavailable' message in place of the code panel) until the real fix is ready. A temporarily worse experience for paying users is a better outcome than an ongoing leak of the product they're paying for. Free effects should be left untouched, since their source is meant to be publicly visible.
2. Refactor the effect detail page so it calls auth() and getUserPlan()/canAccessEffect() before it calls getEffectBySlug() at all, not after.
3. Rather than patching attachPrivateFileContent() with a boolean flag, I'd rather see the data-loading layer split into two distinct functions with two distinct return types: getPublicEffectMetadata(slug), which returns the metadata and, for Free effects, the source that's meant to be public; and getAuthorizedEffectSource(slug, verifiedEntitlement), which is the only function capable of returning Pro source, lives in a server-only module, cannot be called without an already-verified entitlement, and should never be passed wholesale into a Client Component. A boolean isAuthorized argument on a general-purpose object-builder is easy for a future change to bypass by accident; two functions with two different return shapes are harder to misuse.
4. Check that the fix holds under every payload path Next.js can produce, not just the initial page load: the initial HTML response, RSC navigation payloads, and any prefetch requests the framework issues ahead of navigation. A fix that only covers the first page load can still leak through prefetch.
5. Set explicit, restrictive cache-control headers on any response path that can carry protected source, and confirm with whoever manages the CDN/edge layer that authenticated or entitlement-dependent responses aren't being cached and served to a different, unauthorized visitor.
6. Add logging specifically for protected-source access, separate from general page-view logging, so future audits of who accessed Pro source don't depend on general access logs alone.
7. Add an automated regression test that performs a signed-out fetch of every one of the 83 Pro effect pages and asserts the response body contains none of that effect's source-code fragments, run against the initial HTML, the RSC payload, and any prefetch response. Run the same test as a Free user and as an expired-Pro user, not just signed out. Separately, test the 32 Free effects to confirm their legitimate public source access still works and hasn't been accidentally locked down by this fix.
8. Once the fix is deployed, re-run the exact reproduction method I used against all 83 Pro routes and record the result for each one. Only treat this as closed once that negative test passes against the actual production deployment, across all 83 Pro effects — the pre-fix baseline is now fully established (83/83 leaking), so the post-fix re-test has a clean, individually verified comparison point for every effect.
9. Ask whoever manages the CDN or edge caching in front of vault.hyperiux.com to check for and purge any cached copies of any vulnerable page response.
10. Pull whatever access or server logs exist for the exposure window and look for anomalous or bulk retrieval patterns against Pro effect pages from signed-out or free-tier sessions — I want to know whether this was scraped systematically before it's closed out, not just whether it's fixed going forward.

> **How I'll know it's done:**  A signed-out and a Free-user fetch of all 83 Pro effect pages returns zero protected source-code fragments, across the initial HTML, RSC navigation, and prefetch payloads, verified by an automated test running in CI. The same test confirms the 32 Free effects still correctly return their public source. The entitlement check runs strictly before any protected content is attached, for every Pro effect, not just the one I originally tested. The incident has been reviewed against the access logs and that review is documented somewhere the team can point to later.

### Step 2 — Fix the registry build so it can't silently destroy itself

*Finding: F-035*

*Canonical audit ID: HV-FND-B4-003*

*Severity: Critical    Evidence: Independently reproduced against a disposable local copy of the real repository; deployment path (manual-only, not CI-wired) confirmed by direct inspection of apps/docs/vercel.json and the absence of any .github/workflows/ directory*

*Execution priority: P0 — start today    Owner: Hitesh — accountable owner (role: Engineering lead / build & release owner)    Effort: 2–3 days    Release gate: Blocks any future registry publish/deploy until fixed; also blocks F-022 (see dependency note below)*

*Where: apps/docs/scripts/build-registry.js*

**Dependency: F-035 blocks F-022. I directly demonstrated this: running the real build script against a disposable copy of the repository with the 9 crash-triggering files temporarily removed completes successfully and produces exactly 115 unique, non-duplicated entries in public/r/index.json (verified via JSON.parse: items: 115, unique names: 115). That proves the current build-registry.js logic is not itself buggy with respect to duplication — it simply can never complete a fresh run because of this export-ambiguity crash. F-035 prevents clean regeneration and is the blocking dependency for replacing the 230-entry production index. The 230-entry file is consistent with stale or previously generated output; its exact originating build should be confirmed from artifact or deployment history — see the provenance note in the F-022 step below for exactly what would close that question and what I could and couldn't verify myself. That provenance nuance does not change the fix order: sequence F-035 before F-022, not in parallel, regardless of how or whether the 230-entry file's exact origin is ever pinned down.**

**What I found:**  I read build-registry.js in full and then reproduced its behavior end to end against a disposable copy of the real repository. The script deletes every existing output JSON file before it starts regenerating the registry, then processes each effect folder in turn. I found and corrected my own earlier root-cause attribution here: this is not a progressive-bloom-valley-specific problem. The actual defect is in the score() function used inside fileContents.sort() (lines ~268-295), which unconditionally calls detectExport(entry.content, preferredExportName) (lines ~38-145) for every file that doesn't match a small set of fast-path conditions (registryJson.main, registryJson.entry, ${entryBase}.jsx/js, ${effect}.jsx/js, or a .css file). detectExport() throws — it does not return null — whenever a file has two or more named exports that don't match the preferred export name. I wrote a standalone script that replicates detectExport's exact logic and ran it against all 115 real effects: exactly 9 files across 8 different effects trigger the throw — components/border-beam/styles.js, cursor/interactive-arrows/utils.js, cursor/noise-ripple-cursor/2dCanvasTracker.js, cursor/pixel-bloom/2dcanvasTracker.js, loaders/lines-loader/utils.js, scroll/progressive-bloom-valley/shaders.js, scroll/split-canvas/content.js, scroll/split-canvas/pixel-transition.js, and webgl/book-flip/PageContext.jsx. progressive-bloom-valley is only one of eight affected effects, not the cause. I then directly reproduced the crash by running the real build script against a disposable copy of the repository: it throws exactly this error and halts after writing only 11 of 115 registry entries, with the top-level buildRegistry().catch(console.error) handler logging the error but never setting a non-zero exit code — so the process still exits 0. Separately, I resolved the open question from my previous draft about whether this script is an active production incident or a release-integrity defect: I confirmed via apps/docs/vercel.json that buildCommand is 'npm run build', which maps only to 'next build --webpack', and confirmed there is no .github/workflows/ directory anywhere in the repo. build-registry.js is never invoked automatically by CI or by the Vercel deploy pipeline — it is a manually-run script only. That reclassifies this as a Critical release-integrity defect that breaks the registry any time someone manually re-runs the generator (for example, to fix F-022's duplication below), not an active incident currently degrading the live site on every deploy.

**Why it matters:**  Anyone who treats this script's exit code 0 as success — which is exactly what happens today, since the top-level handler never sets a non-zero code — would ship a catastrophically incomplete registry believing the build succeeded. A single bad build run, triggered by nothing more than one of nine ambiguous-export files being present, can silently destroy the entire live product catalogue with no failure signal anywhere. And because this script is manually invoked rather than CI-wired, the person who eventually runs it to fix something else (most likely F-022) is the person who will trigger this crash without warning.

**What I want the team to do:**

1. Fix the immediate crash at its real root cause: stop calling detectExport() unconditionally inside the sort scoring function for every non-fast-path file. Either skip export detection entirely for files that aren't candidate entry files, or make detectExport() return a sentinel (not throw) when it can't resolve an unambiguous export, and have the caller treat that as 'not a match' rather than a fatal error.
2. Once the scoring function is fixed, confirm all 9 currently-known ambiguous-export files (listed above, across 8 effects) process without throwing.
3. Refactor the build so it writes its output to a temporary directory first, and only atomically swaps or renames that directory over the live output once every effect has processed successfully.
4. Change the top-level error handling from buildRegistry().catch(console.error) to something that explicitly calls process.exit(1) on any caught error, so the process's own exit code reflects reality.
5. Replace the vague 'don't fall drastically below the previous count' idea with a deterministic release validator that checks against a committed expected manifest: exactly 115 canonical records unless a versioned catalogue change is explicitly approved and the manifest updated in the same change; exactly 32 Free and 83 Pro for the current release; unique effect IDs, slugs, and names; a valid category enum value on every record; an explicit tier field on every record with no implicit default; no missing source entry; no folder with multiple candidate entry files; no duplicated output records (see the F-022 step below on the live /r/index.json duplication); no protected source fields present in anything that could be treated as public metadata; and a successful compile for every installable entry. Any of these failing should block the swap.
6. Wire this build into CI with an enforced gate — a non-zero exit code should block deployment outright, not just print a warning — and add a pre-merge or scheduled CI run so the script stops being manual-only and the export-ambiguity class of bug gets caught before someone runs it by hand again.
7. Write a regression test that deliberately reintroduces an ambiguous-export file and asserts that the build fails loudly (or skips that file cleanly, per whichever fix approach is chosen), with the previous valid output left completely untouched.
8. Once all of the above is in place, run the fixed build against the full, real registry data as a final check, and confirm it produces exactly 115 unique, non-duplicated entries in public/r/index.json before considering this closed — see the F-022 dependency note below.

> **How I'll know it's done:**  The build script exits non-zero on any per-effect processing failure or any deterministic manifest check failure. All 9 currently-known ambiguous-export files process without crashing the build. The live output directory is never partially overwritten under any failure scenario. CI blocks deployment when the build fails, and the build now runs in CI rather than being manual-only. The regression test I described above passes. A fresh run of the fixed build against the real registry produces exactly 115 unique entries in public/r/index.json.

### Step 3 — Resolve the conflicting refund promises before Pro goes live

*Finding: F-015*

*Severity: High (a legal/commercial policy conflict, not a security or data-integrity issue)    Evidence: Directly observed — I read both live documents side by side myself*

*Execution priority: P0 — start today, but as a policy review, not an engineering fire drill    Owner: Bhaskar — accountable owner (role: Legal / product owner; I recommend a qualified legal review, since I am not able to give legal advice)    Effort: Small — this is a review-and-reconcile task, not an engineering task    Release gate: Blocks Pro reaching general availability*

*Where: vault.hyperiux.com/pricing (FAQ section) and the Refund Policy page*

**What I found:**  I read the pricing page's FAQ and the standalone Refund Policy page side by side. The pricing FAQ makes an unconditional promise: if Pro isn't right for a customer, they can contact support within 7 days of purchase and get a refund, no conditions attached. The Refund Policy page states the opposite in effect — no refunds once access has been granted, which for a digital product like this happens essentially immediately at checkout. These two documents are live on the site at the same time and directly contradict each other.

**Why it matters:**  A customer who reads the pricing page and then requests a refund under its stated terms, only to be told by the Refund Policy that no refund is available, has a legitimate grievance and potentially a legal one, depending on the jurisdiction and applicable consumer-protection law. I want this caught and fixed before the Pro tier reaches general availability, not after the first refund dispute happens.

**What I want the team to do:**

1. Have a legal or product owner read both documents side by side and decide, as a matter of business policy, which promise the company actually intends to honor: the unconditional 7-day window, the no-refund-after-access stance, or some reconciled middle position (for example, a refund window that's conditioned on limited usage rather than being fully unconditional).
2. Update whichever document doesn't reflect the decided policy so both pages state the same terms in the same words, or close enough that there's no room for a customer to read them as contradictory.
3. Have a qualified legal reviewer confirm the reconciled policy is compliant with applicable consumer-protection and distance-selling law in the jurisdictions Hyperiux Vault sells into, since I'm not in a position to give that assurance myself.
4. Do this before Pro reaches general availability — right now the tier is pre-launch/Founding Access, which is the cheapest and lowest-risk time to fix a policy conflict, before real refund requests start coming in under it.

> **How I'll know it's done:**  The pricing page FAQ and the Refund Policy page state the identical refund terms. A legal reviewer has signed off on the reconciled policy. This is resolved before Pro leaves its Founding Access / pre-launch phase.

### A note on how I've split the demo-lifecycle finding

The internal engineering audit the team supplied found one specific, real cleanup defect at cited locations, plus a catalogue-wide absence of reduced-motion support. My first draft of this document generalized the specific defect into 'a memory leak across the entire demo surface' and placed the whole thing at the same P0 tier as the live source exposure and the destructive build. That was an overstatement on my part: I confirmed the disabled cleanup call and the reduced-motion gap, but I did not verify a leak at all 115 demos individually, and a client-side cleanup bug that requires extended browsing to matter is not the same order of urgency as an active data exposure. I've split this into two steps below and moved it to P1, which I think reflects the real evidence more accurately.

### Step 4 — Build the shared motion-lifecycle foundation

*Finding: F-018a*

*Severity: Medium-High    Evidence: Directly source-confirmed at the specific cited files and lines; the reduced-motion absence is confirmed catalogue-wide (all 115 demos checked)*

*Execution priority: P1 — within one to two weeks    Owner: Gaurav — accountable owner (role: Engineering owner; motion/WebGL implementation quality)    Effort: Medium — this is a shared abstraction, not a per-demo fix*

*Where: apps/docs/src/app/(marketing)/demo/ — shared animation utilities; specific cleanup defect confirmed in blur-text/DemoContent.jsx line 107 and scroll-distortion/page.js line 27*

**What I found:**  The team's own internal, dated engineering code audit of the full demo folder (140 files, over 6,000 lines) found a deliberately commented-out GSAP animation-cleanup call on the master branch, and zero support anywhere in the 115 demos for the operating-system-level prefers-reduced-motion accessibility setting. I independently re-verified this against the real source rather than taking the internal document's word for it: I confirmed the specific disabled cleanup call at the two locations cited above, and I confirmed the complete absence of any reduced-motion branch across all 115 demos. What I have not done is verify a resource leak at each of the 115 demos individually — the confirmed defect is at the cited locations; the reduced-motion gap is the part that's genuinely catalogue-wide.

**Why it matters:**  A missing cleanup pattern in shared animation code is worth fixing once, correctly, as a shared foundation rather than 115 times independently, and the missing reduced-motion support is a real, confirmed accessibility gap affecting every visitor who has that OS-level setting enabled, on every demo.

**What I want the team to do:**

1. Adopt the internal audit document's own Top-10 fix list as a starting checklist — the team has already done real work identifying the highest-impact items, and I don't want that effort discarded.
2. Fix the specific disabled cleanup call at the two cited locations: scope GSAP's ScrollTrigger teardown through gsap.context() and release it via ctx.revert() when a demo unmounts. I want to be specific about the boundary here: each demo should clean up only the ScrollTrigger instances and resources it owns — do not use a global ScrollTrigger.getAll().forEach(kill) pattern anywhere, since that would tear down other demos' or other page elements' triggers as a side effect.
3. Build a shared motion-lifecycle utility that every demo can adopt, covering: a standard prefers-reduced-motion policy via GSAP's gsap.matchMedia(); suspension of animation when a demo's tab is hidden (the Page Visibility API); suspension when a demo scrolls fully offscreen; and correctly scoped ownership of any timers, event listeners, and requestAnimationFrame loops the demo creates, so cleanup on unmount is complete rather than partial.
4. Treat this step as building the reusable foundation only. The actual rollout across all 115 demos is the next step below, not this one.

> **How I'll know it's done:**  The two specifically-cited cleanup defects are fixed and verified not to leak across repeated mount/unmount cycles. The shared motion-lifecycle utility exists, is documented, and has been proven on at least one demo end to end (reduced-motion, tab-hidden suspension, offscreen suspension, and full cleanup on unmount all working).

### Step 5 — Roll the motion-lifecycle foundation out across all 115 demos

*Finding: F-018b*

*Severity: Medium    Evidence: Rollout of a source-confirmed pattern across the catalogue; treat any individual demo's resource ownership as unverified until it's actually migrated and checked*

*Execution priority: P1/P2 — rolling migration, not a single cutover    Owner: Gaurav — accountable owner (role: Engineering owner; motion/WebGL implementation quality)    Effort: Large — this touches all 115 effect demos, but each migration should be small once the foundation exists*

*Where: apps/docs/src/app/(marketing)/demo/ — all 115 effect demos*

**What I found:**  Once the shared foundation from the step above exists, every one of the 115 demos still needs to actually adopt it. I don't want this document to imply that fixing the two cited locations, or building the shared utility, resolves the whole catalogue by itself — each demo needs to be migrated and verified individually.

**Why it matters:**  Reduced-motion support and correct resource cleanup only reach real visitors once each demo is actually migrated, and I'd rather the team see this as a tracked rollout than assume it's done once the foundation lands.

**What I want the team to do:**

1. Prioritize the rollout by traffic: migrate the highest-traffic demos first, verify the pattern works correctly on them and doesn't introduce new bugs, then proceed through the rest of the catalogue in batches.
2. For each demo migrated, confirm it owns and correctly releases only its own timers, listeners, and animation instances — do not assume the shared utility alone guarantees this without a per-demo check.
3. As part of QA for each batch, actually toggle the OS-level reduced-motion setting and click through the migrated demos to confirm the setting is respected, rather than only checking that the code compiles.
4. Track migration status per demo (migrated / verified / not yet started) somewhere the team can see progress, since 115 individual migrations are easy to lose track of partway through.

> **How I'll know it's done:**  All 115 demos have adopted the shared motion-lifecycle utility. Each of the 115 demos must pass an automated source and lifecycle checklist. Representative effects from every runtime family must additionally receive manual reduced-motion, hidden-tab, offscreen, and unmount testing. Migration status for all 115 is tracked to 100% complete.

## P1 — High priority: within one to two weeks

### Step 6 — Require an explicit flag before the CLI overwrites a customized file

*Finding: F-036*

*Canonical audit ID: HV-FND-B3-001*

*Severity: High    Evidence: Independently reproduced against the real published package*

*Execution priority: P1 — within one to two weeks    Owner: CLI maintainer    Effort: 1–2 days plus a patch release*

*Where: The published hyperiux npm package, src/commands/add.js*

**What I found:**  I downloaded the actual published hyperiux@1.0.75 package from the npm registry myself, verified its hash matched what was claimed, and read add.js's exact logic. The interactive confirmation prompt before overwriting an existing file is gated only on !options.yes. The file-write path itself is not separately gated by an options.overwrite flag. That means a user who passes --yes — intending only to skip some unrelated interactive prompt, such as an install-location confirmation — silently has any locally customized file overwritten with the registry's version, with no warning.

**Why it matters:**  This is a real, currently-shipping data-loss bug in a package people are installing today. Anyone who has customized an installed effect and later re-runs the add command with --yes for convenience can lose that work without any indication it happened.

**What I want the team to do:**

1. Separate the two meanings that --yes currently conflates: 'skip interactive prompts' should not, by itself, also mean 'permit overwriting existing files.'
2. Require an explicit --overwrite flag (or, absent that, an explicit interactive confirmation) before any existing file is replaced, regardless of whether --yes was passed.
3. Add a dry-run or diff-preview option so users can see exactly what would change before they commit to an overwrite.
4. Update the CLI's --help text and the README so the corrected behavior is documented clearly, not just fixed silently.
5. Ship this as a patch release — I'd suggest 1.0.76 — with a CHANGELOG entry that explicitly calls out the behavior change as a safety fix, since existing --yes-based scripts or muscle-memory usage will now behave differently.
6. Add automated tests covering both paths: confirm that --yes alone does not overwrite an existing file, and that --yes --overwrite together does.

> **How I'll know it's done:**  The published package requires an explicit --overwrite flag to replace any existing file. Both the non-overwrite and overwrite code paths are covered by automated tests. The README and CHANGELOG reflect the change, and the new version is live on npm.

### Step 7 — Make Supabase the single source of truth for Pro entitlement, with a resilient failure path

*Finding: F-038*

*Canonical audit ID: HV-FND-B4-010*

*Severity: High    Evidence: Directly source-confirmed — read line by line*

*Execution priority: P1 — within one to two weeks    Owner: Engineering lead / billing owner    Effort: 3–4 days*

*Where: apps/docs/src/lib/subscription.js — getUserPlan()*

**What I found:**  I read getUserPlan() line by line. It queries Supabase for the user's subscription status, and if that query errors, is absent, or returns an inactive or expired record, the function logs the problem but does not throw — it falls straight through to trusting Clerk's cached publicMetadata field instead, treating plan === 'pro' or proAccess === true there as sufficient on its own to grant Pro access.

**Why it matters:**  publicMetadata is a cache, and caches go stale — for example, right after a cancellation, or after any error on the Supabase side. Treating that cache as an independent, unconditional fallback for a paid entitlement is a fail-open pattern: it can grant continued Pro access to someone whose subscription has actually lapsed, and it does so silently, with no error surfaced to anyone. I want to flag one design consideration for whoever implements this: a blunt 'fail closed on any Supabase error' rule would deny every legitimate Pro user access during any transient Supabase outage, which is its own commercial problem, so the fix needs to fail closed on the actual grant decision without being fragile to brief infrastructure hiccups.

**What I want the team to do:**

1. Make Supabase the single source of truth for entitlement decisions. Clerk's publicMetadata should be treated as a display or cache hint only, never as an independent grant path on its own.
2. Rather than failing closed on every single Supabase error, introduce a short-lived, server-controlled signed cache of the last known-good entitlement result, with a strict maximum age (measured in minutes, not hours or days). During a transient Supabase error, the server can serve from that cache until it expires. Once the cache's maximum age is exceeded, fail closed and deny access until Supabase is reachable again. Clerk's publicMetadata should never be treated as that trusted cache — only a value the server itself set and signed after a successful Supabase check should be trusted.
3. Make sure any cancellation or revocation event immediately invalidates that server-controlled cache for the affected user, rather than waiting for it to expire naturally.
4. Make sure every fallback-to-cache event, and every fail-closed event once the cache expires, generates an alert so the team knows when this path is actually being exercised in production.
5. Add a background reconciliation job that keeps Clerk's publicMetadata in sync with the real Supabase state on a regular cadence, purely for display purposes, so the two don't visibly disagree even though metadata is never used as a grant path.
6. Add tests covering: a Supabase error within the cache's valid window (access still correctly granted from cache); a Supabase error after the cache has expired (access correctly denied); and a Supabase error with stale Clerk metadata claiming pro=true (access correctly denied, confirming metadata alone is never sufficient).
7. Audit the current production user base for anyone whose Clerk metadata claims Pro access but who has no active Supabase subscription record, and correct their entitlement directly.

> **How I'll know it's done:**  Entitlement resolution has exactly one authoritative source of truth. Short transient Supabase outages don't incorrectly deny legitimate Pro users, verified by the cache-window test. Access is correctly denied once the cache window is exceeded, and Clerk metadata alone is confirmed insufficient to grant access under any tested condition. Production user data has been reconciled.

### Step 8 — Remove the hard-coded admin email fallback

*Finding: F-037*

*Canonical audit ID: HV-FND-B4-009*

*Severity: Medium, conditional on a specific misconfiguration    Evidence: Directly source-confirmed across 12+ files*

*Execution priority: P1 — within one to two weeks    Owner: Engineering lead / platform owner    Effort: 2–3 days*

*Where: apps/docs/src/app/(app)/dashboard/admin/layout.js and eleven other admin/internal-test API routes*

**What I found:**  I grepped the real repository and found the identical pattern repeated across twelve or more files: const ADMIN\_EMAIL = process.env.ADMIN\_EMAIL || "hitesh@weareenigma.com";. If the ADMIN\_EMAIL environment variable is ever left unset in any deployment — a new staging environment, a preview deployment, anywhere the variable simply wasn't configured — anyone who signs in with that exact hard-coded email address is granted admin access. I want to correct something from an earlier draft of this document: I previously speculated that this address belongs to someone outside the current team's control. I have no actual evidence either way about who currently holds that address or their relationship to the team, and I shouldn't have implied otherwise — I'm removing that speculation, since it isn't necessary to establish the severity of the underlying issue.

**Why it matters:**  A single missing environment variable, which is an easy and plausible thing to happen when spinning up a new environment, activates a fixed, identity-based admin path with no further verification. That is sufficient on its own to make this worth fixing, regardless of who currently holds that specific email address.

**What I want the team to do:**

1. Remove the hard-coded fallback entirely. Admin configuration should be required to be explicit, and the check should fail closed — deny access — if it's missing, rather than falling back to anything.
2. Replace the email-string comparison approach with a role or claim stored in Clerk metadata, or a dedicated admins table, keyed by user ID rather than by a string email address.
3. Add a startup or health check that fails loudly if the required admin configuration is missing in a given environment, so this is caught at deploy time rather than discovered later.
4. Audit every currently deployed environment — production, staging, and any preview environments — to confirm ADMIN\_EMAIL is correctly set in each one, and that the fallback has never actually been relied upon anywhere.
5. Grep the codebase for every one of the twelve-plus occurrences and apply the same fix uniformly, rather than patching a subset and leaving others exposed.
6. Add this pattern to the team's code-review checklist, or add a lint rule, so a hard-coded credential-like fallback like this doesn't get reintroduced later.

> **How I'll know it's done:**  No literal email address or credential-like fallback remains anywhere in the source. The admin check fails closed whenever its configuration is missing. I've confirmed this is correct in every currently deployed environment, not just production.

### Step 9 — Make founding-plan slot allocation atomic

*Finding: F-039*

*Canonical audit ID: HV-FND-B4-011*

*Severity: Medium-High    Evidence: Directly source-confirmed (design flaw); live exploitation not tested*

*Execution priority: P1 — within one to two weeks    Owner: Engineering lead / billing owner    Effort: 3–5 days once payment-reconciliation edge cases are included, not 2–3*

*Where: apps/docs/src/app/api/razorpay/create-subscription/route.js*

**What I found:**  I read the founding-plan subscription route directly. It counts the number of existing paid users, then, if that count is below the stated cap of 100, selects the founding-tier pricing plan, and only after that creates the Razorpay subscription. These are three separate, non-atomic steps with no lock or reservation between the count and the create call.

**Why it matters:**  Under real concurrent signup traffic — for example, a launch-day spike — more than 100 founding-tier subscriptions could be created before the count ever reflects the earlier ones, breaking a pricing commitment the company has made publicly and creating a support and refund liability. I want to be precise about what I have and haven't confirmed here: the design flaw itself is proven by direct source reading. Whether it has actually caused overselling in live production is not something I've tested, and it needs a real concurrency test to confirm either way.

**What I want the team to do:**

1. Implement the reservation using an actual Postgres-appropriate pattern rather than pseudocode: either pre-allocate exactly 100 slot rows and claim one per signup using SELECT ... FOR UPDATE SKIP LOCKED inside a transaction, or wrap the whole count-and-reserve logic in a single database function/RPC that executes atomically, or use a uniquely-constrained reservation record combined with an atomic counter that has a strict check constraint capping it at 100. Any of these avoids the race; a bare UPDATE ... WHERE claimed = false LIMIT 1 is a reasonable building block but needs to sit inside one of these atomic patterns, not stand alone.
2. Give each reservation attempt an idempotency key tied to the user's checkout session, so a retried request (from a flaky network or a user double-clicking) can't claim a second slot for the same person.
3. Give each reservation a short expiry: if a slot is reserved but the Razorpay subscription creation that should follow it never completes or fails, the reservation needs to be released back to the pool after a timeout rather than permanently consuming a founding slot for a subscription that was never actually created.
4. Add explicit compensation handling for the case where the slot reservation succeeds but the subsequent Razorpay subscription creation call fails or times out — the reservation should be released, and the user should see a clear error rather than being left in an ambiguous state.
5. Add webhook-based reconciliation against Razorpay so the founding-slot count used internally stays consistent with what Razorpay actually confirms was charged, rather than trusting only the initial creation call's response.
6. On a failed reservation attempt (because the 100 slots are already claimed), fall back gracefully to the standard, non-founding pricing plan with clear messaging to the user about why.
7. Add a load or concurrency test that fires roughly 150 simultaneous founding-plan signup requests, including a mix of duplicate idempotency keys and simulated Razorpay failures, and asserts that exactly 100 real, successfully-paid subscriptions end up at founding pricing, with no slot permanently lost to an abandoned or failed reservation. Use a clean, isolated test environment so this test doesn't pollute real subscription data.
8. Audit the current production subscription records to check directly whether the founding-slot count has, in fact, ever exceeded 100 already under the current unprotected logic.

> **How I'll know it's done:**  Slot allocation is verified atomic under concurrent load by the test I described, including its handling of idempotent retries and failed payment creation. Reservations expire and release correctly when payment doesn't complete. Webhook reconciliation is in place. The current production subscription count has been directly audited, and if it's already been oversold, that's been documented and a remediation decision has been made and actioned.

### Step 10 — Rotate the exposed Clerk keyless test credential

*Finding: F-026*

*Severity: Medium — narrow blast radius, test-mode credential, no evidence of misuse    Evidence: Directly observed in the supplied export*

*Execution priority: P1 — high on the list because it's essentially free to fix, not because the blast radius is large    Owner: Engineering / security owner    Effort: Extra small — this is close to a five-minute fix once someone owns it*

*Where: The Clerk dashboard, for the keyless instance referenced in apps/docs/.clerk/.tmp/keyless.json*

**What I found:**  The repository export supplied to me for this audit contained a real, if test-mode and temporary, Clerk secret key inside apps/docs/.clerk/.tmp/keyless.json. This file is correctly excluded from git via .gitignore — it was never actually committed to source control — but it was present in this specific export because a zip export captures the full local working directory, gitignored files included, not just what's tracked.

**Why it matters:**  I want to be precise about severity here rather than overstate it: this is a test-mode/keyless-instance credential with a narrow blast radius, and there's no evidence it was ever misused. That said, it was exposed to an outside party — me, for the purposes of this audit — through a channel outside normal access control, and rotating it costs almost nothing. There's no good reason not to do this immediately regardless of how the broader severity debate about it gets resolved.

**What I want the team to do:**

1. Go to the Clerk dashboard and rotate or revoke the specific keyless instance referenced by that file's claimUrl.
2. Confirm directly that the old sk\_test\_ key no longer authenticates anything after the rotation.
3. Going forward, use git archive or a fresh clone rather than zipping a live local working directory for any future audit or handoff export, so this specific class of accidental exposure — gitignored-but-locally-present secrets — can't recur.

> **How I'll know it's done:**  The old key has been confirmed to no longer authenticate. The team has agreed on git archive or an equivalent clean-export method for any future external handoff.

### Step 11 — Fix the broken pagination on category and free-tier listing pages

*Finding: F-014*

*Severity: High    Evidence: Directly observed live*

*Execution priority: P1 — within one to two weeks    Owner: Engineering / frontend owner    Effort: Medium*

*Where: vault.hyperiux.com/effects/\* and /effects/free*

**Dependency: Worth investigating together with F-022 below, since they may share a root cause.**

**What I found:**  I found that every category page and the /effects/free listing page caps at exactly 12 visible effect cards, and the pagination controls on those pages don't actually work — clicking them doesn't change the rendered set. This hides the majority of each category's real contents from anyone browsing normally. The one piece of good news I can report here is that the site's own Cmd+K search does find the missing items by name, so it's a working interim discovery path while this gets fixed — but it's not a substitute for functional browsing.

**Why it matters:**  This undermines one of the primary ways visitors are expected to discover the product's catalogue. A visitor browsing a category with, say, 20 effects in it currently only ever sees the first 12, with no way to page through to the rest via the UI itself.

**What I want the team to do:**

1. Reproduce the bug directly by counting rendered cards per category against the registry's true per-category count, to confirm the exact scope before touching the fix.
2. Check whether this is related to F-022 (the live registry index endpoint returning 230 duplicated entries for 115 real effects) before starting — it's plausible the listing pages' pagination logic is consuming that same un-deduplicated response, which would make F-022 a contributing root cause worth fixing at the same time.
3. Fix the pagination or infinite-scroll component itself so it correctly surfaces every effect in a category, not just the first 12.
4. Validate the fix against the full, real per-category counts from the registry census, not just a visual spot check.

> **How I'll know it's done:**  Every category page and the free-tier listing page render their full, real set of effects, and the pagination controls demonstrably change the rendered set when used. The rendered count matches the registry's true per-category count for a sample of categories.

### Step 12 — Fix the wrong Usage Code import path shown on every effect page

*Finding: F-012*

*Severity: High    Evidence: Directly source-confirmed (registry.json correct across all 115) and directly observed live (site copy wrong)*

*Execution priority: P1 — within one to two weeks    Owner: Engineering and content owner    Effort: Small for the immediate content fix, medium for the systemic fix*

*Where: Every effect detail page's Usage Code block (Sanity CMS content, rendered via effect-detail.jsx)*

**What I found:**  I found the root cause of this one directly: the 'Usage Code' import statement shown on every single effect's page — the copy-paste example a developer would actually use — omits the 'effects' path segment that the real, correct import path requires. I confirmed this is not a registry or CLI bug: the registry.json source of truth is correct on this point across all 115 effects with zero exceptions, and I found an internal document, developer-new-component.md, that explicitly documents the required schema as importPath: '@/components/effects/{slug}', which matches what the CLI actually installs. The Usage Code text shown on the website is hand-typed Sanity CMS content, completely disconnected from that registry data, and it's simply wrong. One specific instance compounds this: the immersive-full-screen-nav page's Usage Code doesn't just drop the effects segment, its content author also typed the wrong slug entirely (using the longer word 'navigation' instead of 'nav'), so a developer copy-pasting that specific example would get an import that fails to resolve at all, not just one that resolves to the wrong place.

**Why it matters:**  This is likely the single most commonly hit rough edge in the entire product, because it shows up on every effect's page and it's the first thing a developer does after installing an effect. Every visitor who copy-pastes the shown import path gets a broken import in their own project.

**What I want the team to do:**

1. Correct the Usage Code text in the Sanity CMS for all 115 effect pages so it shows the real, correct import path: '@/components/effects/&lt;slug&gt;'.
2. While making that pass, specifically fix immersive-full-screen-nav's Usage Code to use the actual correct slug, immersive-full-screen-nav, not immersive-full-screen-navigation — this page needs both the general fix and its own additional correction.
3. Once the immediate content fix is live, don't stop there: build the systemic fix, which is to stop hand-authoring this snippet in the CMS at all and instead generate it programmatically from each effect's own registry.json importPath field at build time. That's the only way this class of drift becomes structurally impossible rather than something a content author has to remember to keep in sync by hand.

> **How I'll know it's done:**  A spot check across a sample of effect pages after the content fix shows the correct import path, including on immersive-full-screen-nav specifically. For the systemic fix, I want confirmation that the generator is reading the real importPath field from registry.json rather than any hardcoded or freehand text.

### Step 13 — Fix the live registry endpoint returning duplicate entries

*Finding: F-022*

*Severity: High    Evidence: Directly observed live, checked twice; causal relationship to F-035 directly demonstrated this round*

*Execution priority: P1 — within one to two weeks, but cannot actually be closed until F-035 ships first (see dependency below)    Owner: Hitesh — accountable owner (role: Engineering owner; registry-build family, downstream of F-035)    Effort: Medium*

*Where: vault.hyperiux.com/r/index.json*

**Dependency: F-022 is blocked on F-035, not merely related to it. F-035 prevents clean regeneration and is the blocking dependency for replacing the 230-entry production index — the 230-entry file is consistent with stale or previously generated output, though its exact originating build is a separate, open provenance question (see the note above) that doesn't change this sequencing. There is nothing to independently fix here until F-035's 9 ambiguous-export files are resolved and a fresh build can actually complete. Also verify together with F-014, since the listing-page pagination bug may share this same un-deduplicated-response root cause.**

**What I found:**  I checked the live production /r/index.json endpoint directly, twice, to make sure this wasn't a one-off artifact. It returns exactly 230 items for the 115 real effects that actually exist — two entries per effect, each populated with different, non-overlapping metadata fields, rather than 115 clean, complete entries. This round I traced this to a specific cause rather than leaving it as an open merge-layer question: running the real, unmodified build-registry.js against a disposable copy of the repository with the 9 export-ambiguity files identified in the F-035 step temporarily removed completes successfully and produces exactly 115 unique, non-duplicated entries (verified by JSON.parse: items: 115, unique names: 115). That means the registry generator's own dedup logic is not the problem: F-035 prevents clean regeneration and is the blocking dependency for replacing the 230-entry production index. The 230-entry file is consistent with stale or previously generated output; its exact originating build should be confirmed from artifact or deployment history — I want to be precise that 'consistent with' is not the same as 'proven to be,' so here is exactly what would close that provenance question fully, and what I could and could not verify myself this round. Four things would close it: (1) Comparing the live /r/index.json content against prior Git commit history for that file — not possible from the archive I was given: it has no .git directory at all (git rev-parse --is-inside-work-tree returns 'fatal: not a git repository'), so this channel is closed to this audit; it would require the team's own GitHub org access to the real working repository. (2) Build artifacts or Vercel deployment history — also not something I can check myself; it requires the team's own Vercel dashboard access. I'm adding this as a new manual-input item: Vercel Dashboard → Project → Deployments → find the deployment(s) around when public/r/index.json last changed, and check the build logs for whether build:registry was ever invoked as a manual/custom step. (3) Generated-output timestamps on the live file itself, which could help narrow the window but which I don't have a way to pull independently of the two channels above. (4) Whether some alternate or rogue script writes to public/r/index.json instead of, or alongside, build-registry.js — this one I can answer directly and consider closed: I grepped the entire repository and confirmed build-registry.js (wired to the build:registry script in both the root and apps/docs package.json) is the only script anywhere in the codebase that writes to that path; apps/docs/src/lib/registry.js only reads it at runtime. There is no rogue or alternate generator. None of this changes the fix order below — F-035 still ships before any F-022 regeneration attempt, regardless of how the provenance question above is eventually resolved.

**Why it matters:**  Anything consuming this endpoint and expecting one record per effect — which is the reasonable assumption for a registry index — will either double-count effects or silently pick whichever of the two duplicate entries happens to come first, both of which are real correctness problems for any downstream consumer, internal or external.

**What I want the team to do:**

1. Do not attempt to fix this by patching a merge/dedup step in isolation — I directly demonstrated there is no dedup logic bug to patch; the generator already produces a clean 115-item index once it can complete a run. Ship the F-035 fix first.
2. Once F-035 is fixed, run the corrected build-registry.js against the real, live registry data and confirm it produces exactly 115 unique entries before touching production.
3. Deploy that clean, freshly-generated output to replace the current stale 230-item /r/index.json.
4. Check this at the same time as F-014's pagination fix above, since the listing pages may be consuming this same un-deduplicated response.
5. After the fix, parse the endpoint's JSON response programmatically and assert items.length === 115 with no duplicate names, rather than relying on a visual check.

> **How I'll know it's done:**  The live /r/index.json endpoint returns exactly 115 items, one complete record per real effect, verified programmatically, generated by a successful post-F-035-fix run of build-registry.js rather than by a manual dedup patch.

### Step 14 — Fix the three Pro effects whose pages render broken or empty

*Finding: F-028*

*Severity: Medium-High    Evidence: Directly observed live, cross-checked against real registry.json tier fields for all three*

*Execution priority: P1 — within one to two weeks    Owner: Content and engineering owner    Effort: Small*

*Where: vault.hyperiux.com/effects/scroll-effects/progressive-bloom-valley, /effects/webgl-effects/3d-portfolio-slider, /effects/webgl-effects/strip-slider*

**What I found:**  I checked all three of these live pages directly and cross-referenced them against their real registry.json tier fields, which all confirm tier: 'pro'. Despite that, none of the three pages render the Pro-lock/upgrade UI that every other Pro effect correctly shows, and none of them render install or usage instructions either — the pages show just a title, dependency tags, and an empty 'Live Preview' heading, with a non-standard SEO title and description as well. Every other Pro effect I checked in this audit (roughly 80 of them) correctly shows the Pro-lock UI, so the page template clearly can handle this correctly — it's specifically these three that are broken. My best explanation, based on how the page template behaves elsewhere, is that these three effects' Sanity CMS content records are missing the body content blocks (description prose, FAQ, and so on) that drive both the SEO metadata and the conditional Pro-lock rendering logic, leaving the template in a state it doesn't handle gracefully.

**Why it matters:**  This is real, if modest, canonical and SEO impact today, and it will become a bigger problem the moment any marketing push links directly to one of these three pages and sends visitors to a page that looks broken.

**What I want the team to do:**

1. Check each of the three effects' Sanity CMS content records directly and confirm whether the body content blocks are in fact missing, compared to a working Pro effect's record.
2. Complete the missing content for all three — most likely these are newer or recently added effects whose content authoring was simply never finished before the pages went live.
3. As a secondary, more durable fix, make the page template handle incomplete content records gracefully rather than rendering an empty, confusing page — even a fallback Pro-lock message driven by the reliable registry tier field, independent of whether the CMS content is complete, would be a meaningful improvement.
4. Re-load each of the three pages after the fix and confirm either the correct Pro-lock messaging or the correct install/usage code now renders.

> **How I'll know it's done:**  All three pages render either correct Pro-lock messaging or correct install instructions, matching the pattern every other Pro effect follows. Re-loaded and visually confirmed for all three.

### Step 15 — Add baseline CI/CD to the private repository that ships the actual product

*Finding: F-027*

*Severity: High    Evidence: Directly observed — absence confirmed in the exported source*

*Execution priority: P1 — within one to two weeks    Owner: Engineering owner    Effort: Medium*

*Where: hyperiux-pro-components repository root, under .github/workflows/*

**What I found:**  I checked the exported source of the private hyperiux-pro-components repository — the one that actually contains the real Next.js website, the effects registry, and the build pipeline — and found no CI/CD configuration at all, no CODEOWNERS file, and no SECURITY.md or CONTRIBUTING.md anywhere in it.

**Why it matters:**  This is the repository that ships the actual customer-facing product and the payment integration, and it currently has no automated checks of any kind protecting it. Given everything else in this document — a secret that was present in the export (F-026), a build that can silently corrupt itself (F-035), a live data-exposure bug (F-034) — the absence of any CI safety net is exactly the kind of gap that let issues like these go unnoticed.

**What I want the team to do:**

1. Add a baseline CI workflow to this repository covering at minimum linting, the existing build-registry.js validation, and a secret scan, given the credential that was already found in this repo's export.
2. Add a CODEOWNERS file so changes to sensitive areas — the registry build script, the auth and entitlement logic, the payment integration — require review from the right people.
3. Confirm the new workflow actually works by opening a test branch with an intentional lint violation and an intentional secret committed to it, and verifying the workflow catches both and fails the check.

> **How I'll know it's done:**  A CI workflow runs on every pull request to this repository and demonstrably fails on an intentional lint or secret violation in a test branch. CODEOWNERS is in place for the sensitive areas of the codebase.

### Step 16 — Remove the dead waitlist reference and keep every 'Upgrade to Pro' CTA consistent

*Finding: F-002*

*Severity: Medium    Evidence: Directly observed live*

*Execution priority: P1 — within one to two weeks    Owner: Frontend / product owner    Effort: Small*

*Where: Pricing page FAQ copy; homepage and docs-page navigation CTAs*

**What I found:**  I found that the pricing page's FAQ still references joining a waitlist, with copy pointing at a /waitlist page that returns a 404. Every live call-to-action button I actually clicked — in the main navigation and on the Pro plan card — already routes straight to /sign-up, with no waitlist step involved anywhere in the real flow.

**Why it matters:**  A visitor who reads the FAQ text before clicking anything is being told a materially different, and outdated, story about how to get access than what the product actually does.

**What I want the team to do:**

1. Decide, as a product call, whether a real waitlist page should be built to match the FAQ copy, or whether the FAQ copy should simply be updated to drop waitlist language entirely and describe the real, current sign-up flow.
2. Re-crawl the homepage and pricing page after the change and confirm every CTA points at a consistent, working destination, with no leftover dead-link copy anywhere.

> **How I'll know it's done:**  The pricing FAQ, the homepage, and the pricing card CTAs all describe and route to the same, real, working sign-up flow with no reference to a waitlist that doesn't exist.

### Step 17 — Correct the pricing table's false claim about Free-tier Cursor and WebGL access

*Finding: F-013*

*Severity: High    Evidence: Directly source-confirmed against the full 115-effect catalogue, not a sample*

*Execution priority: P1 — within one to two weeks    Owner: Bhaskar — accountable owner (role: Content / product owner; public claims and launch hold)    Effort: Extra small*

*Where: vault.hyperiux.com/pricing — the Free-vs-Pro feature comparison table*

**What I found:**  The pricing page's feature comparison table shows a '-' for both Cursor effects and WebGL scenes under the Free column, implying the Free tier excludes both categories entirely. I checked this against every one of the 115 real registry.json tier fields, not a sample, and confirmed the Free tier actually includes 2 of 16 Cursor effects and 3 of 18 WebGL effects. The table's claim is false for the full catalogue, not just for an edge case I happened to sample.

**Why it matters:**  This actively undersells what the Free tier offers, in a way a prospective customer would read directly off the pricing page while making a purchase decision.

**What I want the team to do:**

1. Correct the pricing table so the Cursor and WebGL rows accurately reflect that free effects exist in both categories, rather than showing a flat exclusion.
2. Re-check the corrected table against the full registry census after the fix, not just against the two examples I used to confirm the bug.

> **How I'll know it's done:**  The pricing table's Free column for Cursor effects and WebGL scenes accurately reflects the real catalogue counts, verified against the full 115-effect registry census.

### Step 18 — Stop manually syncing the two component registries — generate the public mirror from the private one

*Finding: F-017*

*Severity: Medium    Evidence: Inferred plausible root cause for previously-observed, no-longer-reproducible drift; not itself directly reproduced this round*

*Execution priority: P1 — within one to two weeks    Owner: Hitesh — accountable owner (role: Engineering owner; registry-build family, shares logic with F-035)    Effort: Medium*

*Where: Both repositories' CI/CD pipelines; build-registry.js's entry-detection logic*

**Dependency: Do this after F-027 (baseline CI for the private repo), since this check needs to run somewhere.**

**What I found:**  Free-tier effects have to be manually copied from the private hyperiux-pro-components source-of-truth repository into the public hyperiux-components mirror, and there is no automated process checking that the two stay in sync. I believe this is the plausible root-cause mechanism behind a class of slug and content drift bugs that an earlier round of this audit flagged but could no longer reproduce on a live re-check (documented in CORRECTION-NOTICE.md) — in other words, this kind of manual-sync gap is exactly the sort of thing that would produce transient drift that comes and goes as manual copies happen at different times. I want to be clear this specific root-cause link is my inference from the pattern, not something I directly reproduced myself this round.

**Why it matters:**  Even though I can't currently point to an active instance of drift, a manual, unenforced sync process for the free-tier component source is a structural risk that will keep producing this class of bug periodically until it's automated.

**What I want the team to do:**

1. Rather than maintaining two independently-edited repositories and only checking afterward whether they've drifted, I'd rather see the public mirror generated or published automatically from the private canonical registry: a controlled export step pulls the validated Free-tier subset out of the private source of truth and publishes it into the public repository as part of the release pipeline, so there's only ever one place a human edits Free-tier component source.
2. As an interim safety net while that pipeline is being built, add a CI job to both repositories that diffs the free-tier component source between the two and fails the build on any mismatch — this catches drift but doesn't prevent the underlying two-repositories-edited-independently problem, so I see it as a stopgap, not the end state.
3. While in that area, add a lint rule to the registry build's entry-detection logic that rejects any component folder containing more than one candidate entry file — the same underlying pattern that caused the crash in F-035.
4. Confirm the new check (or, once built, the generation pipeline) actually works by intentionally desyncing a free effect between the two repos in a test branch and verifying CI catches it, or verifying the generation pipeline overwrites the manual change on its next run.

> **How I'll know it's done:**  The public repository's free-tier component source is either generated automatically from the private canonical source, or, at minimum, an interim CI diff-check is live in both repositories and demonstrably catches an intentional desync in a test branch. The entry-file lint rule is in place.

### Step 19 — Fix the Animated Modal's accessibility gaps and its body-scroll-state bug

*Finding: F-041*

*Canonical audit ID: HV-FND-B8-005*

*Severity: High — I under-prioritized this in an earlier draft    Evidence: Directly source-confirmed*

*Execution priority: P1 — within one to two weeks (raised from P2; this is a multi-part accessibility failure, not a polish item)    Owner: Gaurav — accountable owner (role: Frontend engineer; motion/WebGL implementation quality)    Effort: 2–3 days*

*Where: registry/effects/components/animated-modal/AnimatedModalContent.jsx*

**What I found:**  I read AnimatedModalContent.jsx directly. On open, it sets document.body.style.overflow = 'hidden' to prevent background scrolling, and on close it resets that value to an empty string rather than restoring whatever the previous value actually was. It also has no role='dialog' or aria-modal attribute, no initial focus placement when it opens, no focus trapping while it's open, and no restoration of focus to whatever element triggered it once it closes. I placed this at P2 in an earlier draft of this document, treating it as a polish item. On reflection that was wrong: missing dialog semantics, missing focus containment, missing focus restoration, and incorrect global scroll-state handling together are a real, multi-part accessibility failure, not a cosmetic issue, and I'm moving it up to P1.

**Why it matters:**  Keyboard and screen-reader users cannot reliably use this modal today, and the incorrect global body-scroll-state handling can break page scroll behavior for other components. This belongs in the same shared accessible-overlay workstream as any other modal/dialog component the team builds, not treated as an isolated one-off ticket.

**What I want the team to do:**

1. Add role='dialog' and aria-modal='true' to the modal container, along with an accessible label via aria-labelledby or aria-label.
2. Implement initial focus placement when the modal opens — focus should move to the modal itself or to its first focusable element — and implement focus trapping so Tab and Shift+Tab cycle only within the modal while it's open.
3. Restore focus to whatever element triggered the modal once it closes.
4. Capture the body's actual overflow value before setting it to 'hidden', and restore that exact captured value on close, rather than hardcoding an empty string.
5. Add close-on-Escape keyboard handling if it isn't already present.
6. Treat this as the reference implementation for a shared accessible-overlay pattern, so any other current or future modal/dialog component in the catalogue can reuse the same dialog-semantics, focus-trap, and scroll-lock logic instead of each one implementing it independently.
7. Add an automated accessibility test using a tool like axe-core covering this modal specifically, and do a manual keyboard-only walkthrough as part of QA sign-off before considering this closed.

> **How I'll know it's done:**  An axe-core scan reports no violations for the modal. A keyboard-only walkthrough confirms the modal can be fully opened, navigated, and closed without a mouse. Body overflow is confirmed to correctly restore its prior value after the modal closes, in every case I tested.

## P2 — Medium priority: normal engineering and content cadence

### Step 20 — Consolidate the two Pro-effect delivery APIs onto one shared authorization function

*Finding: F-040*

*Canonical audit ID: HV-FND-B4-017*

*Severity: Medium    Evidence: Directly source-confirmed*

*Execution priority: P2 — normal cadence (duplication/drift risk, not a proven bypass today)    Owner: Engineering lead    Effort: 3–4 days*

*Where: /api/effects/[slug] and /api/cli/effects/[effectSlug]*

**What I found:**  I found and read two separate, independently implemented API routes that both deliver Pro effect content: one for the web app, using a Supabase Bearer-token hash and fetching live from the private GitHub repository's Contents API; and one for the CLI, using its own token verification and reading from the local registry. I checked both individually and confirmed each one correctly gates its sensitive content on its own — this is not a proven bypass today.

**Why it matters:**  Two divergent code paths implementing the same sensitive capability will drift apart over time. A fix applied to one path — for instance, the F-034 fix to the page-level authorization check — will not automatically protect the other, and any future change risks silently reintroducing a gap in just one of the two.

**What I want the team to do:**

1. Extract a single, shared access-decision function used by both API routes as well as by the page-level check described in the F-034 fix. Rather than returning a bare boolean, have it return a typed decision object — something like { allowed: boolean, reason: 'free' | 'active-pro' | 'admin' | 'expired' | 'anonymous' | 'error', policyVersion: string, source: 'supabase' } — so the reason behind every access decision is available for logging, support investigations, and testing, not just the yes/no outcome.
2. Consolidate the actual content-serving logic into one internal function parameterized by the calling context, so there's a single source of truth for what gets returned to whom, rather than two independent implementations.
3. Add contract tests that run the same authorization matrix — anonymous, free, pro, and expired-pro users — against both routes and assert they produce identical access decisions, including the same reason code.
4. Document the two entry points and their intended callers (browser versus CLI) so future changes to one are more likely to prompt someone to check the other.

> **How I'll know it's done:**  A single shared authorization function, returning a typed decision object rather than a bare boolean, is used by all three delivery paths — the page, the web API, and the CLI API. The contract tests I described pass. The two entry points and their intended callers are documented.

### Step 21 — Make the registry build fail closed on a missing tier field — no default of any kind

*Finding: F-025*

*Severity: Medium    Evidence: Directly source-confirmed*

*Execution priority: P2 — normal cadence    Owner: Engineering owner    Effort: Extra small*

*Where: apps/docs/scripts/build-registry.js*

**What I found:**  I found that the build script defaults an effect's tier to 'free' whenever the tier field is missing from that effect's registry.json, rather than failing the build. Right now, based on my full census of all 115 effects, no registry.json is actually missing this field — so there is no current live impact — but the pattern itself is a fail-open default for the single field that determines whether an effect's full source is published without any authentication at all.

**Why it matters:**  This is meaningful downside protection for very little cost: a one-line change closes off a whole class of future accident where someone adds a new Pro effect, forgets to set its tier field, and the build silently mishandles it. I want to be specific about the fix here: defaulting a missing tier to 'pro' would protect the source, but it would still silently accept malformed metadata and could misclassify product inventory without anyone noticing. Tier is a required commercial field and should never have an implicit default in either direction — a missing tier should hard-fail the build, full stop.

**What I want the team to do:**

1. Change the build so a missing tier field on any registry.json hard-fails the build with a clear error naming the offending effect. Do not implement a default of 'pro' as an alternative to failing — either behavior is acceptable for protecting source, but only a hard failure also catches the underlying data-quality problem.
2. Fold this into the deterministic release-validator checks described in the F-035 step above, so it's enforced as part of the same manifest validation rather than as a separate ad hoc check.
3. In a test branch, temporarily remove the tier field from one registry.json and confirm the build now fails outright, rather than silently defaulting to any tier.

> **How I'll know it's done:**  A registry.json with a missing tier field always hard-fails the build, confirmed directly in a test branch. No implicit tier default exists anywhere in the build.

### Step 22 — Fix the folder-name-versus-declared-name mismatch on interactive-hover-slider

*Finding: F-023*

*Severity: Low-Medium    Evidence: Directly source-confirmed*

*Execution priority: P2 — normal cadence    Owner: Engineering owner    Effort: Extra small*

*Where: registry/effects/webgl/interactive-hover-slider/registry.json*

**What I found:**  I found that this effect's folder is named interactive-hover-slider, but its own registry.json declares name: 'hover-slider' — exactly the anti-pattern the team's own developer-new-component.md documentation explicitly warns against. My best guess is this was a rename that only got done halfway: either the folder was renamed and the registry.json name field wasn't updated to match, or vice versa.

**Why it matters:**  This is a low-effort fix, but it's the same class of naming inconsistency the internal documentation already flags as a known failure mode, so I want it actually cleaned up rather than left as a known-but-ignored issue.

**What I want the team to do:**

1. Rename either the folder or the registry.json name field so the two agree — either direction resolves the inconsistency.
2. Add a CI lint check that enforces folder-name-matches-declared-name going forward, since the internal documentation already identifies this as a recognized failure mode worth guarding against.

> **How I'll know it's done:**  The folder name and the registry.json name field agree for this effect. A CI lint check now catches this class of mismatch automatically.

### Step 23 — Move progressive-bloom-valley's folder to match its declared category, if it's safe to do so

*Finding: F-024*

*Severity: Low    Evidence: Directly source-confirmed*

*Execution priority: P2 — normal cadence (repo hygiene only)    Owner: Engineering owner    Effort: Extra small, but see the caveat below before treating this as a trivial move*

*Where: registry/effects/scroll/progressive-bloom-valley*

**What I found:**  This effect is physically filed under the 'scroll' category folder, but its own registry.json declares category: 'webgl'. The live site's category listing already reads the metadata field rather than the folder location, so this is unlikely to be causing any visible user-facing bug today — it's a mismatch between physical location and declared metadata, not a functional defect. I want to flag one thing I haven't verified before this gets treated as a trivial rename: I don't know whether this folder's physical path is consumed anywhere else — generated route paths, CLI source paths, import maps, preview imports, registry hashes, or hard-coded references elsewhere in the codebase or in git history — versus being purely organizational.

**Why it matters:**  I'm flagging this as low priority precisely because the live impact is minimal, but it's still worth fixing for repository hygiene and to avoid confusing anyone who navigates the repo by folder structure rather than by reading each registry.json.

**What I want the team to do:**

1. Before moving anything, check whether this folder's physical path is referenced anywhere outside its own registry.json — generated routes, the CLI's source path resolution, any hard-coded links from other effects, or test fixtures. If the path is purely organizational and nothing else depends on it, a direct move is fine.
2. If anything does depend on the physical path, do a staged migration instead of a direct move: add the new path alongside the old one, update whatever consumes it to point at the new path, verify nothing breaks, and only then remove the old path.
3. Move the progressive-bloom-valley folder from registry/effects/scroll/ to registry/effects/webgl/ so its physical location matches its declared category field.
4. Confirm the folder location matches the category field after the move, and confirm nothing on the live site changes as a result.

> **How I'll know it's done:**  The folder's physical location matches its declared category field, and the live site's category listing, the CLI install path, and any other consumer of the old path are confirmed unaffected by the move.

## P2 — Catalogue-wide component and accessibility gaps confirmed this round

A review of an earlier draft of this document raised a long list of additional, specific component-runtime findings — offscreen/hidden-tab suspension, coarse-pointer fallback, canvas/WebGL semantic treatment, DPR ceilings, WebGL context-loss recovery, GPU resource disposal, and others — that I had not yet verified and did not include as findings at the time. I went back and checked all of them this round with a targeted grep across all 115 effects in the real source. Most of them are real, confirmed gaps, and I've added them below as steps with the same file-and-evidence standard as the rest of this document. A few were not confirmed, or were confirmed only partially differently than originally claimed, and I've been explicit about that in each step's evidence field below ("Source confirmed" or "Partially confirmed", as opposed to the live-reproduced or directly-observed evidence tiers used elsewhere in this document, since these are static source-code gaps I have not separately live-tested).

Three items I checked did not hold up and I'm deliberately not including as findings: a claim of widespread duplicate Lenis smooth-scroll instantiation, where I actually found only one single new Lenis() call in the entire effects tree, not a duplication problem; a claim of duplicate accessible-text announcements, where the aria-label usage I spot-checked was a correct, standard pattern (aria-label overriding split-text child content), not an actual bug; and a claim that autoplaying video lacks muted pairing, which is false — all 4 video usages correctly pair autoplay with muted (I did find a real, narrower captions gap on those same 4 videos, which is its own step below). Two more items — demo/primitive separation, and a global body-height/wheel-takeover claim — came back mixed and inconclusive on inspection, with no clear catalogue-wide pattern, so I'm not turning either into a formal step; if either turns out to be real on a closer look, it would need the same file-and-line evidence I've held everything else in this document to. All three rejected items are written up in full, with method and result, in the new appendix at the end of this document, "Rejected or Superseded Hypotheses."

*A note on units before the counts below: this section mixes several different measurement granularities, and none of them should be read as directly comparable to each other, or to this document's other headline figures (like the 115-effect catalogue total or the 83-Pro-effect count in F-034), unless the unit is explicitly the same. Some counts below are effect/component-level totals (e.g. all 16 cursor-category effects, all 18 webgl-category effects, all 5 carousel-category effects); some are individual-file totals within an effect, since a single effect can be made of more than one file (e.g. the 9 effect files carrying literal id attributes, out of 11 total attribute instances); and one (F-055) is a cross-catalogue count spanning every category (49 of the 115 total effects), further split into a separate reference-count granularity (201 external references versus 274 R2-hosted references). I've tried to state the unit explicitly in each count itself below rather than leaving a bare fraction to be interpreted.*

### Step 24 — Add tab-hidden and offscreen suspension to the continuous-animation effects

*Finding: F-042*

*Severity: Medium — real, uncosted CPU/GPU/battery drain, not a functional break    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Medium — one shared pattern, applied across roughly 60 files*

*Where: registry/effects/{cursor,webgl,scroll,backgrounds}/\*\* — the 60 files whose animation loop is driven by requestAnimationFrame*

**Dependency: Related to, but distinct from, F-018a/F-018b: those steps cover the marketing demo showcase pages (apps/docs/.../demo/); this step covers the actual shipped effect component source (registry/effects/) that customers install into their own projects. Reuse the same shared-utility approach, but treat this as a separate codebase and a separate rollout.**

**What I found:**  I grepped every requestAnimationFrame-driving effect file across the cursor/, webgl/, scroll/, and backgrounds/ categories — 60 files in total — for document.hidden and visibilitychange handling, and for any IntersectionObserver-based offscreen guard. 59 of the 60 requestAnimationFrame-driving effect files never pause when the effect scrolls offscreen or when the browser tab is hidden; only one file, border-beam, has any IntersectionObserver-based guard at all. Nothing else in the tree listens for the Page Visibility API's visibilitychange event or checks document.hidden before continuing its animation loop.

**Why it matters:**  This is real, uncosted CPU/GPU/battery drain on any page that runs more than one of these effects, worse on mobile where sustained background rendering has a bigger battery cost, and worse for any customer who installs several of these effects on a single page, which is exactly the intended use case for this catalogue.

**What I want the team to do:**

1. Build one shared requestAnimationFrame wrapper/hook that every continuous-animation effect can adopt, covering: pause when document.hidden is true (via the visibilitychange event) and pause when the effect's root element is scrolled fully offscreen (via IntersectionObserver), resuming both cleanly when the tab or element becomes visible again.
2. Model the offscreen-guard half of this on border-beam's existing IntersectionObserver implementation, since it's the one file in the catalogue that already does this correctly.
3. Roll the shared wrapper out across the 59 affected files, prioritizing the webgl/ category first since it's the most GPU-intensive.
4. Add a regression check — for example, an automated test that mounts an effect, simulates document.hidden, and asserts its rAF loop stops scheduling frames.

> **How I'll know it's done:**  All 60 continuous-animation effect files pause their animation loop when their tab is hidden and when they're scrolled fully offscreen, verified per-file. The regression check I described passes for a sample of migrated effects.

### Step 25 — Add a touch/coarse-pointer fallback to the mouse-only cursor effects

*Finding: F-043*

*Severity: Medium    Evidence: Partially confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Medium — 12 files need a fallback path*

*Where: registry/effects/cursor/\*\* (16 cursor-category effects)*

**What I found:**  I checked all 16 cursor-category effects for touch/coarse-pointer handling. Only 3 (fish-eye, inertia-img, phantom-image-trail) check matchMedia('(pointer: coarse)'), and one more (pixelated-image-effect) detects touch via a different method. The remaining 12 of the 16 cursor-category effects assume mouse-only input with no fallback, which means those effects most likely render broken or inert on touch devices — phones and tablets — since they're built entirely around mousemove-driven state.

**Why it matters:**  Cursor effects are a meaningful fraction of this catalogue's Pro offering, and 12 of 16 rendering broken or inert on touch hardware is a real product gap for any customer whose site gets meaningful mobile or tablet traffic, which is close to all of them.

**What I want the team to do:**

1. Use the 3 already-correct implementations (fish-eye, inertia-img, phantom-image-trail) as the reference pattern for the matchMedia('(pointer: coarse)') check.
2. Decide, effect by effect, what the intended touch behavior should be — a touch-driven equivalent interaction, a static fallback rendering, or an explicit no-op — rather than defaulting all 12 to the same treatment without considering whether a touch-equivalent interaction makes sense for that specific effect.
3. Roll the chosen fallback out across the 12 affected effects.
4. Test each on a real touch device or an accurate touch emulator, not just a resized desktop browser window, since matchMedia('pointer: coarse') behaves differently from viewport-width-based responsive breakpoints.

> **How I'll know it's done:**  All 16 cursor-category effects have an explicit, tested behavior for coarse-pointer/touch input — either a working touch-equivalent interaction or an intentional, non-broken fallback. None silently renders broken or inert on a touch device.

### Step 26 — Give WebGL canvas elements correct accessibility semantics

*Finding: F-044*

*Severity: Medium — accessibility gap    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small — mechanical fix once the pattern is chosen*

*Where: registry/effects/webgl/\*\* (15 files that render a &lt;canvas&gt; element)*

**What I found:**  I checked all 15 files in the webgl/ category that render a &lt;canvas&gt; element for any accessibility treatment — aria-hidden='true' for decorative content, or role='img' plus an accessible label for meaningful content. Zero of the 15 canvas-rendering webgl effect files apply either. A screen-reader user encounters an unlabeled, semantically opaque canvas element on every one of these effects.

**Why it matters:**  WebGL canvas content is invisible to assistive technology by default unless explicitly annotated one way or the other; leaving it unannotated is worse than either correct treatment, since it leaves ambiguous, unlabeled content in the accessibility tree instead of either hiding it cleanly or describing it.

**What I want the team to do:**

1. For each of the 15 effects, decide whether its canvas content is purely decorative (aria-hidden='true' is correct) or conveys meaningful information (role='img' with a concise aria-label is correct) — most of these are decorative visual effects, so I'd expect aria-hidden='true' to be the right call for the majority.
2. Apply the chosen attribute to the &lt;canvas&gt; element in all 15 files.
3. Spot-check a sample with a real screen reader or the accessibility tree inspector in browser devtools to confirm the canvas is either correctly hidden or correctly described, not just that the attribute is present in the markup.

> **How I'll know it's done:**  All 15 webgl/ effects with a &lt;canvas&gt; element have an explicit aria-hidden='true' or role='img' treatment, verified in the accessibility tree, not just in source.

### Step 27 — Cap devicePixelRatio in the 7 effects that read it uncapped

*Finding: F-045*

*Severity: Medium — performance    Evidence: Partially confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Extra small — a one-line cap per file*

*Where: dotted-grid, spider-particles, gooey-counter, pixel-bloom, pixel-transition, interactive-blur-reveal, text-cloning (7 of the 21 files that read devicePixelRatio)*

**What I found:**  I checked all 21 files that read window.devicePixelRatio. 14 of them cap it, typically via Math.min(dpr, 2), which is standard practice for canvas/WebGL rendering. 7 do not: dotted-grid, spider-particles, gooey-counter, pixel-bloom, pixel-transition, interactive-blur-reveal, and text-cloning all use the raw, uncapped value.

**Why it matters:**  Some phones and tablets report a devicePixelRatio of 3 or 4. An uncapped DPR means these 7 effects allocate and render canvas/WebGL buffers at 2-4x the pixel area a capped implementation would use on the same device, which causes severe, avoidable performance degradation on exactly the high-density-display hardware where it matters most.

**What I want the team to do:**

1. Apply the same Math.min(dpr, 2) pattern already used correctly in the other 14 files to these 7.
2. Spot-check rendering quality on a capped run to confirm 2x is visually sufficient for each of the 7 effects before shipping the cap.
3. Add this check to the shared build/lint tooling if practical, so a future new effect that reads devicePixelRatio without a cap gets caught before merge rather than found in a future audit.

> **How I'll know it's done:**  All 7 identified files cap devicePixelRatio at 2 (or another deliberately chosen ceiling), matching the pattern already used in the other 14 files. Visual quality confirmed acceptable at the capped value.

### Step 28 — Add WebGL context-loss recovery to the 18 WebGL effects

*Finding: F-046*

*Severity: Medium-High — silently and permanently breaks the effect with no recovery    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Medium*

*Where: registry/effects/webgl/\*\* (18 effects)*

**What I found:**  I checked all 18 webgl/ category effects for webglcontextlost and webglcontextrestored event handling. Zero of the 18 webgl-category effect files listen for either event. A GPU context loss — common on mobile devices under memory pressure, and common after an OS resumes from sleep — permanently breaks these effects with no recovery path; the canvas simply goes blank or frozen with no indication anything went wrong and no way to restore it short of a full page reload.

**Why it matters:**  This is a silent, permanent failure mode triggered by ordinary device conditions (mobile memory pressure, laptop sleep/resume), not an edge case, and it currently has no recovery path anywhere in the WebGL catalogue.

**What I want the team to do:**

1. Add a webglcontextlost listener to each of the 18 effects that calls event.preventDefault() (required for the browser to allow context restoration) and cleanly stops the render loop.
2. Add a matching webglcontextrestored listener that re-initializes GPU resources (shaders, buffers, textures) and resumes rendering.
3. Since this is the same pattern needed 18 times, build it as a shared utility rather than 18 independent implementations, similar in spirit to the shared motion-lifecycle utility described in the F-018a step.
4. Test context-loss recovery directly using the WEBGL\_lose\_context extension in devtools rather than waiting for a real device to trigger it, since that's the standard way to force-trigger and verify this path.

> **How I'll know it's done:**  All 18 WebGL effects handle webglcontextlost and webglcontextrestored, verified by forcing context loss via the WEBGL\_lose\_context extension and confirming each effect recovers and resumes rendering rather than staying permanently broken.

### Step 29 — Fix GPU resource disposal in the 3 Three.js effects that don't call .dispose()

*Finding: F-047*

*Severity: Medium — GPU memory leak on unmount/remount    Evidence: Partially confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small*

*Where: book-flip, colliding-models, grid-tunnel (3 of the 13 Three.js-based webgl effects)*

**What I found:**  Of the 13 webgl/ effects that actually use Three.js, 10 correctly call .dispose() on their geometries, materials, and textures during cleanup. 3 of the 13 Three.js-based webgl effects do not: book-flip, colliding-models, and grid-tunnel. Those 3 leak GPU memory every time the component unmounts and remounts, since Three.js resources aren't garbage-collected by the JS engine the way plain objects are — they need an explicit .dispose() call to release the underlying GPU allocation.

**Why it matters:**  A customer's page that mounts and unmounts one of these 3 effects repeatedly — for example, during client-side route navigation in a single-page app — will accumulate GPU memory usage over the session with no bound, which can eventually degrade or crash the tab.

**What I want the team to do:**

1. Use the 10 already-correct implementations as the reference pattern for what needs to be disposed and where in the cleanup lifecycle it belongs.
2. Add the missing .dispose() calls to book-flip, colliding-models, and grid-tunnel's cleanup paths, covering geometries, materials, and textures specifically.
3. Verify with a GPU memory profiler (for example, Chrome's Memory tab with the Three.js WebGLRenderer.info counters) that repeated mount/unmount cycles no longer show a growing GPU memory count for these 3 effects.

> **How I'll know it's done:**  book-flip, colliding-models, and grid-tunnel all correctly dispose of their Three.js geometries, materials, and textures on unmount, confirmed by a GPU memory profile showing no growth across repeated mount/unmount cycles.

### Step 30 — Bring animated-tabs up to the WAI-ARIA Tabs keyboard/semantics pattern

*Finding: F-048*

*Severity: Medium — fails the WAI-ARIA Tabs pattern entirely    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small-Medium*

*Where: registry/effects/components/animated-tabs (the only tabs component in the catalogue)*

**What I found:**  animated-tabs is the only tabs-pattern component in the catalogue, and I checked it against the standard WAI-ARIA Tabs pattern. It's click-only: there's no role='tablist' on the container, no role='tab' on the individual tabs, no aria-selected reflecting the active tab, and no arrow-key navigation between tabs. It fails the WAI-ARIA Tabs pattern entirely rather than partially — none of the expected semantics or keyboard behavior is present.

**Why it matters:**  Tabs are a common, expected interactive pattern, and keyboard-only and screen-reader users have a well-established expectation for how they behave — arrow keys move focus between tabs, the selected state is announced. A tabs component that only supports mouse clicks is unusable for anyone navigating by keyboard alone.

**What I want the team to do:**

1. Add role='tablist' to the tab-button container and role='tab' to each individual tab button.
2. Add aria-selected, reflecting which tab is currently active, and aria-controls linking each tab to its corresponding panel, with a matching role='tabpanel' and id on the panel side.
3. Add left/right (or up/down, depending on orientation) arrow-key navigation between tabs, following the standard WAI-ARIA Tabs pattern's roving-tabindex approach.
4. Test with keyboard-only navigation and a screen reader to confirm the tab list is announced correctly and arrow keys move both focus and the visually active tab.

> **How I'll know it's done:**  animated-tabs implements the full WAI-ARIA Tabs pattern — role='tablist'/'tab'/'tabpanel', aria-selected, aria-controls, and arrow-key navigation — verified with keyboard-only testing and a screen reader.

### Step 31 — Add hover-pause and slide-change announcements across the 5 carousel effects

*Finding: F-049*

*Severity: Medium    Evidence: Partially confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small-Medium*

*Where: registry/effects/carousels/\*\* (5 carousel effects)*

**What I found:**  I checked all 5 carousel effects for two standard carousel accessibility/usability behaviors: pausing autoplay on hover, and announcing the current slide to screen readers. Only 1 of the 5 carousel-category effects (ring-carousel) pauses autoplay on hover. 0 of the 5 carousel-category effects have an aria-live region announcing the current slide.

**Why it matters:**  An autoplaying carousel that doesn't pause on hover is a well-documented usability problem — content changes out from under a user trying to read it — and the complete absence of any aria-live announcement means screen-reader users get no indication the content is changing at all across every carousel in the catalogue.

**What I want the team to do:**

1. Use ring-carousel's existing hover-pause implementation as the reference pattern and roll it out to the other 4 carousel effects.
2. Add an aria-live='polite' region (visually hidden, but present in the accessibility tree) to each of the 5 carousels that announces the current slide's identifying text or index when it changes.
3. Also pause autoplay on keyboard focus, not just mouse hover, so keyboard users get the same benefit.
4. Test with a screen reader to confirm slide changes are actually announced, not just that the aria-live attribute is present in markup.

> **How I'll know it's done:**  All 5 carousel effects pause autoplay on hover and on keyboard focus, and all 5 have a working aria-live announcement of slide changes, verified with a screen reader.

### Step 32 — Add focus-trap-on-open and focus-return-on-close to the navigation/menu effects

*Finding: F-050*

*Severity: Medium-High    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Medium*

*Where: registry/effects/navigation/\*\* (4 navigation/menu effects)*

**What I found:**  I checked all 4 navigation/menu-category effects for focus management: trapping focus within an open menu, and returning focus to the trigger element when it closes. 0 of the 4 navigation/menu-category effects implement either — there's no focus-management JavaScript anywhere in the navigation/ category at all. I also checked more broadly for any route-transition focus restoration (returning focus to a sensible location after a client-side route change) elsewhere in the codebase and found the same gap — 0 focus-management code outside two unrelated utility uses. I'm folding that broader route-transition gap into this same step rather than writing it up separately, since both are instances of the same missing capability: focus isn't being deliberately managed anywhere across open/close or navigation transitions.

**Why it matters:**  A keyboard user who opens one of these navigation/menu effects has no guarantee focus stays within it while open, and no guarantee focus returns anywhere sensible when it closes — both of which are baseline requirements for any overlay/menu pattern, not an edge-case enhancement.

**What I want the team to do:**

1. Add a focus trap to each of the 4 navigation/menu effects while open, so Tab/Shift+Tab cycles only through the menu's own focusable elements.
2. Capture the triggering element on open and explicitly return focus to it on close, rather than leaving focus wherever it happened to land (commonly the now-removed menu item, which drops focus to the document body).
3. Set initial focus to a sensible element inside the menu when it opens — typically the first focusable item or a dedicated close button.
4. Separately, review the two existing unrelated utility uses of focus-management code found during this check, and confirm whether either is a reusable starting point for the pattern above before building it from scratch.
5. Test all 4 with keyboard-only navigation to confirm the trap and return-focus behavior both work correctly.

> **How I'll know it's done:**  All 4 navigation/menu effects trap focus while open and return focus to the triggering element on close, verified with keyboard-only testing.

### Step 33 — Associate form validation errors with their fields using aria-describedby and aria-invalid

*Finding: F-051*

*Severity: Medium — real gap, single component    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small*

*Where: registry/effects/components/animated-form (ContactForm)*

**What I found:**  animated-form/ContactForm is the one real form component in the catalogue, and its validation logic itself works correctly — but it renders errors as plain, unlinked &lt;p&gt; text near the field rather than programmatically associating them with it. I grepped the whole repository for aria-describedby and aria-invalid and found zero uses of either, anywhere.

**Why it matters:**  A sighted user can visually connect an error message to the field above it, but a screen-reader user gets no indication of which field has an error or what the error text says, since there's no programmatic link between the input and its error message.

**What I want the team to do:**

1. Give each error message element a unique id.
2. Set aria-describedby on the corresponding input to reference that error message's id whenever an error is present, and remove it when the error clears.
3. Set aria-invalid='true' on the input whenever it has a validation error, and remove or set it to 'false' when the error clears.
4. Test with a screen reader to confirm submitting the form with an invalid field announces both that the field is invalid and what the error message says.

> **How I'll know it's done:**  Every field in ContactForm programmatically associates its error message via aria-describedby and reflects its validity via aria-invalid, verified with a screen reader on a submission with at least one invalid field.

### Step 34 — Flag the 3 loader effects as decorative timers, not real loading indicators

*Finding: F-052*

*Severity: Low-Medium — misleading but not broken    Evidence: Source confirmed (for the static-checkable half)*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering and content owner    Effort: Small for the documentation fix; larger if the team decides to make them honest*

*Where: lines-loader, numeric-tunnel, stack-loader (all 3 loader-category effects)*

**What I found:**  I checked all 3 loader-category effects and found each is driven purely by a fixed GSAP-timeline or setTimeout duration, with no connection to any real fetch, load, or Promise state anywhere in the component. They're decorative timers styled to look like loading indicators, not indicators of actual loading progress. I want to be precise about what I've confirmed: this is a static-source finding — I confirmed the absence of any fetch/load/Promise wiring in the code — not something I separately live-tested against a real slow network condition.

**Why it matters:**  A customer who installs one of these expecting it to reflect real load state, given the name 'loader', will get a fixed-duration animation that finishes regardless of whether the underlying content is actually ready, which can finish too early or run pointlessly long after content is already loaded.

**What I want the team to do:**

1. Update each of the 3 effects' documentation and usage code to be explicit that these are decorative, fixed-duration animations rather than real loading-state indicators, so customers install them with the right expectation.
2. As a further improvement, consider adding an optional prop (for example, isLoading or onComplete) that lets a consuming app drive the animation from real load state for customers who want an honest loading indicator, while leaving the current fixed-duration behavior as the default.

> **How I'll know it's done:**  All 3 loader effects' documentation clearly states they are fixed-duration decorative animations, not real loading-state indicators, unless and until the optional real-state-driven prop is built.

### Step 35 — Re-split text on resize across the 13 text-splitting/char-stagger effects

*Finding: F-053*

*Severity: Medium    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Medium*

*Where: registry/effects/text/\*\* (13 text-splitting/character-stagger effects)*

**What I found:**  I checked all 13 text-splitting/char-stagger effects for resize handling. All 13 of these text-splitting/character-stagger effects (13 of the 16 total text-category effects) split their text into characters, words, or lines exactly once, at mount, and never re-split on window resize. Since the split is line-wrap-dependent, an effect that looks correct at its initial viewport width shows incorrect or stale stagger/reveal behavior after a resize event that changes the text's line wrapping — for example, rotating a tablet from portrait to landscape, or a user resizing their browser window.

**Why it matters:**  Responsive resize is an ordinary, frequent event, not an edge case, and all 13 of the catalogue's text-animation effects currently render an animation that no longer matches the text's actual wrapped layout once that happens.

**What I want the team to do:**

1. Add a resize listener, debounced to avoid re-splitting on every intermediate resize frame, that re-runs the text-splitting logic and re-initializes the animation state when the viewport width changes meaningfully.
2. Build this as a shared utility given the 13 affected effects share the same underlying gap, rather than fixing each independently.
3. Test each of the 13 by resizing the viewport (or rotating a device/emulator) after the initial animation has already run, and confirming the split and animation state are both correct post-resize.

> **How I'll know it's done:**  All 13 text-splitting effects re-split their text and correctly re-initialize animation state on a meaningful resize event, verified per-effect by resizing after initial mount.

### Step 36 — Namespace the hard-coded id attributes so effects don't break when rendered twice on one page

*Finding: F-054*

*Severity: Medium — 2 of 9 are functionally load-bearing, not just cosmetic    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering owner    Effort: Small*

*Where: 9 effect files with 11 total literal id attributes, including gooey-counter and pixelated-image-effect*

**What I found:**  I grepped the whole effects tree for literal, non-namespaced id='...' attributes (i.e. not generated via React's useId()) and found 11 across 9 different effect files. Most of these are cosmetic, but at least 2 are functionally load-bearing: gooey-counter and pixelated-image-effect both reference their own literal id via a url(#id) SVG filter reference. Rendering either of those two effects twice on the same page means both instances share the same literal id, so the browser's url(#id) lookup resolves to whichever element it finds first — silently breaking the second instance's filter.

**Why it matters:**  This catalogue is explicitly designed to be installed and composed freely into customer projects, and 'don't render the same effect twice on one page' is not a documented constraint anywhere — so this is a real, silent breakage waiting for a completely ordinary usage pattern.

**What I want the team to do:**

1. Replace the 11 literal id attributes across the 9 affected files with React's useId() (or an equivalent per-instance-unique generator), so every mounted instance gets its own unique id rather than a fixed string.
2. Prioritize gooey-counter and pixelated-image-effect first, since those are the two with functionally load-bearing url(#id) SVG filter references — the fix there isn't just cosmetic.
3. After the fix, explicitly test rendering each of the 9 affected effects twice on the same page and confirm both instances render and function correctly, especially the two SVG-filter-dependent effects.

> **How I'll know it's done:**  All 11 literal id attributes across the 9 affected files are replaced with per-instance-unique ids. Rendering gooey-counter or pixelated-image-effect twice on the same page produces two correctly-filtered instances, confirmed by direct test.

### Step 37 — Reduce the catalogue's dependency on the third-party picsum.photos placeholder service

*Finding: F-055*

*Severity: Medium — availability risk, not a defect in the code itself    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering and content owner    Effort: Medium — touches a meaningful fraction of the demo assets*

*Where: 49 of 115 effects that reference external asset URLs*

**What I found:**  I checked every effect for external, non-Hyperiux-controlled asset URL references. 49 of the 115 effects (43%) reference at least one external asset URL. Of the total external references across those 49 effects, 201 point to the third-party, Hyperiux-uncontrolled picsum.photos placeholder-image service, compared to 274 references to Hyperiux's own R2 CDN bucket. Nearly half the catalogue's demo/preview assets are functionally dependent on a free third-party placeholder service that carries no SLA with Hyperiux.

**Why it matters:**  picsum.photos has no service-level agreement with Hyperiux, and any change, degradation, or rate-limiting on that free service could silently break image rendering across a large fraction of the catalogue's demo pages, with no warning and nothing Hyperiux itself controls to fix quickly.

**What I want the team to do:**

1. Inventory the 201 picsum.photos references and prioritize migrating the highest-traffic effects' assets to Hyperiux's own R2 CDN bucket first, following the pattern already used for the 274 existing R2-hosted references.
2. For any references genuinely meant to demonstrate 'works with any external image URL' rather than being real demo content, keep those as external references but document that distinction explicitly, so future audits or engineers don't treat all 201 as needing migration.
3. Once migration is complete for the demo-content references, monitor for any remaining picsum.photos dependency and treat new ones added in future effects as a review-flag during code review.

> **How I'll know it's done:**  The demo-content-purpose subset of the 201 picsum.photos references has been migrated to Hyperiux's own R2 CDN. Any remaining external references are documented as intentionally external (e.g. 'works with any image URL' demonstrations) rather than an unreviewed dependency.

### Step 38 — Add caption tracks to the 4 video-containing effects

*Finding: F-056*

*Severity: Low — narrow, single accessibility gap    Evidence: Source confirmed*

*Execution priority: P2 — normal engineering cadence    Owner: Engineering and content owner    Effort: Small — captions authoring plus a &lt;track&gt; element per video*

*Where: The 4 effects that render a &lt;video&gt; element: components/video-player/VideoPlayerComp.jsx, cursor/pixel-bloom/index.jsx, webgl/draggable-canvas/index.jsx, navigation/expanding-navbar/ExpandingNavbarDesktop.jsx*

**What I found:**  I checked all 4 effects that render a &lt;video&gt; element (components/video-player/VideoPlayerComp.jsx, cursor/pixel-bloom/index.jsx, webgl/draggable-canvas/index.jsx, navigation/expanding-navbar/ExpandingNavbarDesktop.jsx) for autoplay/mute correctness and for captions. The autoplay half of this is clean: all 4 correctly pair autoplay with muted, so there's no autoplay-with-sound issue anywhere in the catalogue. The captions half is a real, narrower gap: none of the 4 video-containing effects has a &lt;track&gt; caption element, so any video content with spoken audio — once unmuted by a user, or for a deaf/hard-of-hearing user regardless of mute state — has no caption support.

**Why it matters:**  This is a narrow, low-severity gap — 4 files, one missing element type — but it's a real, unaddressed accessibility gap for any video content with meaningful spoken audio, and it's a cheap fix relative to the other findings in this document.

**What I want the team to do:**

1. Confirm which, if any, of the 4 videos have spoken-audio content that would benefit from captions, versus being purely ambient/decorative background video with no meaningful audio.
2. For any with meaningful spoken content, author a caption file (WebVTT) and add a &lt;track kind='captions'&gt; element to the video.
3. For purely decorative/ambient video with no meaningful audio, document that explicitly rather than leaving the gap unaddressed and unexplained.

> **How I'll know it's done:**  Each of the 4 video-containing effects either has a working caption track for meaningful spoken content, or has documented that its video is decorative/ambient with no spoken content requiring captions.

## Appendix A — Product, content, and legal decisions

Everything from here through the rest of this document is real and worth resolving, but none of it is an engineering defect — it's a decision for a product, content, marketing, or legal owner. I've kept them out of the core P0–P2 engineering sequence above so that sequence stays focused on access control, data integrity, release safety, and functional correctness, but I've kept the same level of implementation detail for each so nothing here is any less ready to act on.

### Step 39 — Clarify the licensing disclosure on the npm package listing

*Finding: F-006*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Decision backlog — normal cadence    Owner: Product / legal owner    Effort: Extra small*

*Where: npm hyperiux package README and description*

**What I found:**  The npm package sidebar currently shows a bare 'License: MIT' with no disclosure that this refers only to the CLI tool's own code, not to the terms under which installed effect content is licensed for use. The Free/Pro dual-licensing model that actually governs the installed effects isn't mentioned anywhere on that listing.

**Why it matters:**  A developer reading 'License: MIT' on the npm listing could reasonably assume that covers everything they install through the tool, when it doesn't — this is worth clarifying to avoid a licensing misunderstanding for anyone relying on the npm page as their reference.

**What I want the team to do:**

1. Add language to the npm README or package description that explicitly distinguishes the CLI tool's own MIT license from the separate licensing terms that apply to installed effect content.
2. I'd recommend a qualified legal review of the clarified language before it's published, given this is licensing-adjacent text.

> **How I'll know it's done:**  The updated text is live on npmjs.com and clearly distinguishes the two license scopes.

### Step 40 — Update the stale figures in the internal monetization plan

*Finding: F-016*

*Severity: Low    Evidence: Directly source-confirmed (corrected from an earlier overstatement of my own — see the note below)*

*Execution priority: Decision backlog — normal cadence    Owner: Product / engineering owner    Effort: Extra small*

*Where: MONETIZATION.md*

**What I found:**  I want to correct something I got wrong myself earlier in this audit before it was corrected by better evidence: I had previously concluded, based only on the minimal root-level package.json which doesn't list frontend dependencies at all, that the team had pivoted away from the entire planned Clerk/Supabase/Stripe stack. Once I had the real apps/docs/package.json, I found that conclusion was an overstatement — Clerk (auth) and Supabase (the subscription database) were built exactly as MONETIZATION.md originally planned; only the payment processor changed, from the originally planned Stripe to the actually shipped Razorpay. The document also still states a free-tier size of 10 to 15 effects, when the real, live free tier is 32 effects.

**Why it matters:**  MONETIZATION.md was substantially accurate on the architecture that actually matters most (auth and the subscription database) and doesn't deserve to be treated as entirely obsolete — but its stale payment-processor reference and free-tier figure should be corrected so it doesn't mislead anyone reading it as a current planning document.

**What I want the team to do:**

1. Update the free-tier size figure from 10–15 to the real, current figure of 32 effects.
2. Update the payment processor reference from Stripe to Razorpay, reflecting what was actually shipped.
3. Leave the Clerk and Supabase portions of the plan as they are, since I confirmed those were built as originally planned and don't need correcting.

> **How I'll know it's done:**  MONETIZATION.md's free-tier figure and payment-processor reference match the real, shipped product.

### Step 41 — Standardize how effect counts are phrased across the site

*Finding: F-007*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Decision backlog — normal cadence    Owner: Content / marketing owner    Effort: Small*

*Where: Homepage hero and footer; pricing plan cards and footer*

**What I found:**  I found the same page showing effect counts two different ways at once: exact figures (32 free, 83 pro, 115 total) alongside rounded marketing figures (30+, 80+) in different sections of the same page.

**Why it matters:**  This isn't wrong exactly, but it reads as inconsistent when a visitor notices both styles on the same page, and it's worth a simple style decision rather than leaving it to accumulate more inconsistently over time.

**What I want the team to do:**

1. Decide on a simple standard: rounded phrasing for general marketing copy (hero sections, taglines), exact phrasing only in stat-bar or table contexts where precision is expected.
2. Re-crawl the homepage and pricing page after applying the standard and confirm each section now uses one style consistently.

> **How I'll know it's done:**  The homepage and pricing page each use one consistent phrasing style per section, confirmed by a re-crawl.

### Step 42 — Document or consolidate the four different contact email addresses

*Finding: F-008*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Decision backlog — normal cadence    Owner: Product / operations owner    Effort: Extra small*

*Where: Pricing FAQ; npm package maintainers field; website footer*

**What I found:**  I found four different contact addresses in use across the site and package metadata — hello@, support@, hi@, and admin@ — with no stated mapping of what each one is actually for. My best read is this is organic drift from different pages being authored at different times by a small, founder-led team, most likely all genuinely monitored addresses, rather than an accidental duplication problem.

**Why it matters:**  Even if all four addresses are intentional and monitored, a visitor has no way to know which one to use for what, and that's worth a quick clarifying decision either way.

**What I want the team to do:**

1. Confirm directly whether hi@ and admin@ are intentionally separate, actively monitored mailboxes, or whether they're drift worth consolidating down.
2. Document the intended purpose of each address that's kept, in whichever internal reference document the team uses for this kind of decision, and update any public-facing copy to reflect that mapping if it's not already clear.

> **How I'll know it's done:**  Each contact address that remains in use has one documented purpose, confirmed against the public-facing copy.

### Step 43 — Get a legal read on the Coinbase-derived design system

*Finding: F-020*

*Severity: Low residual risk (the concrete font-name risk has been ruled out live)    Evidence: Directly source-confirmed (design doc) plus directly observed live (production fonts)*

*Execution priority: Decision backlog — optional    Owner: Legal owner (optional, low priority)    Effort: Extra small*

*Where: DESIGN.md and the site's global CSS / design tokens*

**What I found:**  I found that the team's own internal design-system documentation states the site's visual identity was directly modeled on Coinbase's proprietary brand, including an exact color hex match and literal Coinbase font-family names written into the document. I checked this live against production this round specifically to see whether those literal proprietary font names actually ship: they do not. Production uses its own font stack, not Coinbase's named fonts.

**Why it matters:**  The literal risk I can point to — shipping a competitor's actual proprietary font names in production CSS — turned out not to be real. What's left is a softer question about color and overall look-and-feel similarity, which is much more of a legal judgment call than something I can assess myself.

**What I want the team to do:**

1. If the team wants certainty on this beyond what I can offer, get a brief legal opinion specifically on the color-and-overall-look-and-feel question, since the more concrete font-name risk has already been ruled out.
2. No engineering action is required here unless that legal review recommends a change.

> **How I'll know it's done:**  This is optional and low priority; I'd consider it resolved either by a legal opinion being obtained, or by a documented decision that no further review is needed.

## Appendix B — Small housekeeping and polish items

Genuinely low priority and, like Appendix A above, not engineering defects in the sense the P0–P2 items are. I've included full implementation detail for each so they're ready to pick up whenever the team has spare capacity.

### Step 44 — Fix the npm package's brand name in its description

*Finding: F-009*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — spare capacity    Owner: Product owner    Effort: Extra small*

*Where: npm registry description field*

**What I found:**  The npm package description reads 'Hyperiux UI effects' rather than 'Hyperiux Vault effects'. My best guess is this was written before, or independently of, 'Vault' becoming the settled product name.

**Why it matters:**  Minor brand-naming inconsistency specifically on the npm listing.

**What I want the team to do:**

1. Update the npm package description to say 'Hyperiux Vault effects'.
2. Confirm the corrected text appears by running npm view hyperiux after the next publish.

> **How I'll know it's done:**  npm view hyperiux shows the corrected description after the next publish.

### Step 45 — Add a Vault link to the GitHub organization profile

*Finding: F-010*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — spare capacity    Owner: Marketing / developer-relations owner    Effort: Extra small*

*Where: .github repository profile README.md*

**What I found:**  The GitHub organization's profile README never mentions the Vault product or links to vault.hyperiux.com. My guess is this README is maintained for the agency side of the business independently of the Vault product team.

**Why it matters:**  This is a missed, low-cost discovery opportunity for anyone who finds the org on GitHub first.

**What I want the team to do:**

1. Add a clear link to vault.hyperiux.com and a short description of the Vault product to the org profile README.

> **How I'll know it's done:**  The org profile README links to vault.hyperiux.com, confirmed by re-fetching the profile.

### Step 46 — Bring GitHub Releases up to date with the real published versions

*Finding: F-011*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — spare capacity    Owner: Engineering / release owner    Effort: Small*

*Where: github.com/.../hyperiux-components/releases and the publishing workflow*

**What I found:**  The GitHub Releases page's latest entry is v1.0.72, while the actual latest published version on npm and in the CHANGELOG is 1.0.75 — three versions behind. My guess is Release tagging on GitHub simply isn't part of the current publish workflow, or has been skipped for recent patch releases.

**Why it matters:**  Anyone checking GitHub Releases as their reference for the current version gets stale information.

**What I want the team to do:**

1. Create GitHub Release entries for the missing v1.0.73, v1.0.74, and v1.0.75 versions.
2. Add GitHub Release creation as an explicit step in the publish checklist going forward, so this doesn't fall behind again.

> **How I'll know it's done:**  GitHub Releases' latest tag matches npm's dist-tags.latest after this fix, and stays in sync after each future publish.

### Step 47 — Reconcile the generic npm governance checklists with the CLI's real architecture

*Finding: F-019*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — spare capacity    Owner: Engineering / documentation owner    Effort: Small*

*Where: npm-package-release-checklist.md, npm-package-security-checklist.md, npm-package-agency-sop.md*

**What I found:**  These three uploaded governance documents describe a generic TypeScript-bundled release process with steps like a coverage threshold check, which doesn't match the CLI's actual, real, tested architecture of plain Node.js with no build/bundle step.

**Why it matters:**  A checklist item that doesn't apply to the real toolchain either fails when someone tries to follow it literally, or is silently skipped — either way it gives false assurance that the checklist was actually completed.

**What I want the team to do:**

1. Either adapt these three documents to reflect the CLI's real, plain-Node.js architecture, or clearly mark the inapplicable sections as aspirational or not-yet-applicable so nobody follows them as if they were accurate today.

> **How I'll know it's done:**  The three governance documents either accurately reflect the real toolchain, or clearly flag which sections don't apply yet.

### Step 48 — Decide whether the social media bios should mention Vault

*Finding: F-032*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — this is an owner decision, not a bug    Owner: Marketing / product owner    Effort: Extra small*

*Where: x.com/\_hyperiux\_ and instagram.com/\_hyperiux\_ bio text*

**What I found:**  Both the official X/Twitter and Instagram bios describe the brand as a 'Conversion Focused Digital Experience Design Agency' with no mention of the Vault product, while the live website positions Hyperiux Vault as a self-serve UI effects and component library. The two channels currently tell a different story about what the company does — agency-first on social, product-first on the website.

**Why it matters:**  This may well be entirely intentional — the agency positioning could be the lead-generation front door, with Vault as the productized upsell — which is why I'm treating this as a decision to be made rather than a defect to be fixed.

**What I want the team to do:**

1. Decide, as a positioning call, whether to update the bios to mention Hyperiux Vault directly, or to confirm the current agency-first social positioning is intentional and leave it as is.
2. If a change is made, re-check both bios afterward to confirm the update is live. If no change is made, I'd document that the current split positioning is intentional so it doesn't get flagged again as if it were an oversight.

> **How I'll know it's done:**  Either both bios are updated to reflect Vault, or the current split positioning is explicitly documented as an intentional decision.

### Step 49 — Fix the acronym capitalization on the WebGL Slider heading

*Finding: F-030*

*Severity: Low    Evidence: Directly observed*

*Execution priority: Housekeeping — spare capacity    Owner: Frontend / content owner    Effort: Extra small*

*Where: The webgl-slider effect page*

**What I found:**  This page's on-page H1 heading renders as 'Webgl Slider' with a lowercase 'gl', while its &lt;title&gt; tag correctly renders 'WebGL Slider'. The same effect name is being generated in two different places on the same page with two different capitalization results.

**Why it matters:**  Small, but it's the kind of visible inconsistency worth cleaning up whenever the team is next in that part of the template.

**What I want the team to do:**

1. Find wherever the H1 heading text is generated for this page and correct the capitalization to match the correctly-capitalized &lt;title&gt; tag.
2. Check whether this same generation logic is shared by any other acronym-named effects, so the same fix covers any other instance rather than just this one page.

> **How I'll know it's done:**  The H1 heading and the &lt;title&gt; tag both correctly render 'WebGL Slider' with the same capitalization.

### Step 50 — Reconcile the documented live-tweakable controls feature with what's actually live

*Finding: F-021*

*Severity: Low    Evidence: Directly observed live against a claim in an internal document*

*Execution priority: Housekeeping — roadmap status check    Owner: Product / engineering owner    Effort: Small*

*Where: LIVE\_CONTROLS\_PROPS.md and the effect detail pages for the 32 components it names*

**What I found:**  An internal document, LIVE\_CONTROLS\_PROPS.md, describes a per-effect 'live-tweakable controls' feature in detail — Leva-style sliders and color pickers — for 32 named components. I did not observe this feature on any live effect detail page I checked in this audit; every page I saw showed only static code panels.

**Why it matters:**  Either this is a real, planned feature that hasn't shipped yet, in which case the documentation is simply ahead of the product, or it's a feature that was scoped and then deprioritized without the documentation being updated to reflect that. Either way, it's worth a quick decision so the documentation isn't misleading anyone about current product capability.

**What I want the team to do:**

1. Confirm with whoever owns the product roadmap whether live-tweakable controls are still planned, and if so, on what timeline.
2. If the feature is still planned, no immediate action is needed beyond noting the current gap. If it's been deprioritized or shelved, update LIVE\_CONTROLS\_PROPS.md to reflect that so it doesn't describe a feature as current when it isn't.

> **How I'll know it's done:**  LIVE\_CONTROLS\_PROPS.md accurately reflects the feature's real current status, whether that's 'planned', 'in progress', or 'not currently planned'.

## What this document does and doesn't cover

This document covers every finding I have personally verified across this audit, either by direct reproduction, direct reading of the real source, or direct observation of the live product — 50 in total, each with its own step above. It is not a claim that every possible defect in Hyperiux Vault has been found. I want to update something I said in an earlier draft of this document: a review at that time raised a long list of additional, quite specific component-runtime findings — offscreen and hidden-tab suspension, coarse-pointer fallback handling, canvas/WebGL semantic treatment, DPR ceilings, WebGL context-loss recovery, GPU resource disposal, and a number of others — and at that point I said I'd looked and found none of them in my own evidence trail. I went back this round and did the targeted grep across all 115 effects that I should have done the first time. Most of that list turned out to be real: I've added them above, each with the same file-and-line-level evidence standard as everything else in this document, in the new P2 section on catalogue-wide component and accessibility gaps. A few items from that same review did not hold up on inspection, and I've said explicitly which ones and why in that section's intro rather than silently dropping them. This remains a confirmed-findings remediation plan, not a claim of completeness against some larger, unseen catalogue of issues — but it's a materially more complete one than my previous draft, and I'd rather be corrected and fix the document than stand by an earlier all-clear that turned out to be premature.

## What I checked and found clean

I want to also be explicit about what I checked and did not find a problem with, since a document made up entirely of findings can read as though the whole product is in bad shape, and that isn't an accurate picture.

- I did a full live crawl of all 115 effect pages across this and earlier rounds of the audit: zero broken images, zero missing or malformed canonical tags, and beyond the specific page-level issues called out above (F-012, F-028, F-029, F-030), overall site health is good.
- I walked all of the core user journeys myself — sign-up, Cmd+K search, and the custom-animation-request contact form — and all three work correctly at the rendering and interaction level, with no functional bugs found.
- The component identity resolution across all 115 effects is fully closed: I censused every registry.json and live-opened every corresponding page, and the catalogue is what it claims to be.

## How I'd sequence this

If I were running this as a single program of work rather than a list of independent tickets, I'd sequence it roughly like this. Start F-034 and F-035 immediately and in parallel. F-034 is an active production security incident. F-035 is a Critical release-integrity blocker that must be fixed before any registry regeneration or F-022 remediation. Get the refund-policy conflict (F-015) in front of whoever owns that decision the same week, since it's a review task with no engineering dependency and can move independently of everything else. Start building the shared motion-lifecycle foundation (F-018a) as soon as it can be scheduled, since the full 115-demo rollout that follows it (F-018b) is the largest single piece of engineering work in this whole document and benefits from the foundation landing early. Everything else in the P1 tier, including Animated Modal (F-041), can follow over the next one to two weeks, largely in parallel across whichever owners are free, since most of those steps don't depend on each other except where I've explicitly called out a dependency. The P2 engineering items, and both appendices, are genuinely fine to fold into normal sprint and content planning whenever there's room.

I don't have deploy or production access myself, so every step above is written as complete, ready-to-execute instructions for whoever on the team does have that access, not as something I'm going to go do myself.

## How I'd disposition this for ticket creation

If the team is turning this into tracked tickets, here's how I'd group it:

| **Disposition** | **Items** |
| --- | --- |
| Ready for a ticket now | F-034, F-035, F-036, F-037, F-038, F-039, F-026, F-025, F-027 — these have concrete, testable acceptance criteria as written. |
| Ready for a ticket, but confirm the open question I flagged first | F-015 (confirm the intended refund policy before writing the fix), F-017 (confirm whether a generation pipeline or an interim CI check is the target architecture), F-024 (confirm whether the folder path is referenced elsewhere before treating the move as trivial). |
| Two tickets, sequenced | F-018a (shared motion-lifecycle foundation) followed by F-018b (catalogue-wide rollout) — don't collapse these back into one ticket, since they have different owners of risk and different completion criteria. |
| Content or product tickets, not engineering tickets | F-012, F-028, F-029 (content-record completion, separate from any code change), F-013, F-002. |
| Route to Appendix A / Appendix B owners directly | F-006, F-016, F-007, F-008, F-020, F-009, F-010, F-011, F-019, F-032, F-030, F-021 — these don't need engineering sprint capacity at all. |

## Appendix C — Rejected or Superseded Hypotheses

I want a record of what I checked and specifically ruled out this round, not just what I confirmed, so the next audit doesn't have to re-derive the same negative result. Each entry below is a hypothesis I actively investigated — not something I skipped — with the method I used, the result, and why I'm not carrying it forward as a finding. A methodological note that applies to the 'Source revision' field on all three: the archive I was given for this audit has no .git directory (git rev-parse --is-inside-work-tree returns 'fatal: not a git repository'), so there is no real commit hash available anywhere in this document, including here. I've used a plain descriptive label for the archive instead of a hash, and I want that limitation on the record rather than implying a precision I don't actually have.

### a) Global Lenis duplication

**Original hypothesis:**  Multiple effects independently instantiate their own Lenis smooth-scroll instances, causing ownership conflicts when combined on one page.

**Query/inspection method:**  grep -rn "new Lenis(" registry/effects/

**Result:**  Exactly 1 match, in webgl/3d-portfolio-slider/PortfolioSlider.jsx.

**Why rejected:**  Only one effect in the entire 115-effect catalogue creates a Lenis instance — there is no multi-instantiation pattern to conflict.

**Date:**  2026-07-19

**Source revision/hash:**  hyperiux-pro-components-master archive (no git metadata present, extracted static copy) — no real commit hash is obtainable from this artifact.

### b) Duplicate accessible text

**Original hypothesis:**  Elements exist with both visible text content and a redundant aria-label, causing screen readers to announce the text twice.

**Query/inspection method:**  Grepped for aria-label= co-occurring with visible child text across a 16-file sample, then manually inspected each match.

**Result:**  Found cases (e.g. buttons/scramble-link-button/index.jsx:197, scroll/scroll-distortion/index.jsx:706-708) where aria-label wraps split/animated per-character spans marked aria-hidden="true" — this is the correct, standard technique for accessible text that's visually broken into individual character spans, not a duplication bug.

**Why rejected:**  No genuine double-announcement pattern found; the aria-label usage is functioning as intended.

**Date:**  2026-07-19

**Source revision/hash:**  hyperiux-pro-components-master archive (no git metadata present, extracted static copy) — no real commit hash is obtainable from this artifact.

### c) Autoplay without muted

**Original hypothesis:**  Video elements using autoPlay don't also set muted, violating browser autoplay policy and likely causing playback to silently fail.

**Query/inspection method:**  Located and read all 4 files with &lt;video&gt; elements (components/video-player/VideoPlayerComp.jsx, cursor/pixel-bloom/index.jsx, webgl/draggable-canvas/index.jsx, navigation/expanding-navbar/ExpandingNavbarDesktop.jsx), and checked each for autoPlay/muted pairing.

**Result:**  All 4 correctly pair autoPlay with muted (e.g. pixel-bloom/index.jsx:374,376; video-player defaults both autoPlay=true and startMuted=true).

**Why rejected:**  The claim is factually false for this codebase — autoplay policy compliance is already correct. Note: the related, different finding that none of the 4 videos have &lt;track&gt; caption elements is still valid and remains in this document as its own step (F-056) — only the autoplay/muted half was ever rejected.

**Date:**  2026-07-19

**Source revision/hash:**  hyperiux-pro-components-master archive (no git metadata present, extracted static copy) — no real commit hash is obtainable from this artifact.

## Appendix D — Finding ID Crosswalk

This is a clean, settled mapping between this document's own F-numbered finding IDs and the canonical audit IDs (HV-FND-\*) used elsewhere in the programme's tracking. The mapping is not disputed or provisional — every row below is a direct one-to-one correspondence, not an inference.

| **Finding ID** | **Canonical Audit ID** |
| --- | --- |
| F-034 | HV-FND-B4-002 |
| F-035 | HV-FND-B4-003 |
| F-036 | HV-FND-B3-001 |
| F-037 | HV-FND-B4-009 |
| F-038 | HV-FND-B4-010 |
| F-039 | HV-FND-B4-011 |
| F-040 | HV-FND-B4-017 |
| F-041 | HV-FND-B8-005 |
