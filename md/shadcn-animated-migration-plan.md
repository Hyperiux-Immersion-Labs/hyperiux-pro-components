# shadcn-animated → Vault migration plan

Status, conventions and the remaining phases for bringing the 25 animated UI components from
the `shadcn-animated` (Hpx) project into Vault as free, publicly installable effects.

Last updated: 2026-10-22.

---

## Where we are

| Phase | What | Status |
|---|---|---|
| 0 | Port all 25 components to single files + Phase 0 demo pages | **Done** (type-check, lint and browser-load clean) |
| 1 | Review & QA each component | Not started |
| 2 | Registry sync (`component-ship.mjs registry`) | Not started |
| 3 | Codegen: global Remixer swap + Sanity JSX handoff | Not started |
| 4 | Distribution: `public/r`, npm tarball, free mirror | Not started |
| 5 | Site listing (Sanity entries, detail pages, previews) | Not started |
| 6 | Launch, then maintenance | Not started |

Nothing has been shipped to the registry yet. Every component lives only in
`apps/docs/src/components/animated-*/` with a draft demo at `/demo/animated-*`.

---

## Decisions already made

These were agreed with the owner and should not be revisited without asking.

| Decision | Choice |
|---|---|
| File shape | **One self-contained `index.tsx` per component.** Every local helper it needs (button, popover, select, calendar, icons…) is inlined. No shared local imports. |
| Tier / category | `free`, category `components` |
| Naming | No `Hpx` anywhere. Default export `Animated<Name>`; compound parts exported by plain name (`Accordion`, `AccordionItem`…). |
| Remixer parity | Every control from the source demo's panel is exposed, with the **source's labels, groups and defaults**. |
| Theme | Two remixer dropdowns on every component: **Theme** (`default`, `caffeine`, `claude`, `ghibli`, `spotify`, `valorant`, `vscode`) and **Mode** (`light`, `dark`). The theme also recolours the whole demo page. |
| External deps | npm packages are fine (installed by the user); local files are not. |

---

## The pattern every component follows

A ported file always has this shape, top to bottom:

1. `"use client"` and **npm imports only** (no `@/…`, no `next/*`).
2. Inline helpers: `cn` (built on `tailwind-merge`), `slotAttr`.
3. `THEMES`: the 7 palettes × 2 modes, **only the tokens this file uses**, as `--hx-*` variables.
4. `themeProps(theme, mode)` → `{ "data-theme", style }`, plus `ThemeContext` and `ThemeScope`.
5. Inlined dependencies (button, popover…), then the main component.
6. The source demo, turned into the default export's body (sample data included).
7. Default export `Animated<Name>({ theme, mode, className, ...controls })`, then named exports, including `getThemeProps`.

### Rules

| Rule | Why |
|---|---|
| Theme colours are `--hx-*` variables (`bg-(--hx-popover)`), never bare tokens like `bg-popover` | Our own `globals.css` defines `--primary` (orange) and `--muted`; bare tokens would leak our site colours in. |
| Anything rendered in a portal (`*Portal`, `createPortal`) is wrapped in `<ThemeScope>` | Portals render outside the themed root. `ThemeScope` is a `display: contents` div carrying the variables. |
| Dark styles use `in-data-[theme=dark]:` not `dark:` | The mode comes from the component's own `data-theme`, not the user's `<html class="dark">`. |
| Default border/outline colours come from a zero-specificity `[:where(&,&_*)]` rule on the root | The source app set these globally in its base layer. |
| State variants are plain data variants: `data-open:`, `data-checked:`, `data-[orientation=vertical]:` | The source's custom `hpx-*` variants live in its `globals.css`, which users won't have. |
| Enter/exit animations use Base UI's `data-starting-style:` / `data-ending-style:` | Replaces `tw-animate-css` classes (`animate-in fade-in-0 zoom-in-95…`), which users may not have. |
| `Reorder.Group axis` is `"x"` or `"y"` only | Our repo is on Motion 12; `"xy"` is Motion 13. |
| No server calls | Hover Card's link previews come from built-in sample data, not the source's `/api/link-preview` route. |
| No `next/*` | `next/link` → `<a>`; `next-themes` → a built-in `useTheme` that flips the component's own mode. |

