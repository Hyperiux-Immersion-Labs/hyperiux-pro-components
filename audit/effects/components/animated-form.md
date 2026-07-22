# animated-form (components)

## Summary

`animated-form` is a config-driven, Zod-validated contact form (`Input`/`Textarea`/`Select`/`PhoneInput`/`Checkbox`/`Button` primitives composed by `ContactForm`, driven by a `fields` array). The registry packaging (`registry.json`) is complete and internally consistent — name, category, `main`, and `files` all check out against `developer-new-component.md`. However, the component's own default validation schema is broken for the majority of the international phone-number country options it ships (Critical), the custom `Select` dropdown leaves invisible option buttons in the keyboard tab order when closed (High, accessibility), the `Checkbox` has no accessible name for screen readers (High, accessibility), and `package.json` is misconfigured in a way that would break `npm pack` distribution (High, registry/packaging). The docs-site demo also renders a legacy copy of the component (`apps/docs/src/components/animated-form`) that has already drifted from the registry source in four files, so the live preview does not reliably represent what the CLI installs.

## Implementation overview

- `registry/effects/components/animated-form/index.jsx` — default export `AnimatedForm`, defines a demo `FIELDS` config and a Zod `contactSchema`, renders `<ContactForm fields={FIELDS} schema={contactSchema} onSubmit={submitHandler} />`.
- `ContactForm.jsx` — orchestrates state (`values`, `errors`, `isLoading`, `submitted`, `failed`), runs either the supplied Zod `schema` or a built-in `defaultValidate` fallback, and switches on `field.type` to render one of `Input` / `Textarea` / `Select` / `PhoneInput` / `Checkbox`.
- `Input.jsx`, `Textarea.jsx` — floating-label text fields using Tailwind's `has-[+input:not(:placeholder-shown)]` CSS trick (no JS needed for the label float).
- `Select.jsx` — custom (non-native) dropdown built from buttons; opens/closes local `useState`, closes on outside `mousedown`.
- `PhoneInput.jsx` — a country-code combobox (`COUNTRY_CODES`, 10 entries) + national-number `<input type="tel">`; closes on outside `pointerdown`.
- `Checkbox.jsx` — a `role="checkbox"` `<button>` with a separately rendered label `<div>`.
- `Button.jsx` — submit button with an inline spinner while `isLoading`.
- No WebGL, no continuous `requestAnimationFrame` loop anywhere in this effect — it is a plain form.

## Strengths

- Zod-first validation with a documented fallback (`defaultValidate`) for consumers who don't pass a `schema` — good API design for a reusable form primitive (`ContactForm.jsx#L112-138`).
- Errors are wired to `aria-invalid`/`aria-describedby` consistently across `Input`, `Textarea`, `Select`, `PhoneInput`, and `Checkbox`.
- Outside-click handling (`Select.jsx#L14-22`, `PhoneInput.jsx#L62-76`) is implemented with a `useEffect` cleanup in both cases — no listener leak.
- `useId()` is used for the section id in `ContactForm.jsx#L82-83`, avoiding hardcoded/duplicate DOM ids if the form is rendered more than once on a page.
- `registry.json` accurately lists every file that exists on disk and nothing that doesn't — verified by diffing the `files` array against `ls` output of the folder.

## Risks and issues

### 1. [Critical] Phone validation schema is wrong for most of the countries the widget itself offers
`registry/effects/components/animated-form/index.jsx#L48-50` hardcodes:
```js
.refine((val) => nationalDigits(val).length === 10, { message: "Phone number must be 10 digits." })
```
But `PhoneInput.jsx#L5-16` (`COUNTRY_CODES`) lets the user pick from 10 countries whose real national-number lengths are **not** all 10 digits: AU mobile numbers are 9 digits, DE mobile numbers are commonly 11, FR mobile numbers are 9, AE mobile numbers are 9, SG numbers are 8. A user who correctly enters a real Australian, German, French, Emirati, or Singaporean phone number will be told "Phone number must be 10 digits." and cannot submit the form — the schema and the widget it validates disagree about what "valid" means for 5 of the 10 countries the widget itself exposes. This is the packaged demo's own default schema (`index.jsx`), so any consumer who copies the example as-is inherits the broken validation.
- Failure scenario: select "France" in the phone country dropdown, enter a real 9-digit French mobile number → `nationalDigits` strips the `+33 ` prefix, counts 9 digits, `.refine` fails, form shows "Phone number must be 10 digits." and blocks submission indefinitely.

