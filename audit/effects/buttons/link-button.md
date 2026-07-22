# link-button (buttons)

## Summary

`link-button` is a small, single-file (`index.jsx`) client component: a text link with an animated underline and a rotating `lucide-react` arrow icon, built on Next.js `Link`. The registry source itself is clean and reasonably well-written — named constants, named handlers, proper listener cleanup, vw-based responsive type, no hardcoded colors. However, the audit surfaced two concrete, verifiable breakages outside the `index.jsx` file: the packaged npm tarball for this component ships without any component source at all (a `package.json`/`files` mismatch), and the live docs demo page does not render the registry component — it renders an older, diverged local copy that still contains the exact `scale-150` visual bug the registry's own changelog claims was fixed in v1.0.1. Within the component itself, the main gaps are a missing `prefers-reduced-motion` guard and a screen-reader-only string that announces a raw `href` value rather than meaningful text.

## Implementation overview

- Single file: [`registry/effects/buttons/link-button/index.jsx`](../../../registry/effects/buttons/link-button/index.jsx) (88 lines), no sub-components.
- Renders a Next.js `<Link>` wrapping a flex row: an underline `<span>` (`btnText`), a hidden `<span className="sr-only">`, and a `lucide-react` icon (`ArrowRight` by default, overridable via `icon` prop).
- `useLayoutEffect` measures `window.innerWidth` against `TABLET_BREAKPOINT = 1025` to decide whether the underline/icon-rotate animation is driven by CSS `group-hover` (desktop) or by click-toggled React state (`isIconRotated`, for touch/tablet where hover doesn't apply cleanly).
- `onLinkClick` toggles `isIconRotated`, optionally calls `event.preventDefault()` when `disableNavigation` is set, then forwards to the consumer's `onClick`.
- A `<style jsx>` block overrides the underline's `bottom` offset specifically when the component is rendered inside an `<li>`.

## Strengths

- Named, well-scoped constants (`DEFAULT_HREF`, `TABLET_BREAKPOINT`) instead of magic numbers — [`index.jsx#L7-8`](../../../registry/effects/buttons/link-button/index.jsx).
- Resize listener is a named function and is correctly removed in the `useLayoutEffect` cleanup — [`index.jsx#L26-37`](../../../registry/effects/buttons/link-button/index.jsx).
- `useLayoutEffect` (not `useEffect`) is used for the viewport measurement, and both SSR and initial client render use the same default state (`isCompactViewport=false`, `hasMeasuredViewport=false`), so there's no hydration mismatch and no visible flash of the wrong layout.
- Sensible touch-device accommodation: below the tablet breakpoint the underline/icon animation is driven by a tap-toggled state instead of relying on `:hover`, avoiding "sticky hover" on touch devices — [`index.jsx#L49-51`](../../../registry/effects/buttons/link-button/index.jsx), [`#L64-70`](../../../registry/effects/buttons/link-button/index.jsx).
- Uses Next.js `Link` (not a raw `<a>`), matching `CODING_STANDARDS.md` §5 "Next.js navigation and images".
- No hardcoded colors — text/underline both use `currentColor`/`text-current`, per `CODING_STANDARDS.md` core principle 2.
- Arbitrary Tailwind values are consistently expressed in `vw` with at most one decimal place (e.g. `text-[1.1vw]`, `size-[3.5vw]`), matching `CODING_STANDARDS.md` §5's px→vw and decimal-place rules.
- `registry.json` is fully schema-compliant against `developer-new-component.md` (see "What was checked and found clean").

## Risks and issues

### 1. npm tarball for this component contains no source code (High)

`registry/effects/buttons/link-button/package.json` declares:

```json
"main": "link-button.jsx",
"files": ["link-button.jsx", "registry.json"]
```

— [`registry/effects/buttons/link-button/package.json#L5-9`](../../../registry/effects/buttons/link-button/package.json). No file named `link-button.jsx` exists in the folder; the actual (and only) source file is `index.jsx`. Because `npm pack`'s `files` allowlist doesn't include `index.jsx`, the built tarball omits it. Verified directly:

```
$ tar -tzf registry/dist/hyperiux-link-button-0.0.1.tgz
package/package.json
package/registry.json
```

The packed distributable is missing the component entirely. Per `developer-new-component.md` Step 9 / "Things That Will Break It," this is exactly the kind of packaging drift the doc warns about, and it means anyone installing this specific tarball gets a package with no `LinkButton` export. This same `"main": "{slug}.jsx"` / actual-file-is-`index.jsx"` pattern also appears in every other `registry/effects/buttons/*/package.json` checked (`animated-toggle`, `arrow-fill-button`, `char-stagger-button`, `char-stagger-primary-button`, `dot-fill-button`, `scramble-link-button`), so this looks like a repo-wide template artifact rather than something unique to `link-button` — but it is still a real, confirmed defect in this component's own package as shipped, and is reported for `link-button` per this audit's scope. Note: the primary CLI install path (`apps/docs/public/r/link-button.json`) is unaffected by this, since it embeds source directly and is generated from `registry.json`, not from `package.json`/`npm pack`.

### 2. Live demo does not render the registry component, and reintroduces the exact bug the registry's changelog says was fixed (High)

The demo page imports from a different, diverged local copy, not the registry source:

```js
import LinkButton from "@/components/link-button";
```

— [`apps/docs/src/app/(marketing)/demo/link-button/page.js#L1`](<../../../apps/docs/src/app/(marketing)/demo/link-button/page.js>), resolving to [`apps/docs/src/components/link-button/index.jsx`](../../../apps/docs/src/components/link-button/index.jsx), not `registry/effects/buttons/link-button/index.jsx`.

That local copy still contains `scale-150` in its `Link` className:

```
className={`group block w-fit cursor-pointer scale-150 text-[1.1vw] ...`}
```

— [`apps/docs/src/components/link-button/index.jsx#L79`](../../../apps/docs/src/components/link-button/index.jsx). The registry's own changelog states v1.0.1 "Removed an errant scale-150 class that rendered the link at 1.5x size" — [`registry/effects/buttons/link-button/registry.json#L5`](../../../registry/effects/buttons/link-button/registry.json). The public-facing demo at `/demo/link-button` therefore still visibly renders the button at 1.5x scale, i.e. the exact bug the changelog claims is fixed, because it's showing stale, unsynced code rather than the shipped registry component.

Separately, the two implementations have diverged prop APIs: the registry component takes a `btnText` prop ([`registry/effects/buttons/link-button/index.jsx#L11`](../../../registry/effects/buttons/link-button/index.jsx)), while the demo page's local copy takes `text` / `mobileText` / `textColor` / `clickedColor` / `children` ([`apps/docs/src/components/link-button/index.jsx#L13-25`](../../../apps/docs/src/components/link-button/index.jsx)). The demo page passes `text="Hover me"` — [`apps/docs/src/app/(marketing)/demo/link-button/page.js#L22`](<../../../apps/docs/src/app/(marketing)/demo/link-button/page.js>). If the demo were pointed at the registry component as-is, the button text would render empty, since `text` is not a recognized prop there. This means the live demo cannot currently be used to verify the actual installable component's behavior or API surface, and no automated check enforces the two stay in sync.

*(Not counted as a separate finding: a third, unrelated `LinkButton` also exists at [`apps/docs/src/components/WebsiteComps/LinkButton.jsx`](../../../apps/docs/src/components/WebsiteComps/LinkButton.jsx), a GSAP-based implementation used elsewhere on the marketing site. It shares the name but is a distinct component, not part of this effect's install/demo path — noted here only for completeness under the slug/naming-drift check.)*

### 3. No `prefers-reduced-motion` handling (Medium)

The underline transform (`transition-transform after:duration-500`) and icon rotation (`transition-transform duration-300`) run unconditionally — [`index.jsx#L64,70,77`](../../../registry/effects/buttons/link-button/index.jsx). There is no `motion-reduce:` Tailwind variant, no CSS `@media (prefers-reduced-motion: reduce)` block, and no JS `matchMedia` check anywhere in the file. Bounded impact (a single small transform, not a large/vestibular-triggering animation), but it is a real, checkable gap per the rubric.

### 4. Screen-reader-only text announces a raw `href` rather than meaningful text (Medium)

```jsx
<span className="sr-only">About {href}</span>
```

— [`index.jsx#L75`](../../../registry/effects/buttons/link-button/index.jsx). This text is concatenated into the link's accessible name alongside `btnText`. With the default `href="#"`, a screen reader announces "\<btnText\> About #" — meaningless. With a real path (e.g. `/services/consulting-2024`), it announces the raw URL segment rather than a human-readable description, which is a lower-quality signal than a proper `aria-label` naming the destination. This is a moderate, bounded a11y content-quality gap, not a blocking failure (the link still has a non-empty accessible name and remains operable via keyboard).

### 5. Contextual `<li>` selector coupling is undocumented (Low)

```jsx
<style jsx>{`
  li :global(.btn-link-line)::after {
    bottom: -20%;
  }
`}</style>
```

— [`index.jsx#L81-85`](../../../registry/effects/buttons/link-button/index.jsx). This silently changes the underline's vertical offset only when some ancestor happens to be an `<li>`, with no comment, prop, or documentation explaining why, and no example of this usage in the demo page. A consumer who nests this in a `<li>` for unrelated reasons gets an unexplained style change; a consumer who needs the `-20%` offset outside a list has no way to opt in. Minor readability/maintainability nit per `CODING_STANDARDS.md`'s "comments explain why" principle.

### 6. JS-driven touch breakpoint doesn't line up with the CSS breakpoints used in the same component (Low)

`TABLET_BREAKPOINT = 1025` — [`index.jsx#L8`](../../../registry/effects/buttons/link-button/index.jsx) — governs the JS switch between hover-driven and click-driven underline behavior, but the Tailwind classes in the same file only branch at `max-md` (768px, per project convention) and `max-sm` (640px) — e.g. [`index.jsx#L16,51,60`](../../../registry/effects/buttons/link-button/index.jsx). In the 769px–1024px range (common tablet/landscape widths), the component behaves in "touch/click" mode for the underline animation while still using desktop-sized text/icon classes. Cosmetic inconsistency, not a functional break.

### 7. Resize listener is unthrottled (Low)

`onResize` calls two `setState`s on every native `resize` event with no debounce/throttle — [`index.jsx#L26-29`](../../../registry/effects/buttons/link-button/index.jsx). For a component this cheap to re-render the practical impact is negligible, but it's worth noting given the component intentionally listens on `window` rather than using a `ResizeObserver` or CSS-only approach.

## Accessibility assessment

- Link is a real `<a>` (via Next `Link`), keyboard-focusable and operable by default — no custom click-only interaction that bypasses native semantics.
- Decorative `ArrowRight` icon is automatically given `aria-hidden="true"` by `lucide-react`'s `Icon` component when no children/a11y props are passed (confirmed in `apps/docs/node_modules/lucide-react/dist/esm/Icon.js`), so it does not pollute the accessible name or get announced as a separate control. Clean.
- The `sr-only` "About {href}" string is a real, if bounded, content-quality issue — see Issue 4 above (Medium).
- No `prefers-reduced-motion` handling — see Issue 3 above (Medium).
- No explicit `focus-visible` styling is defined in this file; focus ring behavior falls through to whatever global/browser default applies. Not flagged as a separate finding since no custom `outline: none` or focus-suppressing style is present in this component — it neither adds nor removes focus visibility.

## Performance assessment

- No `requestAnimationFrame` loop of any kind exists in this component — it is pure CSS transition + one `resize` listener. The rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate`, per `registry/effects/_shared/README.md`) is not applicable here, and per this audit's instructions is only a Medium finding when a genuine continuous rAF loop exists — it doesn't, so no finding is raised for that pattern's absence.
- Only one event listener (`window.resize`) is attached, and it is correctly removed on unmount — [`index.jsx#L34-36`](../../../registry/effects/buttons/link-button/index.jsx). No leak.
- No unbounded loops, no large data structures, no WebGL/Canvas resources to dispose.
- Minor: unthrottled resize handler (Issue 7, Low) — cannot be verified as a real-world problem without a profiling run; noting the pattern only, not asserting measured impact.

## SEO and content-surface assessment

- Component renders a real `<a href>` server-renderable link (via Next `Link`), so its destination and visible text are crawlable and indexable — no client-only navigation hiding the link from crawlers.
- `btnText` has no default value and no `PropTypes`/runtime validation; if omitted, the link renders with visually empty text content, which would be both an SEO and a11y regression for that instance, though this is standard "required prop, no fallback" behavior consistent with the rest of the codebase's approach (no PropTypes usage was found in this file).
- The demo page (the only public-facing surface for this effect) sets `<title>`/OpenGraph metadata via `getDemoPageMetadata("link-button")` — [`apps/docs/src/app/(marketing)/demo/link-button/page.js#L50-52`](<../../../apps/docs/src/app/(marketing)/demo/link-button/page.js>); the metadata source itself was not read as part of this audit (out of scope per the file list) and is not evaluated further here.

## Responsive / mobile / touch behavior assessment

- Explicit `max-md:`/`max-sm:` Tailwind variants are used for text and icon sizing, consistent with `CODING_STANDARDS.md`'s guidance to use those prefixes rather than mixing multiple responsive systems.
- Touch/tablet devices get a tap-toggled underline/icon-rotate state instead of relying purely on `:hover`, avoiding the classic "sticky hover" issue on touch screens — a thoughtful, deliberate accommodation (see Strengths).
- The JS breakpoint (1025px) used for that hover→tap switch does not align with the CSS breakpoints (768/640px) used for sizing in the same file — Issue 6 (Low).
- No horizontal-scroll or overflow risk: the component is `w-fit`, `inline-block`-based, and doesn't impose fixed widths.

## Maintainability and code-quality assessment

- File structure follows `CODING_STANDARDS.md` §1's prescribed order: `"use client"` → imports → constants → component (state → effects → derived values → return).
- Naming conventions match §2: `SCREAMING_SNAKE_CASE` constants, `camelCase` elsewhere, boolean state named as questions (`isIconRotated`, `isCompactViewport`, `hasMeasuredViewport`), `onEventName` handlers (`onResize`, `onLinkClick`).
- No dead code, no unused imports/variables, no stray `console.log` found in this file.
- The undocumented `<li>`-scoped `<style jsx>` rule (Issue 5, Low) is the one readability/maintainability nit found in an otherwise standards-conformant file.
- The cross-file drift between the registry source and the docs-site demo copy (Issue 2) is itself a maintainability risk: there is no automated check tying the two together, so they will continue to diverge silently.

## Security and dependency concerns

- No secrets, tokens, or credentials present in `index.jsx`, `registry.json`, or `package.json`.
- Single third-party dependency, `lucide-react`, used only for a decorative icon component — matches `dependencies` in `registry.json`.
- No `dangerouslySetInnerHTML`, no unescaped interpolation into HTML/attributes beyond a plain string `href` passed to Next's `Link` (which itself is not rendered as raw HTML) — no XSS surface identified in this component.
- No legal/compliance-relevant content (no tracking, no third-party network calls, no PII handling).

## Browser compatibility considerations

- Uses only standard, broadly-supported web platform features: `window.innerWidth`, `addEventListener('resize', …)`, CSS `transition`/`transform`, Tailwind arbitrary-value CSS, and Next.js's `styled-jsx` (`<style jsx>`), which compiles to scoped CSS at build time and carries no special runtime browser requirement.
- No WebGL, no Web Animations API, no experimental CSS features (e.g. no `:has()`, no container queries) — nothing here narrows the supported browser matrix beyond what the rest of the Next.js app already requires.

## What was checked and found clean

- `registry.json` schema conformance against `developer-new-component.md`: `name` ("link-button") matches the folder name exactly; `type` is `"registry:component"`; `category` is exactly `"buttons"`; `main` ("index.jsx") points at a file that exists; the single entry in `files` correctly targets `src/components/effects/link-button/index.jsx`; `previewUrl` (`/demo/link-button`) matches the actual demo route at `apps/docs/src/app/(marketing)/demo/link-button/page.js`; `tier` is a valid value (`"free"`); `exportName`/`exportKind` (`LinkButton`/`default`) match the actual `export default function LinkButton(...)` in the source.
- `registryDependencies: []` is correct — the component imports no other Hyperiux registry effect.
- `dependencies: ["lucide-react"]` correctly reflects the only third-party import in `index.jsx`.
- Event listener cleanup: the single `window.resize` listener added in `useLayoutEffect` is removed in that effect's cleanup function — [`index.jsx#L34-36`](../../../registry/effects/buttons/link-button/index.jsx). No leak.
- rAF suspension pattern: not applicable — no continuous `requestAnimationFrame` loop exists in this component, and `buttons` was not in the F-042 rollout scope per `registry/effects/_shared/README.md`.
- No SSR/hydration mismatch: default state values are identical between server render and initial client render; `useLayoutEffect` updates state before paint, so there's no flash of incorrect layout.
- Decorative icon accessibility: `lucide-react`'s `Icon` component auto-applies `aria-hidden="true"` when no children/a11y props are supplied, confirmed directly from the installed `lucide-react` source (`apps/docs/node_modules/lucide-react/dist/esm/Icon.js`).
- No hardcoded colors, consistent `vw`-based arbitrary values with ≤1 decimal place, `<span>` used for inline text inside the flex row, Next `Link` used instead of a raw `<a>` — all per `CODING_STANDARDS.md` §5.
- No secrets/credentials/tokens in any of the four files read.
- Public mirror drift: the `target` path differs between `registry.json` (`src/components/effects/link-button/index.jsx`) and `apps/docs/public/r/link-button.json` (`components/hyperiux/link-button/index.jsx`). Checked `apps/docs/scripts/build-registry.js#L258-260` and a second component's mirror (`scramble-link-button.json`) — this rewrite is applied uniformly by the build script to every component, not a link-button-specific defect, so it is **not** reported as a finding.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md` and this task's scope. Any actual fix must be verified not to alter UI, responsiveness, or registry behavior before being applied. In priority order:

1. Fix `registry/effects/buttons/link-button/package.json`'s `main`/`files` to reference `index.jsx` (or rename the entry point to match, whichever the maintainers standardize on) and re-run `npm pack` to regenerate a working tarball. Given the same pattern was observed in every other `buttons/*` package, this is likely worth a repo-wide sweep rather than a one-off fix — flagging for maintainer awareness, not fixing here (out of scope for this audit and for other effects).
2. Point the demo page (`apps/docs/src/app/(marketing)/demo/link-button/page.js`) at the actual registry component (or resync `apps/docs/src/components/link-button/index.jsx` with `registry/effects/buttons/link-button/index.jsx`, including removing its lingering `scale-150` class) so the public demo matches what ships. This has both a functional-correctness and a trust angle: the changelog claims a bug is fixed that is still visibly present on the live page.
3. Add a `motion-reduce:` (or `@media (prefers-reduced-motion: reduce)`) guard around the underline and icon transforms.
4. Replace the raw `href` in the `sr-only` string with a meaningful label, or drop it in favor of a proper `aria-label` on the `Link` when `btnText` alone isn't descriptive enough.
5. Document (or remove) the `<li>`-scoped `<style jsx>` rule; align the JS tablet breakpoint with the CSS breakpoints already used in the file.

## Final score: 6/10

## Overall severity label: High
