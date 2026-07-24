# cards-runway (components)

## Summary

`cards-runway` is a GSAP ScrollTrigger-driven horizontal "runway" of cards: on desktop it pins the runway and scrubs cards in from below while translating the whole row sideways as the user scrolls through a 350vh section; on narrow viewports it swaps to a simple fade-up reveal and lets the row scroll horizontally by touch. The registry copy is structurally sound (correct `registry.json` schema, proper `gsap.context`/`ctx.revert()` cleanup, scoped selector text), but a Tailwind breakpoint rename introduced when the source was copied from `apps/docs/src/components/cards-runway/` into `registry/effects/components/cards-runway/` has desynced the CSS "mobile layout" threshold (now `1280px` via `max-[1025px]:`) from the JS branch threshold (`1024px`, [CardsRunway.jsx#L21](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L21)), producing a viewport band (~1025–1279px) where the desktop pin/scrub script runs against a DOM that's been laid out for the mobile fallback. The demo page users evaluate the component on does not exhibit this bug because it renders the *legacy* copy, not the registry copy that CLI installs actually ship.

## Implementation overview

- `registry/effects/components/cards-runway/index.jsx` — thin default-export wrapper that supplies a hardcoded 5-item `data` array and default prop values, then renders `CardsRunwayComponent` ([index.jsx#L5-L43](../../../registry/effects/components/cards-runway/index.jsx)).
- `registry/effects/components/cards-runway/CardsRunway.jsx` — the actual effect. Single `useEffect` wraps everything in `gsap.context(fn, root)` ([CardsRunway.jsx#L19-L60](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L19-L60)):
  - Desktop (`innerWidth > 1024`, [#L21](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L21)): sets initial `y: 37vw` on cards, then a scrub timeline (`trigger: root.current`, `scrub: true`) animates cards to `y: 0` staggered, followed by translating the row container `-38%` on the X axis.
  - Mobile/tablet (`innerWidth <= 1024`, [#L42-L56](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L42-L56)): a one-shot fade/slide-up reveal (`once: true`) with no horizontal translate — the row instead scrolls natively via `overflow-x-scroll`.
  - Cleanup: `return () => ctx.revert()` ([#L59](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L59)), which reverts every tween/ScrollTrigger created inside the context.
- Layout is pure Tailwind utility classes with `vw`-based sizing per `CODING_STANDARDS.md`'s "convert arbitrary px to vw" rule.
- `registry.json` declares `gsap` as the only dependency, `tier: "pro"`, `category: "components"`, entry `index.jsx`, and both files (`index.jsx`, `CardsRunway.jsx`) in the `files` array.

## Strengths

- Correct GSAP cleanup pattern: `gsap.context(..., root)` + `ctx.revert()` on unmount ([CardsRunway.jsx#L20](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L20), [#L59](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L59)) — all tweens and ScrollTriggers are torn down, and because the context is scoped to `root`, the `.cards-runway-card` / `.cards-runway-container` selector text used inside `gsap.set`/`gsap.to`/`gsap.timeline` is auto-scoped to that instance's DOM subtree (documented GSAP context behavior), so multiple instances on one page won't collide.
- `registry.json` is schema-complete and internally consistent: `name` matches the folder, `type` is `"registry:component"`, `category` is exactly `"components"`, `main` (`index.jsx`) exists, both source files are listed in `files` with correct targets, and `previewUrl` (`/demo/cards-runway`) matches the real demo route.
- Static text content (`card.title`, `card.text`) is rendered through normal JSX text nodes, so React's default escaping applies — no injection surface even if a consumer supplies custom `data`.
- `vw`-based responsive typography/spacing is consistently applied per `CODING_STANDARDS.md` §5.

## Risks and issues

### 1. CSS/JS breakpoint desync breaks the pin/scrub layout for ~1025–1279px viewports — **Critical**

The JS branch that decides which GSAP timeline to build switches at `innerWidth > 1024` ([CardsRunway.jsx#L21](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L21)). But every Tailwind class that switches the section from the desktop pin/scrub layout to the mobile fallback layout uses `max-[1025px]:`, and this codebase's `xl` breakpoint is the Tailwind v4 default of **1280px** (not overridden — only `--breakpoint-sm: 768px` and `--breakpoint-md: 1025px` are customized in [apps/docs/src/app/globals.css#L86-L87](../../../apps/docs/src/app/globals.css#L86-L87)). Concretely:

- Section height: `h-[350vh]` is overridden by `max-[1025px]:h-screen` ([CardsRunway.jsx#L65](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L65)) at any width below 1280px, collapsing the ScrollTrigger's trigger element from a 350vh scroll runway down to a single viewport.
- Pinning: `sticky` is overridden by `max-[1025px]:static` ([CardsRunway.jsx#L68](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L68)) below 1280px, so the visual "pin" (achieved via CSS `position: sticky`, not GSAP `pin:true`) is lost.
- `overflow-hidden` is overridden by `max-[1025px]:overflow-x-scroll` below 1280px, enabling native horizontal scroll on the same container GSAP is about to apply `translateX: -38%` to.

For any width from 1025px to 1279px (common laptop/tablet-landscape range, e.g. an 11" iPad Pro in landscape at 1194px, or a non-maximized browser window), the JS reads `innerWidth > 1024` as **true** and builds the full desktop scrub/pin timeline, while the DOM it's animating has already switched to the collapsed-height, non-sticky, native-horizontal-scroll "mobile" layout via `max-[1025px]:`. The scrub range GSAP computes will be based on a ~100vh trigger instead of 350vh, so the staggered reveal + horizontal translate compresses into a very short scroll distance, and the GSAP `translateX` transform will fight the native `overflow-x-scroll` behavior on the same element.

This is confirmed by directly diffing against the working legacy copy at `apps/docs/src/components/cards-runway/CardsRunway.jsx`, which the live demo actually renders: it uses `max-md:` (1025px — matching the JS 1024 threshold) and `max-sm:` (768px) everywhere the registry copy uses `max-[1025px]:`/`max-md:` respectively. The full diff:

```
< max-md:overflow-hidden max-md:h-fit max-sm:py-[25%] max-md:py-[12%]      (legacy - CardsRunway.jsx#L65)
> max-[1025px]:overflow-hidden max-[1025px]:h-screen max-md:py-[25%] max-[1025px]:py-[12%]   (registry - CardsRunway.jsx#L65)

< max-md:h-fit max-md:static ... max-md:mt-[40vw] ... max-md:overflow-x-scroll ... max-md:pr-[7vw]   (legacy #L68)
> max-[1025px]:h-fit max-[1025px]:static ... max-[1025px]:mt-[40vw] ... max-[1025px]:overflow-x-scroll ... max-[1025px]:pr-[7vw]    (registry #L68)

(same max-md→max-xl / max-sm→max-md rename repeats at #L69, #L74, #L79, #L85, #L87-89)
```

In other words: the registry (CLI-shipped) copy is not merely stale relative to the demo copy — it has been actively re-authored with a shifted breakpoint scheme that breaks the intended alignment between the script's device-class check and the CSS layout it depends on, while the copy customers actually preview via the demo page still works correctly. Because this only reproduces in a specific viewport band, I did not visually confirm the exact on-screen glitch in a browser — the above is derived directly from the code and from GSAP ScrollTrigger's documented behavior (scrub range and pin fidelity are a function of the trigger element's actual layout box). Recommend a manual QA pass at 1025–1279px widths before flagging this as fixed.

### 2. No `prefers-reduced-motion` handling — **Medium**

The entire scroll-scrub/pin experience (and the mobile fade-up fallback) runs unconditionally regardless of the user's OS-level reduced-motion preference — no `matchMedia('(prefers-reduced-motion: reduce)')` check anywhere in [CardsRunway.jsx#L19-L60](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L19-L60). Confirmed via repo-wide grep for `prefers-reduced-motion`/`matchMedia` in the effect folder — no matches.

### 3. Missing `className` prop, contradicting the component authoring guide — **Medium**

`developer-new-component.md` Step 1 code rules explicitly require: *"Accept a `className` prop so users can override styles."* `CardsRunway` destructures `data`, `accentColor`, `cardColor`, `cardWidth`, `start` but never `className` ([CardsRunway.jsx#L10-L16](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L10-L16)), and the root `<section>` has no way to receive one ([#L63-L66](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L63-L66)). Consumers cannot override the hardcoded `bg-black`/sizing without forking the source.

### 4. `cardWidth` prop is silently ignored below the `xl` breakpoint — **Medium**

`cardWidth` is applied as an inline `style` on the card wrapper ([CardsRunway.jsx#L73](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L73)), but `max-md:w-[70vw]!` and `max-[1025px]:w-[45vw]!` on the same element ([#L74](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L74)) use Tailwind's `!important` modifier, which always wins over an inline style at those widths. A user who passes a custom `cardWidth` will only see it take effect at ≥1280px viewport width; below that it's silently overridden with no indication in props or docs that this is intentional.

### 5. `.mobile-scrollbar` class has no matching CSS rule anywhere in the repo — **Low**

`className` includes `mobile-scrollbar` ([CardsRunway.jsx#L68](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L68)), but a repo-wide search (`grep -rln "mobile-scrollbar" --include="*.css"`) returns no results, and no Tailwind scrollbar plugin is installed (`apps/docs/package.json` has no `scrollbar`-related dependency). The class is a no-op today — the native browser scrollbar renders on the mobile drag-scroll row instead of whatever custom treatment was intended. Purely cosmetic; does not block scrolling.

### 6. No `package.json` / npm tarball for this component, unlike 12 of its 14 category siblings — **Medium**

`developer-new-component.md` Steps 5 and 9 require a `registry/effects/{category}/{slug}/package.json` (`@hyperiux/{slug}` name + `peerDependencies`) and a packed `.tgz` moved to `registry/dist/`. Neither exists for `cards-runway` (confirmed via `ls registry/effects/components/cards-runway/` and `find registry/dist -iname "*cards-runway*"`). Cross-checking every `registry.json` under `registry/effects/components/`, 12 of 14 sibling effects have a `package.json` (only `border-beam` and `cards-runway` don't). I could not confirm from the available files whether the primary CLI-from-private-registry install path actually depends on the tarball/`package.json`, or only on `registry.json` + `public/r/{slug}.json` — the guide frames Steps 5/9 as the "for NPM distribution" channel specifically, which may be a secondary path. Flagging as a completeness gap against both the guide and the established pattern in this category rather than a confirmed installer break.

## Accessibility assessment

- No `prefers-reduced-motion` accommodation (Issue 3 above) — the largest a11y-adjacent gap.
- Heading level: each card renders an `<h3>` ([CardsRunway.jsx#L88](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L88)) with no `<h2>` introduced by the component itself. The one page that consumes it, `apps/docs/src/app/(marketing)/demo/cards-runway/page.js`, only has an `<h1>` before the runway ([page.js#L13-L15](../../../apps/docs/src/app/\(marketing\)/demo/cards-runway/page.js#L13-L15)), so the card titles skip a heading level (h1 → h3) in that context. Bounded, cosmetic-for-a11y-tree issue — **Low**.
- Mobile fallback uses `once: true` ([CardsRunway.jsx#L48](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L48)) so content isn't re-hidden/re-shown repeatedly, which is reasonable for screen-reader/AT users who don't scroll in the conventional sense.
- No interactive controls (buttons, links) inside the component itself, so no keyboard-trap or focus-order concerns to evaluate — it's presentational scroll content only.
- No `alt` text concerns — no `<img>`/`<Image>` usage in this effect.

## Performance assessment

- Animation work is delegated entirely to GSAP's ScrollTrigger/ticker rather than a hand-rolled `requestAnimationFrame` loop, so there is no bespoke rAF loop for this component to suspend on visibility/off-screen — see Cross-effect check below.
- `gsap.context().revert()` on unmount ([CardsRunway.jsx#L59](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L59)) removes all ScrollTriggers and tweens created by this instance, avoiding leaked scroll listeners across route changes.
- No resize listener is registered, so the desktop/mobile branch decision ([#L21](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L21)) is made once at mount and does not react to the viewport crossing 1024px afterward (e.g., rotating a tablet, or resizing a desktop browser window) without a remount. This is a real but low-severity UX detail (not re-evaluated in the dependency array, which only lists `start` — [#L60](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L60)); I'm not scoring it separately since it's a minor variant of Issue 1's root cause and not independently verified to cause visible breakage.
- Could not run an automated performance trace (no test harness invoked) to quantify actual scrub jank; this assessment is based on static code reading only.

## SEO and content-surface assessment

- Card titles/text are rendered as plain JSX text nodes present in the initial component tree, not injected after some async fetch, so they are part of what Next.js server-renders — no SEO-blocking client-only content gap.
- Heading hierarchy nit noted above (h1 → h3 skip) is a minor semantic/SEO structure issue, not a blocking one.
- No `<title>`/meta concerns here — `generateMetadata` is handled at the page level (`page.js#L28-L30`) via `getDemoPageMetadata`, outside this component's scope.

## Responsive / mobile / touch behavior assessment

- Mobile fallback intentionally trades the pinned/scrubbed desktop experience for a native horizontally-scrollable row (`overflow-x-scroll`, [CardsRunway.jsx#L68](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L68)) plus a one-shot fade-in reveal — a sound touch-first pattern, and the demo page even surfaces a "Drag" hint for touch users (`page.js#L16-L18`).
- The core issue in this assessment is Issue 1: the intended mobile-layout switch and the actual JS mobile-behavior switch disagree by breakpoint, so the "mobile-friendly" CSS layout activates ~255px earlier (at 1280px) than the JS switches to mobile-friendly behavior (at 1024px), leaving a broken middle band.
- `cardWidth` customization not honored below `xl` (Issue 4) is itself a responsive-behavior gap for anyone relying on that prop for tablet/mobile sizing.

## Maintainability and code-quality assessment

- File structure roughly follows `CODING_STANDARDS.md` §1 (imports → component → effects → return), though there are no section comments inside the `useEffect` (`CODING_STANDARDS.md` recommends short comments like `// Desktop timeline` / `// Mobile fallback` for effects with internal branches this long) — minor, **Low**.
- No dead code, no unused imports, no `console.log` present.
- Double space typo in the className string at [CardsRunway.jsx#L68](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L68) (`pb-5  max-[1025px]:mt-[40vw]`) — trivial, **Low**, also present in the legacy copy so not a regression specific to the registry version.
- The registry copy and the docs-site copy (`apps/docs/src/components/cards-runway/CardsRunway.jsx`) have drifted from each other (Issue 1's diff) — per `developer-new-component.md`, the registry copy is supposed to be a straight copy of the working docs-site source, not a re-authored variant. This drift is the direct root cause of Issue 1 and also means the two copies will diverge further over time if either is edited independently without the other being updated.
- `gsap/dist/ScrollTrigger` import path ([CardsRunway.jsx#L4](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L4)) resolves correctly per the installed `gsap@3.15.0` package's `exports` map (verified: both `gsap/ScrollTrigger` and `gsap/dist/ScrollTrigger` are valid subpaths), so this is a style nit at most, not a defect.

## Security and dependency concerns

- No secrets, tokens, or credentials in source.
- No `dangerouslySetInnerHTML`, no raw HTML injection, no `eval`/`Function` usage.
- `data` prop content is rendered through standard JSX text interpolation, which React escapes by default — no XSS surface even for consumer-supplied `data`.
- Single external dependency (`gsap`) declared in `registry.json`, matches what's actually imported ([CardsRunway.jsx#L3-L4](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L3-L4)). No unpinned/unlisted transitive imports observed.

## Browser compatibility considerations

- Uses `position: sticky` (desktop layout) — broadly supported in all evergreen browsers, no concerns.
- Uses `globalThis.innerWidth` ([CardsRunway.jsx#L21](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L21)) rather than `window.innerWidth` — functionally equivalent in all target browsers, and the `typeof window !== "undefined"` guard at module scope ([#L6-L8](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L6-L8)) correctly prevents `ScrollTrigger` registration from running during SSR.
- CSS `!important` modifier (`w-[70vw]!`) is Tailwind v4 syntax — consistent with the rest of the codebase's Tailwind v4 usage (confirmed via `@theme inline` in `globals.css`), no compatibility concern.
- No use of newer/experimental CSS or JS APIs that would need a compatibility caveat beyond the above.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches folder, `type` is `"registry:component"`, `category` is exactly `"components"`, `main` (`index.jsx`) exists, both files are listed in `files` with correct `target` paths, `previewUrl` matches the real demo route, `tier: "pro"` is consistent between `registry.json` and the public mirror `apps/docs/public/r/cards-runway.json`.
- `registry/index.json` root entry exists and mirrors the registry.json fields correctly ([registry/index.json#L377-L397](../../../registry/index.json)).
- Public mirror `target` paths (`components/hyperiux/...`) differ from `registry.json`'s own `target` field (`src/components/effects/cards-runway/...`) — verified this is expected, systemic build-script behavior (`apps/docs/scripts/build-registry.js#L256-L260` hardcodes the `components/hyperiux/{file}` target for the generated public JSON regardless of the source `registry.json`'s `target` field), not a cards-runway-specific drift or bug.
- rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate`): not present, and not applicable — this component has no hand-rolled continuous `requestAnimationFrame` loop; all animation is driven through GSAP's own ScrollTrigger/ticker machinery. Per `registry/effects/_shared/README.md`'s task list, the `components` category was never in scope for the F-042 rollout (only `webgl`, `cursor`, `backgrounds`, `scroll` tasks are listed as done), so this is correctly out of scope rather than a gap.
- Cleanup on unmount: `ctx.revert()` correctly tears down all GSAP tweens/ScrollTriggers created by this component instance ([CardsRunway.jsx#L59](../../../registry/effects/components/cards-runway/CardsRunway.jsx#L59)) — no leaked scroll listeners.
- No security issues: no secrets, no unescaped HTML injection, dependency list matches actual imports.
- No SSR/hydration hazard: `gsap.registerPlugin` is guarded by `typeof window !== "undefined"` at module scope.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If addressed, any fix must be re-verified against desktop pin/scrub behavior, the mobile fade/drag fallback, and the exact 1025–1279px band before merging, since that band is precisely where Issue 1 lives.

1. **Priority 1 (Critical):** Re-sync the registry copy's Tailwind breakpoints with the JS `innerWidth > 1024` threshold — either revert the `max-[1025px]:`/`max-md:` classes back to `max-md:`/`max-sm:` (matching the working legacy copy and this codebase's `--breakpoint-md: 1025px`), or change the JS threshold to match whatever breakpoint is intentionally chosen. Whichever direction is chosen, the two must agree.
2. **Priority 2 (Medium):** Add a `prefers-reduced-motion` check that swaps to (or skips into) the simple fade-up fallback regardless of viewport width.
3. **Priority 2 (Medium):** Add a `className` prop on the root `<section>`, per the authoring guide's requirement.
4. **Priority 2 (Medium):** Either make `cardWidth` respect all breakpoints (drop the `!important` overrides, or fold `cardWidth` into the responsive classes) or document that it's desktop-only.
5. **Priority 2 (Medium):** Decide whether `cards-runway` needs a `package.json`/npm tarball to match its 12 category siblings, or confirm and document that pro-tier components are intentionally exempt.
6. **Priority 3 (Low):** Either implement `.mobile-scrollbar` styling or remove the dead class reference.
7. **Priority 3 (Low):** Consider whether the demo page should introduce an `<h2>` ahead of the runway's `<h3>` titles, or whether the component should expose a `titleAs`/heading-level prop.
8. **Process note:** Establish that the registry copy must be a byte-for-byte (or intentionally-documented-diff) copy of the docs-site source per `developer-new-component.md`, since silent re-authoring during the copy step is what produced Issue 1.

## Final score: 5/10

## Overall severity label: Critical