### 2. [High] `Select` leaves invisible dropdown options in the keyboard tab order when closed
`Select.jsx#L76-108`: the options dropdown `<div>` is **always mounted** in the DOM; only `opacity-0 scale-95 -translate-y-2 pointer-events-none` classes are toggled when `open` is `false` (no `hidden` attribute, no `display:none`, no `tabIndex={-1}`/`inert` on the closed state). `pointer-events-none` blocks mouse/touch, but the `<button>` elements inside remain natively focusable. A sighted mouse user never sees a problem, but a keyboard user tabbing through the form will tab from the `Select` trigger straight into a stack of invisible, unstyled option buttons before reaching the next real field, with no visual indication of where focus is.
- Failure scenario: Tab to "Topic" select, press Tab again (without opening the dropdown) → focus silently lands on the invisible "General Inquiry" option button; visually nothing appears focused, disorienting keyboard-only users navigating the form.

### 3. [High] `Checkbox` has no accessible name for screen readers
`Checkbox.jsx#L20-61`: the interactive element is `<button role="checkbox" aria-checked={checked} ...>` containing only a checkmark `<svg>` (rendered conditionally, only when checked). The label text is a sibling `<div>` with no `id`, and the button has no `aria-label`/`aria-labelledby` pointing to it. A screen reader landing on this control — the required "I agree to the Terms" checkbox — announces only "checkbox, not checked" with no discernible name, because the button's accessible name computation has nothing to draw from when unchecked (and even when checked, its only content is a decorative SVG, not text).
- Failure scenario: a VoiceOver/NVDA user tabs to the required `terms` checkbox and hears "not checked, checkbox" with no label — they cannot tell what they are (dis)agreeing to without additional exploration, on a field required to submit.