---

## How to convert a component

The conversion is automated. The bundler lives in `apps/docs/scripts/shadcn-port/`.

```bash
# Source location (defaults to ~/Downloads/shadcn-animated/src)
export SHADCN_ANIMATED_SRC=~/Downloads/shadcn-animated/src

cd apps/docs
node scripts/shadcn-port/port.mjs scripts/shadcn-port/configs/<name>.json
```

It writes `src/components/<slug>/index.tsx` and, when the config has a `title`,
`src/app/(marketing)/demo/<slug>/page.tsx` + `DemoContent.tsx`.

### Config file

```json
{
  "slug": "animated-dialog",
  "exportName": "AnimatedDialog",
  "main": "components/ui/dialog.tsx",
  "demos": ["app/components/(default)/dialog/dialog-demo.tsx"],
  "demoFn": "HpxDialogDemo",
  "title": "Animated Dialog",
  "subtitle": "A window over the page that asks for a decision before you carry on."
}
```

Optional keys: `deps` (overrides automatic dependency resolution), `patches`
(`[from, to]` string pairs applied to the output, for one-off fixes), `schemaPrelude`
(code the controls schema needs that isn't a demo constant, e.g. an npm import),
`extraDemo` (wrapper code when the demo needs composing, see `sidebar.json`),
`panelClass`, `width`.

### What the bundler does

1. Resolves local imports recursively and orders them dependencies-first.
2. Inlines them, merging npm imports and renaming clashing top-level names.
3. Rewrites classes: tokens → `--hx-*`, `hpx-*` variants → data variants, `tw-animate` → Base UI styles, `dark:` → `in-data-[theme=dark]:`.
4. Strips `Hpx`/`hpx`/`HPX_` from every name.
5. Turns the demo's `useHpxControls(controls)` into props with the same defaults (`set()` still works).
6. Wraps portals in `ThemeScope`, applies `patches`, removes unused code.
7. Generates the draft remixer props (Theme, Mode, then every source control).

### After running it, always

```bash
npx tsc --noEmit -p tsconfig.json | grep animated-
npx eslint src/components/<slug> "src/app/(marketing)/demo/<slug>"
```

Then open `/demo/<slug>` and check the manual review list below. A first visit compiles the
route in dev and can take 15+ seconds, followed by one full reload. Wait for that before
judging the page; the `DemoHeader` Controls tab only behaves normally after it.

### Manual review (things the bundler can't judge)

- [ ] No `@/`, `next/`, `hpx` left: `grep -n 'from "@/\|from "next/\|hpx' index.tsx`
- [ ] Every popup (menu, popover, select, tooltip, dialog, drawer, toast) is themed in **dark mode** and in a coloured palette
- [ ] The demo's own heading was removed (our page renders its own)
- [ ] Nothing sits under the source site's navbar offset (`top-14`, `100svh-3.5rem`…)
- [ ] Interactions work: open/close, drag, keyboard, swipe
- [ ] `fixed` elements behave inside the demo frame (see `sidebar.json` for the transform trick)

---

## Phases to public release

### Phase 1 – Review & QA (per component)

Run `md/section-qc-checklist.md` sections 2–9 and 13 on each component. Points specific to this batch:

1. **Descriptions.** The generated remixer descriptions are just the control labels. Write a real one-line description for each prop (these become the docs props table).
2. **Reduced motion.** Most components wrap in `MotionConfig reducedMotion="user"`. Toast does not, a gap carried over from the source. Run the `reduced-motion-audit` agent.
3. **Remixer.** Run the `props-remixer-audit` agent against each demo.
4. **Responsive.** Check 1440 / 1024 / 390 widths. Source layouts use `max-[1025px]:` and `max-md:`, which is fine for demos.
5. **Corner radius.** Our site's Tailwind theme overrides `--radius-*`, so corners look rounder in our demos than in the source. Users get their own scale; decide whether that's acceptable or whether to hard-code radii.
6. **Cross-browser.** Chromium and WebKit were spot-checked during the port; still do Firefox and real Safari.
7. **Ownership/licensing.** Confirm the source project is ours to publish (Hpx = Hyperiux). Every npm dependency is MIT/ISC; record them per section 11 of the QC checklist.

**Exit criteria:** checklist signed off, descriptions written, no console errors.

### Phase 2 – Registry sync

Per component (see `md/new-component-workflow.md` Phase 1):

```bash
node scripts/component-ship.mjs registry --slug animated-<name> \
  --category components --tier free \
  --title "Animated <Name>" --description "<one line>"
```

- Props are drafted from the `props={[…]}` literal in `DemoContent.tsx`. Keep that literal plain JSON-like: the script evaluates it, and its regex stops at the first `]}`.
- Check `registry.json` → `dependencies` lists every npm package in the inventory table below.
- Free tier also syncs into `../hyperiux-components`. Make sure that repo is clean first.

**Exit criteria:** `registry/effects/components/animated-*/` exists for all 25; `public/r/<slug>.json` embeds full source.

### Phase 3 – Codegen

```bash
node scripts/component-ship.mjs codegen --slug animated-<name>
```

- Swaps `LocalRemixerDemo` → `RegistryRemixerDemo` and adds the `registry.json` import to `page.tsx`. Our demos pass `render={…}` rather than `component`; check the swap keeps it.
- Paste the generated type-stripped JSX into Sanity Studio by hand.

### Phase 4 – Distribution

There are two pipelines, and both must be updated. They read different files, so updating one doesn't update the other:

1. `public/r/*.json`: built from each `registry.json`, written by Phase 2.
2. npm tarballs in `registry/dist`: built with `npm pack` from each `package.json`. Refresh with `component-ship.mjs update --slug <slug> --no-version-bump` (it also reorders `dist/registry-index.json`), or `npm run build:registry:dist`.

Then **test a real install** in a clean Next.js + Tailwind v4 project, with no shadcn and no `tw-animate-css`:

```bash
npx hyperiux add animated-<name>
npm i <deps from the table below>
```

The component must render, theme (including popups) and animate with nothing else configured.

### Phase 5 – Site listing

- Sanity effect entries (title, category, description, preview media), via the manual Sanity step.
- Effect detail pages and thumbnails/preview videos.
- `getDemoPageMetadata` currently falls back to the slug; confirm titles once Sanity entries exist.

### Phase 6 – Launch & maintenance

- Release in batches (suggested order in the inventory table), not all 25 at once, so install and limit tracking issues surface early.
- When the source project changes: re-run `port.mjs` for the component, review the diff, then `component-ship.mjs update` with a version bump per `md/versioning.md`.

---

## Component inventory

All are `free`, category `components`. "Deps" are the npm packages the single file imports
(`react` and `react-dom` are assumed). Every file except Radio and Checkbox also needs
`tailwind-merge`, which is left out of the column.

| Component | Slug | Lines | Remixer props | Deps | Batch |
|---|---|---|---|---|---|
| Radio Group | `animated-radio-group` | 655 | 12 | motion | 1 |
| Checkbox Group | `animated-checkbox-group` | 967 | 20 | motion | 1 |
| Switch | `animated-switch` | 776 | 12 | @base-ui/react, motion | 1 |
| Tabs Bar | `animated-tabs-bar` | 821 | 15 | @base-ui/react, motion | 1 |
| Slider | `animated-slider` | 1,327 | 18 | @base-ui/react, motion | 1 |
| Accordion | `animated-accordion` | 914 | 15 | @base-ui/react, motion | 1 |
| Tooltip | `animated-tooltip` | 1,019 | 16 | lucide-react, motion | 1 |
| Button | `animated-button` | 1,539 | 16 | lucide-react, motion | 1 |
| Skeleton | `animated-skeleton` | 777 | 10 | @base-ui/react, cva, lucide-react, motion | 2 |
| Dialog | `animated-dialog` | 1,007 | 16 | @base-ui/react, cva, lucide-react, motion | 2 |
| Drawer | `animated-drawer` | 1,039 | 13 | @base-ui/react, cva, motion | 2 |
| Hover Card | `animated-hover-card` | 942 | 12 | @base-ui/react, cva, lucide-react, motion | 2 |
| Input OTP | `animated-input-otp` | 945 | 11 | @base-ui/react, cva, input-otp, lucide-react, motion | 2 |
| Theme Switch | `animated-theme-switch` | 689 | 7 | @base-ui/react, cva, gsap, lucide-react, motion | 2 |
| Toast | `animated-toast` | 1,363 | 18 | @base-ui/react, cva, lucide-react, motion | 2 |
| Dropdown Menu | `animated-dropdown-menu` | 1,824 | 18 | @base-ui/react, cva, gsap, motion | 3 |
| Command Menu | `animated-command-menu` | 1,377 | 17 | @base-ui/react, cmdk, cva, lucide-react, motion | 3 |
| Chat Bubble | `animated-chat-bubble` | 2,091 | 20 | @base-ui/react, cva, lucide-react, motion | 3 |
| Attachment | `animated-attachment` | 1,647 | 21 | @base-ui/react, @gsap/react, cva, gsap, lucide-react, motion | 3 |
| Date Picker | `animated-date-picker` | 1,763 | 24 | @base-ui/react, cva, date-fns, lucide-react, motion, react-day-picker | 3 |
| Form Fields | `animated-form-fields` | 2,291 | 10 | @base-ui/react, cva, gsap, libphonenumber-js, motion, zod | 4 |
| Menubar | `animated-menubar` | 2,942 | 24 | @base-ui/react, lucide-react, motion | 4 |
| Questionnaire | `animated-questionnaire` | 2,867 | 18 | @base-ui/react, cva, motion | 4 |
| Data Table | `animated-data-table` | 2,622 | 34 | @base-ui/react, cva, gsap, lucide-react, motion | 4 |
| Sidebar | `animated-sidebar` | 4,043 | 15 | @base-ui/react, cva, lucide-react, motion | 4 |

`cva` = `class-variance-authority`. Batches go from fewest dependencies and simplest
behaviour (1) to the largest, most composed components (4).

Versions installed in `apps/docs` for this work: `@base-ui/react@1.8.0`,
`react-day-picker@10.0.1`, `date-fns@4.4.0`, `class-variance-authority@0.7.1`,
`cmdk@1.1.1`, `input-otp@1.5.0`, `libphonenumber-js@1.13.14`.

---

## Known gaps and decisions still open

| Item | Detail | Owner decision needed? |
|---|---|---|
| Motion 12 vs 13 | `Reorder` 2-D drag is downgraded to one axis (Radio, Checkbox, Attachment wrap mode). Upgrading Motion repo-wide would restore it but touches every effect. | Yes |
| Corner radius scale | See Phase 1, item 5. | Yes |
| Remixer descriptions | Currently the control labels. | No, just Phase 1 work |
| Hover Card previews | Built-in sample data; `loadPreview()` is the swap point for a real endpoint. | No |
| Theme Switch | Flips the component's own mode, not the user's site theme. Document how to wire it to their theme provider. | No |
| File size | Sidebar is ~4k lines (≈1.3k are its 9 demo icons). Consider trimming demo-only icons from the shipped file. | Maybe |
| `getThemeProps` export | Extra public API so pages can match the palette. Keep, and document it. | No |
| Toast reduced motion | Not handled in the source either. | No, fix in Phase 1 |
| Dev first-load | First visit to a route compiles for 15+ s, then reloads once; production builds don't do this. | No |

## Related

- `md/new-component-workflow.md`: ship pipeline phases
- `md/section-qc-checklist.md`: QC checklist used in Phase 1
- `md/versioning.md`: version bumps and the CLI lock file
- `md/remixer-panel.md`, `md/remixer-effect-props.md`: remixer prop format
