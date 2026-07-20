# Audit Action Summary — Repo Fixes

Short, priority-ordered checklist of what needs to change **in this repository** (`hyperiux-pro-components`). Each item: what to fix, why, and the file(s)/example. Full detail lives in `Hyperiux_Vault_Confirmed_Findings_Remediation_Plan.md`.

Legend: **P0** = start today · **P1** = 1–2 weeks · **P2** = normal cadence.

---

## P0 — Critical, start today

**1. Stop Pro source-code leak (F-034)**
Pro effect source is attached to the page object *before* any auth check, so signed-out users get it (83/83 leaking). Run `auth()`/`canAccessEffect()` before `getEffectBySlug()`; split loader into public vs. authorized functions.
→ `apps/docs/src/app/(app)/effects/[slug]/[effectSlug]/page.js`, `apps/docs/src/lib/registry.js`

**2. Fix self-destructing registry build (F-035)**
`detectExport()` *throws* on files with 2+ ambiguous named exports (9 files), halting the build after 11/115 entries — yet exits 0. Make it return a sentinel, write output atomically, and `process.exit(1)` on error.
→ `apps/docs/scripts/build-registry.js` (e.g. `border-beam/styles.js`, `webgl/book-flip/PageContext.jsx`)

---

## P1 — High, within 1–2 weeks

**3. Supabase must be single source of truth for Pro (F-038)**
On Supabase error, `getUserPlan()` falls back to trusting Clerk `publicMetadata` (fail-open). Use a short-lived signed server cache instead; never grant from metadata alone.
→ `apps/docs/src/lib/subscription.js` — `getUserPlan()`

**4. Remove hard-coded admin email fallback (F-037)**
`const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hitesh@weareenigma.com";` grants admin if the env var is unset. Remove fallback (fail closed), key admin off Clerk role/ID.
→ `apps/docs/src/app/(app)/dashboard/admin/layout.js` + 11 other admin/API routes

**5. Make founding-slot allocation atomic (F-039)**
Count → select plan → create subscription are 3 non-atomic steps; concurrent signups can oversell the 100-slot cap. Use `SELECT ... FOR UPDATE SKIP LOCKED`/RPC + idempotency key + expiry.
→ `apps/docs/src/app/api/razorpay/create-subscription/route.js`

**6. Fix broken listing pagination (F-014)**
Category and `/effects/free` pages cap at 12 cards and pagination controls do nothing — hides most of the catalogue. Fix pagination component; likely shares root cause with F-022.
→ effects listing pages / pagination component (verify vs. F-022)

**7. Fix live registry duplicate entries (F-022)**
`/r/index.json` serves 230 entries for 115 effects (stale output). **Blocked on F-035** — after that fix, regenerate and redeploy a clean 115-entry index.
→ regenerate via `apps/docs/scripts/build-registry.js`, output `public/r/index.json`

**8. Fix three broken Pro effect pages (F-028)**
Missing Sanity content records leave these pages blank (no Pro-lock UI). Make the template fall back to a registry-tier-driven Pro-lock when CMS body is missing.
→ `effect-detail.jsx` template; effects `progressive-bloom-valley`, `3d-portfolio-slider`, `strip-slider`

**9. Add baseline CI/CD to this repo (F-027)**
Repo shipping the real product has **no CI, no CODEOWNERS, no SECURITY.md**. Add lint + `build-registry.js` validation + secret scan, and CODEOWNERS for auth/payment/registry.
→ `.github/workflows/`, `CODEOWNERS`

**10. Fix Animated Modal accessibility + scroll bug (F-041)**
No `role="dialog"`/`aria-modal`, no focus trap/return, and on close it resets `body.overflow` to `''` instead of the prior value. Add dialog semantics, focus trap, capture/restore overflow.
→ `registry/effects/components/animated-modal/AnimatedModalContent.jsx`

**11. Auto-generate public mirror from private registry (F-017)**
Free-tier effects are manually copied to the public repo → drift. Generate the mirror from the canonical source; interim CI diff-check + entry-file lint rule.
→ `build-registry.js` entry-detection + CI (depends on F-027)

---

## P2 — Normal cadence (registry / component-quality)

**12. Consolidate the two Pro-delivery APIs (F-040)**
Web and CLI routes each implement Pro auth separately → drift risk. Extract one shared access-decision function returning a typed decision object.
→ `/api/effects/[slug]`, `/api/cli/effects/[effectSlug]`

**13. Fail build on missing `tier` field (F-025)**
Build silently defaults missing `tier` to `'free'` (fail-open). Hard-fail instead — no implicit default either direction.
→ `apps/docs/scripts/build-registry.js`

**14. Fix folder-vs-name mismatch (F-023)**
Folder `interactive-hover-slider` but `name: 'hover-slider'`. Rename either side to match; add a CI lint for it.
→ `registry/effects/webgl/interactive-hover-slider/registry.json`