### 4. [High] `package.json` is broken relative to the documented packaging step
`registry/effects/components/animated-form/package.json#L1-9`:
```json
{
  "name": "@hyperiux/form",
  "main": "form.jsx",
  "files": ["form.jsx", "registry.json"],
  ...
}
```
Per `developer-new-component.md` Step 5, `name` must be `@hyperiux/{slug}` — here it should be `@hyperiux/animated-form`, not `@hyperiux/form`. More importantly, `main` points at `form.jsx`, and `files` only lists `form.jsx` and `registry.json` — **no file named `form.jsx` exists anywhere in this folder** (confirmed via `ls`; the actual entry point is `index.jsx`, and the component has 7 additional sub-files: `Button.jsx`, `Checkbox.jsx`, `ContactForm.jsx`, `Input.jsx`, `PhoneInput.jsx`, `Select.jsx`, `Textarea.jsx`, none of which are in `package.json`'s `files` whitelist). Per `developer-new-component.md`'s Step 9 (`npm pack`), npm's `files` field is a whitelist — a tarball built from this `package.json` would omit every real source file and include a `main` pointing at a file that doesn't exist, producing a non-functional npm package.

### 5. [Medium] Demo page renders a legacy copy that has drifted from the registry source
`apps/docs/src/app/(marketing)/demo/animated-form/page.js#L4` imports `AnimatedForm` from `@/components/animated-form` — the docs-site legacy copy under `apps/docs/src/components/animated-form/`, not the registry copy that ships via the CLI/`public/r/animated-form.json`. Diffing the two trees shows 4 of 8 files have diverged:
- `Button.jsx` — legacy adds an `id`/`autoId` prop not present in the registry version.
- `Input.jsx` — legacy adds a `useId()`-based fallback id and a `labelBg` prop; registry version has neither.
- `PhoneInput.jsx` — legacy changes dropdown styling (`rounded-md` vs `rounded-2xl`) and wraps options in a scroll container with `onWheelCapture` that the registry version lacks.
- `Select.jsx` — legacy changes selected-option text color and adds a `text-sm!` important modifier.

Per `developer-new-component.md#L26-30`, `src/components/` and `registry/effects/` are meant to be two synced copies ("You build in `src/components/`, then copy the source into `registry/effects/`"), but nothing enforces that sync after the initial copy. The practical effect: what a visitor sees on `/demo/animated-form` is not what `npm install`/the CLI actually delivers, and neither copy is confirmed as the "current" one.

### 6. [Medium] No `prefers-reduced-motion` handling anywhere in the effect
None of the 8 source files reference `prefers-reduced-motion` (`grep` confirms no matches). All transitions are short CSS `transition-all`/`duration-200`/`duration-300` on hover/focus/scale (`Button.jsx#L36-37`, `Select.jsx#L80`, `PhoneInput.jsx#L131`), so the impact is bounded (no large-scale or vestibular-triggering motion), but per the audit rubric this is called out explicitly as a Medium finding regardless of magnitude.

### 7. [Low] `Select` trigger is missing `aria-expanded`/`aria-haspopup`
`Select.jsx#L35-41`: the trigger `<button>` sets `aria-invalid` and `aria-describedby` but never `aria-expanded={open}` or `aria-haspopup="listbox"`. Contrast with `PhoneInput.jsx#L109-110`, which does set both on its country-picker trigger. Screen reader users get no signal that the Select button opens a popup or whether it is currently open — a smaller version of finding #2 above, worth fixing alongside it.

### 8. [Low] Inconsistent `"use client"` directive usage
`PhoneInput.jsx#L1` declares `"use client"` because it uses hooks. `Select.jsx` also uses `useState`/`useRef`/`useEffect` (`Select.jsx#L2`) but has no `"use client"` directive at all. This currently works only because `ContactForm.jsx#L2` (the parent) already declares `"use client"`, pulling `Select` into the client bundle transitively — but it's a latent trap if `Select.jsx` is ever imported directly into a server component elsewhere, and it's inconsistent with `CODING_STANDARDS.md`'s prescribed file-structure ordering (`"use client"` first, when needed).

### 9. [Low] Placeholder `href="#"` in the shipped demo content
`index.jsx#L25`: the terms checkbox label is `<>I agree to the <a href="#" className="underline">Terms</a>.</>` — a dead link left in the example `FIELDS` config that ships as the reference implementation.

### 10. [Low] Dangling/incomplete JSDoc header
`ContactForm.jsx#L4-9` starts a JSDoc block describing `fields: FieldConfig[]` ("Each object can be:") and then cuts off with no list before jumping to the next paragraph — an incomplete comment left over from editing.

## Accessibility assessment

Mixed. Text-style fields (`Input`, `Textarea`) correctly wire `aria-invalid`/`aria-describedby` and use real `<label htmlFor>` elements, which is solid. The two custom-widget fields are the weak point: `Select` keeps hidden option buttons focusable when closed (#2, High) and lacks `aria-expanded`/`aria-haspopup` (#7, Low); `Checkbox` has no accessible name at all (#3, High). `PhoneInput`'s country combobox is comparatively better-built (conditional rendering when closed, `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`/`role="option"` on the dropdown), which underscores that the gaps in `Select`/`Checkbox` are inconsistency rather than a hard technical constraint — the same pattern already exists correctly elsewhere in this same component tree.

## Performance assessment

No continuous animation loop and no `requestAnimationFrame` usage anywhere in this effect (verified across all 8 files) — the rAF-suspension cross-check (`createSuspendedRaf`/`createVisibilityGate`) is **not applicable** here, consistent with the audit brief's note to only flag it where a genuine rAF loop exists. The two outside-click listeners (`Select.jsx#L20-21`, `PhoneInput.jsx#L71-75`) are registered once per mount and cleaned up correctly. No unbounded loops, no observable memory-leak pattern found in a static read (no way to runtime-profile from a code read alone — noted as unconfirmed by any automated test, since none exists for this effect).

## SEO and content-surface assessment

The component itself renders no metadata; `page.js#L17-19` delegates to `getDemoPageMetadata("animated-form")`, which was not opened as part of this scope (it lives outside the four required files) — assumed to follow the same pattern used across other demo routes. Content-wise, the only issue is the placeholder `href="#"` Terms link noted in finding #9.

## Responsive / mobile / touch behavior assessment

`index.jsx#L66-67` scales the form container width down through `max-md:w-[90%] max-sm:w-[95%]`, and `ContactForm.jsx#L250` swaps `space-y-[1.2vw]` for `max-sm:space-y-[4vw] max-md:space-y-[4vw]` — consistent with `CODING_STANDARDS.md`'s `max-sm:`/`max-md:` prefix convention. Touch-target sizing (`h-14` inputs, `w-5 h-5` checkbox target with generous click padding via the surrounding flex row) looks reasonable. One minor inconsistency: `PhoneInput.jsx#L71` listens on `pointerdown` (covers touch and mouse uniformly) while `Select.jsx#L20` listens on `mousedown` (browsers synthesize a mouse event after touch, but with more latency/inconsistency than `pointerdown`) — not a confirmed break, just an inconsistent choice between two sibling components solving the same outside-click problem.

## Maintainability and code-quality assessment

Generally readable and modular (one primitive per file, consistent `forwardRef` pattern, clear prop tables in JSDoc comments on `Input`/`Textarea`/`Button`/`Checkbox`). Deviations from `CODING_STANDARDS.md`: the dangling JSDoc in `ContactForm.jsx` (#10), inconsistent `"use client"` placement (#8), and inconsistent indentation style between files (`Input.jsx`/`Select.jsx`/`Textarea.jsx`/`Checkbox.jsx`/`Button.jsx` use single-space indentation throughout, while `ContactForm.jsx`/`PhoneInput.jsx` use standard 2-space indentation) — a formatting/tooling inconsistency, not called out as its own numbered finding since it's cosmetic, but visible in every file diff above.

## Security and dependency concerns

No secrets, tokens, or API keys in source. No `dangerouslySetInnerHTML` or raw HTML injection anywhere in the 8 files. The only JSX passed as data (`terms` checkbox `label`) is authored statically in `index.jsx` itself, not derived from user input or an external source, so there is no XSS vector there. `registry.json#L8-10` declares `zod` as the only npm dependency, which matches the only external import (`index.jsx#L3`).

## Browser compatibility considerations

`Input.jsx`/`Textarea.jsx` float their labels using the Tailwind `has-[+input:not(:placeholder-shown)]` selector, which compiles to CSS `:has()`. This requires Chrome/Edge 105+, Safari 15.4+, or Firefox 121+ (Firefox shipped `:has()` support in late 2023). On older browsers the label simply won't float/shrink on input — a graceful visual degradation, not a functional break, but worth noting since it's not mentioned anywhere in the source as a known constraint.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches the folder (`animated-form`), `type` is exactly `"registry:component"`, `category` is exactly `"components"` (a valid enum value), `main` (`index.jsx`) exists on disk, `tier` is `"pro"` (a valid value), and every file under the folder is listed in `files` with a correct `target` — no missing and no extra entries.
- `previewUrl` (`/demo/animated-form`) matches the actual demo route at `apps/docs/src/app/(marketing)/demo/animated-form/page.js`.
- No stray/duplicate entry-point files in the registry folder (only one `index.jsx`), so the `build-registry.js` entry-point-detection footgun documented in `developer-new-component.md` ("Leaving a stale duplicate source file lying around") does not apply here.
- `apps/docs/public/r/animated-form.json` mirror is structurally consistent with `registry.json` (same file list, same `tier`, same `exportName`/`exportKind`) — no drift between registry.json and its generated public mirror.
- Outside-click listeners in `Select.jsx` and `PhoneInput.jsx` are both registered and cleaned up correctly (`useEffect` return functions present in both).
- No continuous `requestAnimationFrame` loop exists in this effect, so rAF-suspension-on-hidden is genuinely not applicable (not just unimplemented).
- No hardcoded colors that bypass a `className`/prop override mechanism were found beyond standard Tailwind gray/black/red/green palette classes consistent with the rest of the design system (no site-specific tokens).
- No secrets, credentials, or unescaped HTML injection anywhere in the 8 files.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If addressed, recommended order:

1. Fix the phone validation (#1, Critical) — either derive the expected digit count per selected country (a small lookup table keyed by `COUNTRY_CODES.code`) or relax the schema to a sane min/max range instead of an exact `=== 10`. Any fix must not change the visual layout or the `PhoneInput` value format (`"+<dial> <number>"`) that `nationalDigits()` and downstream consumers depend on.
2. Fix `Select`'s closed-state focusability (#2, High) — conditionally render the options list (matching `PhoneInput`'s already-correct pattern) or add `hidden`/`inert` when closed, being careful not to break the existing open/close CSS transition.
3. Give `Checkbox` an accessible name (#3, High) — associate the label via `aria-labelledby` (give the label `<div>` an `id`) or wrap both in a `<label>`, without altering the existing click/keyboard toggle behavior.
4. Correct `package.json` (#4, High) — rename to `@hyperiux/animated-form`, fix `main` to `index.jsx`, and expand `files` to cover all real source files, verified with a real `npm pack --dry-run` before re-packing.
5. Resolve the demo/registry drift (#5, Medium) — decide which copy (`apps/docs/src/components/animated-form` vs `registry/effects/components/animated-form`) is canonical and re-sync the other, or point the demo page at the registry copy directly.
6. Add `prefers-reduced-motion` guarding around the hover/scale/transition classes (#6, Medium) — low-risk since transitions are already short and CSS-only.
7. Address the Low-severity polish items (#7–#10) opportunistically during the above work rather than as standalone changes.

## Final score: 5/10

## Overall severity label: Critical