**15. Move folder to match category (F-024)**
`progressive-bloom-valley` sits in `scroll/` but declares `category: 'webgl'`. Check path references first, then move (staged if referenced).
→ `registry/effects/scroll/progressive-bloom-valley` → `.../webgl/`

**16. Pause animation when hidden/offscreen (F-042)**
59/60 rAF-driven effects never pause on hidden tab or offscreen → CPU/GPU/battery drain. Build one shared rAF wrapper (visibilitychange + IntersectionObserver); model on `border-beam`.
→ `registry/effects/{cursor,webgl,scroll,backgrounds}/**`

**17. Add touch/coarse-pointer fallback (F-043)**
12/16 cursor effects are mouse-only → broken on touch. Add `matchMedia('(pointer: coarse)')` fallback; reference `fish-eye`, `inertia-img`.
→ `registry/effects/cursor/**`

**18. Add ARIA semantics to WebGL canvases (F-044)**
0/15 canvas effects set `aria-hidden` or `role="img"` → opaque to screen readers. Add the right attribute per effect (mostly `aria-hidden="true"`).
→ `registry/effects/webgl/**`

**19. Cap devicePixelRatio (F-045)**
7 files read raw `devicePixelRatio` (can be 3–4x) → severe perf loss. Apply `Math.min(dpr, 2)` like the other 14 files.
→ `dotted-grid`, `spider-particles`, `gooey-counter`, `pixel-bloom`, `pixel-transition`, `interactive-blur-reveal`, `text-cloning`

**20. Add WebGL context-loss recovery (F-046)**
0/18 WebGL effects handle `webglcontextlost`/`restored` → permanent blank canvas after GPU loss. Add shared listeners (`preventDefault` + re-init).
→ `registry/effects/webgl/**`

**21. Dispose Three.js GPU resources (F-047)**
3 effects never call `.dispose()` → GPU memory leak on remount. Add disposal for geometries/materials/textures.
→ `book-flip`, `colliding-models`, `grid-tunnel`

**22. Implement WAI-ARIA Tabs pattern (F-048)**
`animated-tabs` is click-only (no `role`, `aria-selected`, arrow keys). Add full tablist/tab/tabpanel semantics + roving-tabindex.
→ `registry/effects/components/animated-tabs`

**23. Carousel hover-pause + slide announcements (F-049)**
Only 1/5 pauses on hover; 0/5 have `aria-live`. Roll out `ring-carousel`'s hover-pause + add live-region announcements.
→ `registry/effects/carousels/**`

**24. Focus trap/return for nav menus (F-050)**
0/4 nav/menu effects trap focus or return it on close. Add focus trap + capture/restore trigger focus.
→ `registry/effects/navigation/**`

**25. Associate form errors with fields (F-051)**
`ContactForm` errors are unlinked `<p>` text (no `aria-describedby`/`aria-invalid`). Link each error to its input.
→ `registry/effects/components/animated-form`

**26. Document loaders as decorative (F-052)**
3 loaders are fixed-duration timers, not real load indicators. Document clearly; optionally add `isLoading`/`onComplete` prop.
→ `lines-loader`, `numeric-tunnel`, `stack-loader`

**27. Re-split text on resize (F-053)**
13 text effects split once at mount, never on resize → stale layout after rotate/resize. Add debounced resize re-split (shared util).
→ `registry/effects/text/**`

**28. Namespace hard-coded `id` attributes (F-054)**
11 literal `id`s across 9 files break when an effect renders twice (SVG `url(#id)` collides). Replace with `useId()`; prioritize `gooey-counter`, `pixelated-image-effect`.
→ 9 effect files with literal `id=`

**29. Reduce picsum.photos dependency (F-055)**
201 refs across 49 effects use the no-SLA `picsum.photos`. Migrate demo assets to Hyperiux R2 CDN; document any intentional external refs.
→ effects referencing external asset URLs

**30. Add video caption tracks (F-056)**
4 `<video>` effects lack `<track kind="captions">`. Add WebVTT tracks for spoken audio; document decorative video.
→ `video-player/VideoPlayerComp.jsx`, `cursor/pixel-bloom/index.jsx`, `webgl/draggable-canvas/index.jsx`, `navigation/expanding-navbar/ExpandingNavbarDesktop.jsx`

---

## Not in this repo (noted, act elsewhere)

- **Sanity CMS:** Usage Code import path wrong on every effect page (F-012) — omits `effects/` segment; `immersive-full-screen-nav` also uses wrong slug. Long-term: generate snippet from `registry.json` `importPath`.
- **CLI (`hyperiux` npm pkg):** `--yes` also overwrites customized files (F-036) — require explicit `--overwrite` in `src/commands/add.js`.
- **Clerk dashboard:** rotate exposed `sk_test_` keyless credential (F-026).
- **Legal / content:** refund-policy conflict (F-015), Free-tier pricing table wrong (F-013), dead `/waitlist` link (F-002), plus Appendix A/B housekeeping (npm/GitHub/docs copy).
